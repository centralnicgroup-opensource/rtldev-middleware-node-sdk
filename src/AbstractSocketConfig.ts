/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { CommandRedactor } from "./CommandRedactor.js";
import { InvalidConfigurationException } from "./Exception/InvalidConfigurationException.js";
import { System } from "./System.js";
import type { RequestOptions, TransportOptions } from "./TransportInterface.js";

/**
 * PHP's `array<string, string|null>` — an API POST parameter bag where a
 * `null` value means "omit this parameter from the request", not "send it
 * empty".
 */
export type PostDataParams = { [key: string]: string | null };

/**
 * Shared base for all registrar SocketConfig implementations, and **the one
 * home for connection configuration**.
 *
 * Concrete subclasses provide {@link getPOSTDataParams} and their own
 * brand-specific parameters.
 *
 * **This class owns the connection** — where to connect ({@link url}, the
 * endpoints, the high-performance route), how to authenticate (login/
 * password; CNR's session lives on its own subclass), and how the transport
 * should behave (timeout, extra request options). `AbstractClient` owns
 * **client behaviour** — logging, response context, the transport instance,
 * the SDK's own identity. Its configuration methods are forwarders to this
 * object. Do not add a client-side copy of anything declared here.
 *
 * Two invariants keep "one answer" true:
 * - **The system is derived from the URL, never stored** (see
 *   {@link getSystem}). There is no flag left to disagree with the endpoint
 *   in use.
 * - **The proxy/referer setters live here as the declarative, caller-facing
 *   home for the value** (matching PHP's `AbstractSocketConfig::setProxy()`/
 *   `setReferer()`), even though the *live* undici `ProxyAgent` resource
 *   those values drive is created and disposed by `HttpTransport` — see that
 *   class's docblock for why that one piece of state has a second, transport-
 *   side home: it is a Node-forced deviation (a `ProxyAgent` is a pooled
 *   resource that must be explicitly closed; a cURL option is not), not a
 *   relaxation of the "one home" rule for anything else here.
 */
export abstract class AbstractSocketConfig {
  /**
   * The brand's OT&E endpoint, host only, with trailing slash.
   *
   * A `get` accessor, not a field. Not read by this constructor, but kept
   * symmetric with {@link liveUrl} — see that accessor for why one of the two
   * *must* be.
   */
  protected abstract get oteUrl(): string;

  /**
   * The brand's LIVE endpoint, host only, with trailing slash.
   *
   * MUST be a `get` accessor, never a plain field: this class's constructor
   * reads it to seed {@link url}. JS runs a subclass's field initialisers
   * *after* `super()` returns, so if this were a plain field the constructor
   * would see `undefined` here — the #1 trap in this port. An accessor lives
   * on the prototype and is already in place the moment `super()` starts
   * running.
   */
  protected abstract get liveUrl(): string;

  /** account name */
  protected login = "";

  /** account password */
  protected password = "";

  /**
   * The endpoint requests are sent to — one of {@link oteUrl}/{@link liveUrl}
   * when a system was selected, or whatever {@link setURL} was handed.
   *
   * The **only** stored URL/system state: which system this is gets derived
   * from it ({@link getSystem}) rather than tracked alongside it. `null`
   * means "not yet set", resolved to {@link liveUrl} (LIVE being the
   * default) by {@link resolveUrl} on first read.
   *
   * Left unseeded by the constructor rather than assigned `this.liveUrl`
   * there: `liveUrl` is `abstract`, and TypeScript rejects a base
   * constructor reading an abstract member — a subclass could in principle
   * implement it as a field, which is not yet initialised while `super()`
   * is still running. See {@link resolveUrl}.
   */
  protected url: string | null = null;

  /**
   * Whether requests are routed through the co-located high-performance
   * proxy on loopback ({@link useHighPerformanceConnectionSetup}).
   *
   * A flag applied by {@link getURL} on every read rather than a rewrite of
   * {@link url}, so the selected system survives it.
   */
  protected highPerformance = false;

