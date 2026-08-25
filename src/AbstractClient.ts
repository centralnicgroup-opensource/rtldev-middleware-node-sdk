/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { toAscii, toUnicode } from "idna-uts46-hx";
import { EchoSink } from "./EchoSink.js";
import { HttpTransport } from "./HttpTransport.js";
import { VERSION } from "./version.js";
import type {
  AbstractSocketConfig,
  PostDataParams,
} from "./AbstractSocketConfig.js";
import type { LoggerInterface } from "./LoggerInterface.js";
import type { LogSinkInterface } from "./LogSinkInterface.js";
import type { ResponseInterface } from "./ResponseInterface.js";
import type { System } from "./System.js";
import type {
  RequestOptions,
  TransportInterface,
} from "./TransportInterface.js";
import type { ApiCommand, Hash, StringHash } from "./types.js";

/**
 * Connection config used for one request: the endpoint requests are sent to
 * for this call (config host + brand path, plain string concatenation —
 * deliberately not `new URL()`, which resolves relative segments
 * differently; the trailing slash on every brand host is load-bearing).
 */
export type RequestConfig = {
  CONNECTION_URL: string;
};

/**
 * Shared foundation for all registrar API clients.
 * Concrete subclasses provide the `request()` implementation, the default
 * logger, and the appropriate SocketConfig subtype.
 *
 * ## Where configuration lives
 *
 * Not here. Connection configuration has one home — `AbstractSocketConfig` —
 * reachable through {@link getSocketConfig} and supplyable through
 * {@link constructor}. What lives here is client *behaviour*: the logger and
 * debug flag, the response context, the transport instance, and the SDK's
 * own identity (`VERSION`/`userAgent`). Do not add a copy of a config-owned
 * value here (decision #4) — e.g. `setProxy()` below forwards to the config
 * and stores nothing of its own, so `getProxy()` can never disagree with
 * what actually reaches the wire. Since RSRMID-2966 the constructor covers
 * the one case the accessor could not — configuring a client before it
 * exists — so a forwarder still carries no capability of its own.
 *
 * The configuration methods below are forwarders, and deliberately kept: they
 * are the documented ergonomic surface
 * (`client.useOTESystem().setCredentials(...)`) and they read/write the
 * config's own state rather than a copy of it.
 *
 * Only capabilities every brand can actually honour live here. In particular
 * sessions and role credentials do **not** — API sessions are a CNR concept
 * and live on `CNR.Client` beside the state they read (decision #7). Do not
 * hoist them back up.
 */
export abstract class AbstractClient {
  /**
   * Context data for the client.
   */
  protected context: Hash = {};

  /**
   * Object covering API connection data — the one home for connection
   * configuration; see {@link getSocketConfig}.
   */
  protected socketConfig: AbstractSocketConfig;

  /**
   * Activity flag for debug mode.
   */
  protected debugMode = false;

  /**
   * User agent sent with every request. Empty until {@link setUserAgent} is
   * called; while it is empty {@link getUserAgent} derives the SDK default.
   */
  protected userAgent = "";

  /**
   * Logger instance for debug mode.
   */
  protected logger: LoggerInterface;

  /**
   * HTTP transport layer.
   */
  protected transport: TransportInterface;

  /**
   * @param socketConfig connection configuration to adopt; `null` has the
   *   brand build its default via {@link newSocketConfig}. Purely additive
   *   (RSRMID-2966): omitting it seeds the config exactly as before — its
   *   own constructor selects LIVE (the default system) and the brand's
   *   default request options, no client-side URL copy needed either way.
   *   A supplied config is adopted *by reference*, never cloned —
   *   {@link getSocketConfig} hands back the caller's own instance, so a
   *   write through either route stays visible through the other. A
   *   defensive clone would reintroduce the two-homes drift decision #4
   *   closed, in the form of a silent copy. Brands narrow this parameter to
   *   their own config subtype (see `CNR.Client`'s constructor) so a
   *   cross-brand config is a compile-time error at the call site, not a
   *   runtime one.
   */
  public constructor(socketConfig: AbstractSocketConfig | null = null) {
    this.transport = this.newTransport();
    this.socketConfig = socketConfig ?? this.newSocketConfig();
    this.logger = this.newLogger(new EchoSink());
  }