  /** Proxy for API communication, or null for a direct connection. */
  protected proxy: string | null = null;

  /** Referer sent with API requests, or null to send none. */
  protected referer: string | null = null;

  /**
   * Caller-supplied request options, over and above the transport's own
   * defaults. Parity name for PHP's `$curlOptions` — `fetch` has no cURL
   * option vocabulary, so this is a `RequestInit`-shaped bag rather than an
   * int-keyed array. Seeded from {@link getDefaultRequestOptions} by the
   * constructor, mutated by {@link setExtraRequestOptions} and restored by
   * {@link resetRequestOptions}.
   */
  protected requestOptions: RequestOptions = {};

  /** API socket timeout in seconds. */
  protected socketTimeout = 300;

  /**
   * Command parameter keys whose values carry sensitive data (account
   * password, domain authorization code, ...) and must be masked in the
   * "secured" POST body used for debug logging. Matching is case-insensitive
   * (see {@link maskSensitiveCommand}).
   *
   * Not read by this constructor — unlike {@link liveUrl} — so a plain field
   * override in a subclass is safe here; there is no field-initialisation-
   * order hazard for a value nothing reads until well after construction.
   */
  protected sensitiveFields: string[] = [];

  /**
   * Seed the runtime state that depends on the brand's property defaults.
   * {@link requestOptions} starts at the brand's
   * {@link getDefaultRequestOptions} — this has to happen here rather than
   * as an inline default, so it runs after the subclass's own initialisers.
   *
   * {@link url} is deliberately *not* seeded here — see its docblock and
   * {@link resolveUrl}.
   */
  public constructor() {
    this.requestOptions = this.getDefaultRequestOptions();
  }

  /**
   * The effective stored URL: {@link url} once {@link setURL}/
   * {@link useOTESystem}/{@link useLIVESystem} has run, else the brand's
   * {@link liveUrl} default.
   *
   * The one place {@link url}'s "unset" state is resolved. Reading
   * {@link liveUrl} here — instead of in the constructor — is safe: by the
   * time any instance method runs, the subclass's accessor is in place.
   */
  private resolveUrl(): string {
    return this.url ?? this.liveUrl;
  }

  /** Set account name to use. */
  public setLogin(login: string): this {
    this.login = login;
    return this;
  }

  /** Get current login. */
  public getLogin(): string {
    return this.login;
  }

  /** Set account password to use. */
  public setPassword(password: string): this {
    this.password = password;
    return this;
  }

  /**
   * Get the endpoint API requests are sent to — the **effective** URL.
   *
   * The stored {@link url}, with the loopback rewrite applied when
   * high-performance mode is on. Resolved here on every read rather than
   * burnt into {@link url}, so switching systems afterwards keeps it and
   * {@link getSystem} still knows which system was selected.
   */
  public getURL(): string {
    const url = this.resolveUrl();
    return this.highPerformance ? AbstractSocketConfig.toLoopback(url) : url;
  }

  /**
   * Set another connection url to be used for API communication.
   *
   * This replaces the endpoint selection wholesale, so a URL that is neither
   * {@link oteUrl} nor {@link liveUrl} leaves {@link getSystem} answering
   * `null`.
   */
  public setURL(url: string): this {
    this.url = url;
    return this;
  }

  /** Get OT&E endpoint URL. */
  public getOTEUrl(): string {
    return this.oteUrl;
  }

  /** Get LIVE endpoint URL. */
  public getLiveUrl(): string {
    return this.liveUrl;
  }

  /**
   * Get the API system currently in use, or null when the configured URL is
   * neither of the brand's two known endpoints.
   *
   * Derived from {@link url}, never stored — a stored copy is a second
   * answer waiting to contradict the first.
   */
  public getSystem(): System | null {
    const url = this.resolveUrl();
    if (url === this.oteUrl) {
      return System.OTE;
    }
    if (url === this.liveUrl) {
      return System.LIVE;
    }
    return null;
  }

  /** Check whether the OT&E endpoint is in use. */
  public isOTE(): boolean {
    return this.getSystem() === System.OTE;
  }

  /** Select the OT&E system for API communication. */
  public useOTESystem(): this {
    return this.setURL(this.oteUrl);
  }

  /** Select the LIVE system for API communication (the default). */
  public useLIVESystem(): this {
    return this.setURL(this.liveUrl);
  }

  /**
   * Route API requests through the co-located high-performance proxy on
   * loopback.
   *
   * Recorded as a flag and applied by {@link getURL} on every read, not by
   * rewriting {@link url} once — an eager rewrite would silently cost the
   * caller {@link isOTE}/{@link getSystem}. It therefore also survives a
   * later {@link useOTESystem}/{@link useLIVESystem}/{@link setURL}. There is
   * deliberately no disable method; construct a fresh client if you need one
   * without it.
   */
  public useHighPerformanceConnectionSetup(): this {
    this.highPerformance = true;
    return this;
  }

  /** Whether high-performance (loopback proxy) routing is switched on. */
  public usesHighPerformanceConnectionSetup(): boolean {
    return this.highPerformance;
  }

  /**
   * Rewrite a URL to target the co-located high-performance proxy on
   * loopback.
   *
   * The https->http downgrade is deliberate and safe: the request never
   * leaves the host. Rebuilt from the URL components so only the scheme and
   * host are swapped; a blind string replace would also clobber a hostname
   * recurring in the path or query. A URL with no parseable host is returned
   * unchanged, there being nothing to redirect.
   */
  private static toLoopback(url: string): string {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      // Mirrors PHP's parse_url() returning no "host" key for an
      // unparseable URL: nothing to redirect, so return the input as-is.
      return url;
    }
    if (parsed.hostname === "") {
      return url;
    }
    return `http://127.0.0.1${parsed.port !== "" ? `:${parsed.port}` : ""}${parsed.pathname}${parsed.search}`;
  }

  /**
   * Set the proxy to use for API communication.
   * @param proxy empty string resets it, restoring a direct connection
   */
  public setProxy(proxy = ""): this {
    this.proxy = proxy === "" ? null : proxy;
    return this;
  }

  /**
   * Get the proxy configured for API communication, or null for a direct
   * connection.
   */
  public getProxy(): string | null {
    return this.proxy;
  }

  /**
   * Set the Referer to send with API requests.
   * @param referer empty string resets it, so no Referer is sent
   */
  public setReferer(referer = ""): this {
    this.referer = referer === "" ? null : referer;
    return this;
  }

  /** Get the Referer sent with API requests, or null when none is sent. */
  public getReferer(): string | null {
    return this.referer;
  }

  /**
   * Brand-default request options, used to seed and to reset
   * {@link requestOptions}.
   *
   * **No brand overrides this, and new overrides should be resisted** —
   * transport tuning is the caller's decision via
   * {@link setExtraRequestOptions}. The hook is kept because it is the seam
   * {@link resetRequestOptions} is defined in terms of.
   */
  protected getDefaultRequestOptions(): RequestOptions {
    return {};
  }

  /**
   * Merge additional request options into the bag, overriding existing
   * values (including brand defaults) on key collision. Use
   * {@link resetRequestOptions} to restore the brand defaults afterwards.
   *
   * `signal`/`method`/`body` are unreachable through `opts` by construction
   * — the `RequestOptions` type omits them (PHP's `MANAGED_OPTIONS`/
   * `PROTECTED_OPTIONS` runtime rejection, encoded as a type instead).
   */
  public setExtraRequestOptions(opts: RequestOptions): this {
    // PHP's `$opts + $this->curlOptions` keeps the LEFT (new) operand on a
    // duplicate key; JS spread keeps the RIGHT, so `opts` must be spread
    // last here to reproduce "the caller's new option wins".
    this.requestOptions = { ...this.requestOptions, ...opts };
    return this;
  }

  /**
   * Restore the request option bag to the brand defaults
   * ({@link getDefaultRequestOptions}), discarding anything previously
   * handed to {@link setExtraRequestOptions}.
   *
   * Scope note: **options only**. The proxy and the referer are not bag
   * keys, so this does not forget them — reset those explicitly with
   * {@link setProxy}/{@link setReferer} if that is what you meant.
   */
  public resetRequestOptions(): this {
    this.requestOptions = this.getDefaultRequestOptions();
    return this;
  }

  /**
   * The request options this config declares.
   *
   * Returned as a fresh copy so a caller cannot mutate internal state
   * through the reference — the by-value guarantee PHP gets for free from
   * array semantics.
   */
  public getRequestOptions(): RequestOptions {
    return { ...this.requestOptions };
  }

  /**
   * The full option bag handed to the transport on every request: the
   * caller's extra options plus this config's dedicated {@link proxy}/
   * {@link referer} — the one home for both, per decision 4. Mirrors PHP's
   * `$dedicated + $this->curlOptions`, which in JS spread order means the
   * dedicated values are added last so they are never shadowed by a
   * same-named caller option (there is none: `proxy`/`referer` are not
   * `RequestOptions` keys in the first place, so this is not really a
   * collision to arbitrate, just the two halves of the same bag joining).
   */
  public getTransportOptions(): TransportOptions {
    return { ...this.requestOptions, proxy: this.proxy, referer: this.referer };
  }

  /** Get socket timeout in seconds. */
  public getSocketTimeout(): number {
    return this.socketTimeout;
  }

  /**
   * Set the socket timeout in seconds — the ceiling on a whole API request.
   *
   * 0 carries "no timeout" and is passed through unchanged. A negative
   * value is rejected rather than forwarded, so a mistake is never dropped
   * with no signal.
   * @param timeoutSeconds 0 = no timeout
   * @throws InvalidConfigurationException on a negative value
   */
  public setSocketTimeout(timeoutSeconds: number): this {
    if (timeoutSeconds < 0) {
      throw new InvalidConfigurationException(
        `Socket timeout must be 0 (no timeout) or a positive number of seconds, got ${timeoutSeconds}.`,
      );
    }
    this.socketTimeout = timeoutSeconds;
    return this;
  }

  /**
   * Mask the values of the brand's sensitive command keys (see
   * {@link sensitiveFields}) so command-level secrets never reach the debug
   * log in cleartext. Delegates the matching/masking to
   * {@link CommandRedactor.redact}, shared with `AbstractResponse`'s own
   * masking. `null` values are left untouched (they are dropped from the
   * request, not logged).
   */
  protected maskSensitiveCommand(command: PostDataParams): PostDataParams {
    return CommandRedactor.redact(command, this.sensitiveFields);
  }

  /**
   * Get POST data container of connection data.
   */
  protected abstract getPOSTDataParams(
    command: PostDataParams,
    maskSecrets: boolean,
  ): PostDataParams;

  /**
   * Create POST data string out of connection data.
   *
   * Purely the encoding step: every parameter, including brand-specific
   * ones, comes from {@link getPOSTDataParams}. Do not reintroduce brand
   * knowledge at this level.
   */
  public getPOSTData(
    command: PostDataParams = {},
    maskSecrets = false,
  ): string {
    const params = this.getPOSTDataParams(command, maskSecrets);
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        continue;
      }
      query.append(key, value);
    }
    // PHP's http_build_query() defaults to RFC1738, which percent-encodes "*"
    // as %2A. The WHATWG urlencoded serializer behind URLSearchParams keeps
    // "*" literal — it is in the urlencoded production set. Every other
    // character the two disagreed about historically ("!", "'", "(", ")",
    // "~") is already encoded identically by URLSearchParams, so this single
    // substitution is what makes the encoded body byte-identical to the PHP
    // SDK's. CNR query commands legitimately carry "*" (wildcard patterns),
    // so this is reachable on the wire, not just in debug output.
    return query.toString().replace(/\*/g, "%2A");
  }
}