  /**
   * The connection configuration this client uses — the accessor that means a
   * new setting needs no forwarder, and the seam that lets configuration be
   * built and asserted without constructing a client.
   *
   * Brands narrow the return type covariantly where they have their own
   * config capabilities — `CNR.Client.getSocketConfig()` returns the CNR
   * config, which is the one place the invariant property type is narrowed.
   */
  public getSocketConfig(): AbstractSocketConfig {
    return this.socketConfig;
  }

  /**
   * Perform API request using the given command.
   *
   * The shared request lifecycle lives in {@link performRequest}; each
   * brand's public `request()` is a thin wrapper that pins its default `path`
   * and declares a concrete Response return type. Every brand accepts an
   * optional `path` appended to the configured base URL to select the
   * endpoint: for IBS/Moniker the path selects the operation (e.g.
   * `Domain/Create`); for CNR it defaults to the single fixed script path
   * (`api/call.cgi`) and rarely varies. The signature is symmetric across all
   * brands.
   *
   * Async only because of the network step it eventually reaches
   * ({@link executeCurl}) — everything before that (command building,
   * translation, parsing, Response construction) stays synchronous, because
   * the Response's sealed-on-construction invariant depends on the
   * constructor doing the whole assembly and a constructor cannot be async.
   */
  public abstract request(
    cmd?: ApiCommand,
    path?: string,
  ): Promise<ResponseInterface>;

  /**
   * Shared request lifecycle (template method). Never reimplement it in a
   * brand; vary it through exactly two hooks — {@link buildCommand} (command
   * flattening) and {@link newResponse} (covariant Response factory) — plus
   * the {@link newSocketConfig} subtype.
   *
   * Brand-specific command rewriting belongs behind `buildCommand()`, not
   * here: CNR's IDN conversion lives in `CNR.IDNCommandRewriter`.
   */
  protected async performRequest(
    cmd: ApiCommand,
    path = "",
  ): Promise<ResponseInterface> {
    const mycmd = this.buildCommand(cmd);
    const cfg: RequestConfig = {
      CONNECTION_URL: `${this.socketConfig.getURL()}${path}`,
    };
    const data = this.getPOSTData(mycmd);
    const [raw, error] = await this.executeCurl(data, cfg);
    const response = this.newResponse(raw, mycmd, cfg, error);
    if (this.debugMode) {
      this.logger.log(this.getPOSTData(mycmd, true), response, error);
    }
    return response;
  }

  /**
   * Flatten and normalise the given command into wire form.
   * Brand-specific: CNR flattens as-is; IBS injects `ResponseFormat=JSON`.
   */
  protected abstract buildCommand(cmd: ApiCommand): StringHash;

  /**
   * Instantiate the brand Response for the given raw payload.
   * Return type is covariant so each brand pins its concrete Response.
   *
   * @param cmd flattened command that produced the response
   * @param cfg connection config used for the request
   * @param error transport error, if any; non-null means `raw` is unusable and the brand's "httperror" template is substituted instead
   */
  protected abstract newResponse(
    raw: string,
    cmd: StringHash,
    cfg: RequestConfig,
    error?: string | null,
  ): ResponseInterface;

  /**
   * Instantiate the SocketConfig for this client.
   * Subclasses return their own SocketConfig subtype.
   */
  protected abstract newSocketConfig(): AbstractSocketConfig;

  /**
   * Instantiate the HTTP transport for this client. The default is the
   * production transport; override or {@link setTransport} to inject a test
   * double so the `request()` lifecycle can run offline.
   */
  protected newTransport(): TransportInterface {
    return new HttpTransport();
  }

  /**
   * Inject a custom HTTP transport (e.g. a record/replay cassette transport
   * for offline tests) in place of the default {@link HttpTransport}.
   */
  public setTransport(transport: TransportInterface): this {
    this.transport = transport;
    return this;
  }

  /**
   * The transport this client posts through — the read half of
   * {@link setTransport}, mirroring {@link getSocketConfig}.
   */
  public getTransport(): TransportInterface {
    return this.transport;
  }

  /**
   * Instantiate the brand's logger, writing to the given sink. An override
   * must honour `sink` — that is what makes {@link setLogSink} work for a
   * subclass.
   */
  protected abstract newLogger(sink: LogSinkInterface): LoggerInterface;

  /**
   * Route debug output somewhere other than standard output, keeping this
   * brand's format.
   *
   * Passing a fresh {@link EchoSink} restores the shipped default, discarding
   * any logger set via {@link setCustomLogger}.
   */
  public setLogSink(sink: LogSinkInterface): this {
    this.logger = this.newLogger(sink);
    return this;
  }

  /**
   * Set custom logger to use instead of the default one — use this to replace
   * the *format* as well as the destination. Extend `AbstractLogger` (format
   * only) or implement `LoggerInterface` (format and destination) directly.
   */
  public setCustomLogger(customLogger: LoggerInterface): this {
    this.logger = customLogger;
    return this;
  }

  /**
   * The logger this client writes debug records through — the read half of
   * {@link setCustomLogger}/{@link setLogSink}, mirroring {@link getSocketConfig}.
   */
  public getLogger(): LoggerInterface {
    return this.logger;
  }

  /**
   * Enable debug output to STDOUT.
   */
  public enableDebugMode(): this {
    this.debugMode = true;
    return this;
  }

  /**
   * Disable debug output.
   */
  public disableDebugMode(): this {
    this.debugMode = false;
    return this;
  }

  /**
   * Serialize given command for POST request including connection configuration data.
   */
  public getPOSTData(cmd: PostDataParams, maskSecrets = false): string {
    return this.socketConfig.getPOSTData(cmd, maskSecrets);
  }

  /**
   * Get the API connection url that is currently set.
   */
  public getURL(): string {
    return this.socketConfig.getURL();
  }

  /**
   * Set the request timeout in seconds (default 300).
   *
   * The **only** way to change the timeout: the request-options bag rejects
   * the timeout knob at the type level (see `TransportInterface.RequestOptions`)
   * rather than quietly overriding what {@link getSocketTimeout} reports.
   *
   * @param timeoutSeconds 0 carries the "no timeout" meaning
   * @throws InvalidConfigurationException on a negative value
   */
  public setSocketTimeout(timeoutSeconds: number): this {
    this.socketConfig.setSocketTimeout(timeoutSeconds);
    return this;
  }

  /**
   * Get the request timeout in seconds currently configured.
   */
  public getSocketTimeout(): number {
    return this.socketConfig.getSocketTimeout();
  }

  /**
   * Set a custom user agent (for platforms that use this SDK).
   *
   * @param modules further modules to add to user agent string
   */
  public setUserAgent(
    label: string,
    revision: string,
    modules: string[] = [],
  ): this {
    const mods = modules.length === 0 ? "" : ` ${modules.join(" ")}`;
    this.userAgent =
      `${label} (${process.platform}; ${process.arch}; rv:${revision})${mods} ` +
      `node-sdk/${this.getVersion()} node/${process.version}`;
    return this;
  }

  /**
   * Get the user agent string — the one set via {@link setUserAgent}, or the
   * SDK default when none was.
   *
   * A pure read — keep it that way. Memoising the default into `userAgent`
   * would make a getter write during a request, and there is nothing worth
   * memoising.
   */
  public getUserAgent(): string {
    if (this.userAgent !== "") {
      return this.userAgent;
    }
    return `NODE-SDK (${process.platform}; ${process.arch}; rv:${this.getVersion()}) node/${process.version}`;
  }

  /**
   * Merge additional request options into the bag, overriding existing values
   * on key collision. Forwards to `AbstractSocketConfig.setExtraRequestOptions()`.
   * The keys the SDK already models (timeout, the request envelope) are
   * refused at the type level via `TransportInterface.RequestOptions` rather
   * than a runtime rejection list — see the Transport seam docs.
   */
  public setExtraRequestOptions(opts: RequestOptions): this {
    this.socketConfig.setExtraRequestOptions(opts);
    return this;
  }

  /**
   * Restore the request-options bag to the brand defaults, discarding
   * anything previously handed to {@link setExtraRequestOptions}. Options
   * only — the proxy and referer are separate state and survive.
   */
  public resetRequestOptions(): this {
    this.socketConfig.resetRequestOptions();
    return this;
  }

  /**
   * Set proxy to use for API communication.
   *
   * @param proxy empty string resets it, restoring a direct connection
   */
  public setProxy(proxy = ""): this {
    this.socketConfig.setProxy(proxy);
    return this;
  }

  /**
   * Get proxy configuration for API communication.
   */
  public getProxy(): string | null {
    return this.socketConfig.getProxy();
  }

  /**
   * Set Referer to use for API communication.
   *
   * @param referer empty string resets it, so no Referer is sent
   */
  public setReferer(referer = ""): this {
    this.socketConfig.setReferer(referer);
    return this;
  }

  /**
   * Get Referer configuration for API communication.
   */
  public getReferer(): string | null {
    return this.socketConfig.getReferer();
  }

  /**
   * Get the current module version. Read from `version.ts`'s `VERSION`
   * constant (rewritten in place by the release pipeline) — never hardcoded
   * and never read from `package.json` at runtime.
   */
  public getVersion(): string {
    return VERSION;
  }

  /**
   * Set another connection url to be used for API communication.
   */
  public setURL(url: string): this {
    this.socketConfig.setURL(url);
    return this;
  }

  /**
   * Set Credentials to be used for API communication.
   *
   * On CNR this discards any active API session: `CNR.SocketConfig`'s
   * `setLogin()`/`setPassword()` clear the session id, because a session and
   * a password are alternative credentials on the wire and the newer one is
   * authoritative.
   *
   * @param login empty string resets the stored login
   * @param password empty string resets the stored password
   */
  public setCredentials(login = "", password = ""): this {
    this.socketConfig.setLogin(login);
    this.socketConfig.setPassword(password);
    return this;
  }

  /**
   * Activate High Performance Setup — route requests through the co-located
   * proxy on loopback.
   *
   * Brand-agnostic and therefore shared — the caller supplies the local
   * proxy, so IBS/Moniker may opt in too. It records a flag on the config
   * rather than rewriting the URL, so the selected system survives it; see
   * `AbstractSocketConfig.useHighPerformanceConnectionSetup()`. There is
   * deliberately no disable method.
   */
  public useHighPerformanceConnectionSetup(): this {
    this.socketConfig.useHighPerformanceConnectionSetup();
    return this;
  }

  /**
   * Convert domain names to idn + punycode.
   *
   * Brand-agnostic and therefore shared: a thin pass-through to the vendor
   * converter for callers who want to normalise a name explicitly. The
   * automatic rewrite of an outbound *command* is a different thing and is
   * deliberately not here — which parameters carry a domain name is CNR
   * knowledge, and it lives in `CNR.IDNCommandRewriter`.
   *
   * Synchronous: `idna-uts46-hx`'s conversion functions are synchronous, so
   * there is no async boundary to cross here (unlike PHP's `ConverterFactory`,
   * this SDK has no vendored equivalent to call — `toAscii()`/`toUnicode()`
   * are used directly). A conversion failure yields `null` for that entry
   * rather than throwing, so one bad name does not abort the whole batch —
   * a deliberately different error contract from calling `idna-uts46-hx`'s
   * `toAscii()`/`toUnicode()` directly, which throw on the same malformed
   * input. Pick the one that matches what you need: this method for a
   * batch that should keep going past one bad name, the vendor functions
   * directly when a conversion failure should stop the caller.
   */
  public IDNConvert(
    domains: string[],
  ): { idn: string | null; punycode: string | null }[] {
    return domains.map((domain) => {
      let idn: string | null;
      let punycode: string | null;
      try {
        idn = toUnicode(domain);
      } catch {
        idn = null;
      }
      try {
        punycode = toAscii(domain);
      } catch {
        punycode = null;
      }
      return { idn, punycode };
    });
  }

  /**
   * Delegate request execution to the transport layer.
   *
   * Do not re-add a per-request options argument here: it would be a route
   * into the option set that skips the SDK-managed keys, and so a way for a
   * subclass to put a second answer behind {@link getProxy}. A per-request
   * option belongs on the config before the request, or on a transport the
   * caller drives themselves.
   *
   * @returns [rawResponse, errorMessage] — errorMessage !== null means rawResponse is unusable
   */
  protected async executeCurl(
    postData: string,
    cfg: RequestConfig,
  ): Promise<[string, string | null]> {
    return this.transport.post(
      cfg.CONNECTION_URL,
      postData,
      this.socketConfig.getSocketTimeout(),
      this.getUserAgent(),
      this.socketConfig.getTransportOptions(),
    );
  }

  /**
   * Close the underlying transport connection/handle.
   *
   * Idempotent and never-throwing by contract, not by accident: calling
   * this any number of times — including on a client that never made a
   * request, and including after a request that created a real pooled
   * resource (the production transport's proxy `ProxyAgent`) whose teardown
   * itself fails — is always safe and never rejects. This class does no
   * bookkeeping of its own to guarantee either property; the guarantee is
   * that every `TransportInterface.close()` implementation this SDK ships
   * upholds both: `HttpTransport.close()` nulls its cached agent before
   * awaiting its own `close()` (so a second call finds nothing left to
   * close) and catches a rejecting teardown itself, reporting it to
   * `console.error` rather than letting it propagate. That matters beyond
   * tidiness — a caller running `close()` in a `finally` (the documented
   * way to use it, and how `CNR.Client.logout()` uses it internally) must
   * not have the *real* error it was cleaning up after replaced by an
   * unrelated teardown failure. A custom `TransportInterface` must uphold
   * both properties to remain a drop-in replacement.
   *
   * Not synchronized with an in-flight `request()` on the same client — see
   * docs/agents/architecture.md#concurrency-contract.
   */
  public async close(): Promise<void> {
    await this.transport.close();
  }

  /**
   * Get LIVE system URL.
   *
   * There is deliberately no matching `getOTEUrl()` here: read the OT&E
   * endpoint from {@link getSocketConfig}.
   */
  public getLiveUrl(): string {
    return this.socketConfig.getLiveUrl();
  }

  /**
   * Get the API system in use, or null when the configured URL is neither of
   * the brand's two known endpoints.
   *
   * Derived from the URL rather than stored beside it, which is what makes it
   * impossible for the two to disagree.
   */
  public getSystem(): System | null {
    return this.socketConfig.getSystem();
  }

  /**
   * Check whether the OT&E system is in use.
   */
  public isOTE(): boolean {
    return this.socketConfig.isOTE();
  }

  /**
   * Set OT&E System for API communication.
   */
  public useOTESystem(): this {
    this.socketConfig.useOTESystem();
    return this;
  }

  /**
   * Set LIVE System for API communication (this is the default setting).
   */
  public useLIVESystem(): this {
    this.socketConfig.useLIVESystem();
    return this;
  }

  /**
   * Set context data for the client.
   */
  public setContext(context: Hash): this {
    this.context = context;
    return this;
  }
}
