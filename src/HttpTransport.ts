/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { ProxyAgent } from "undici";
import { UnsupportedFeatureException } from "./Exception/UnsupportedFeatureException.js";
import type {
  TransportInterface,
  TransportOptions,
} from "./TransportInterface.js";

/**
 * Low-level HTTP transport over the platform `fetch`.
 *
 * The production implementation of {@link TransportInterface} — Node's
 * parity counterpart to PHP's cURL-backed `HttpTransport`. There is no
 * connection handle to cache the way PHP caches a `CurlHandle`: `fetch`
 * (undici under the hood) manages its own pooling on the default dispatcher.
 *
 * **Proxy/referer *state* lives solely on `AbstractSocketConfig`** —
 * `setProxy()`/`setReferer()` — matching PHP's one-home rule (decision 4).
 * `AbstractClient.executeCurl()` reads the config's
 * {@link AbstractSocketConfig.getTransportOptions} and hands the result to
 * {@link post} as `options.proxy`/`options.referer` on every call, the same
 * way PHP folds them into the single array `curl_setopt_array()` receives.
 * What *does* live here, and must, is a Node-forced difference: an undici
 * `ProxyAgent` is a real pooled resource (its own sockets, its own
 * keep-alive timers) that must be created once and explicitly released,
 * unlike cURL's stateless `CURLOPT_PROXY` flag — so this class caches the
 * agent keyed by the proxy URL it was built for, and tears it down in
 * {@link close} or when a later call arrives with a different proxy.
 */
export class HttpTransport implements TransportInterface {
  /**
   * Option keys the transport owns, each paired with the setter to use
   * instead, or `null` when there is none and the key must simply be
   * omitted.
   *
   * PHP's `MANAGED_OPTIONS` (a replacement setter exists) and
   * `PROTECTED_OPTIONS` (none does) collapsed into one table, because the
   * `RequestOptions` type already does the rejecting for a normally-typed
   * caller — this only backstops a plain-JS one. `"signal"` is replaced by
   * `setSocketTimeout()`, via {@link post}'s `timeoutSeconds` parameter;
   * `"method"`/`"body"` are fixed and have no replacement. Static, because
   * the data never changes at runtime and rebuilding it per request would
   * allocate a constant on every call.
   */
  private static readonly OWNED_OPTIONS: readonly (readonly [
    key: string,
    replacement: string | null,
  ])[] = [
    ["signal", "setSocketTimeout()"],
    ["method", null],
    ["body", null],
  ];

  private proxyAgent: ProxyAgent | null = null;
  private proxyAgentUrl: string | null = null;

  /**
   * Execute a POST request and return the raw response.
   *
   * A non-null second tuple element means the request failed and the first
   * element is unusable: on failure this returns `["", error]`, mirroring
   * PHP's `["", curl_error(...)]`. A non-2xx HTTP status is **not** a
   * transport failure — `fetch` resolves normally for those, the same way
   * `curl_exec()` succeeds regardless of HTTP status; only a rejected
   * `fetch()` (DNS failure, connection refused, an aborted/timed-out
   * request) reaches the `catch` branch below.
   */
  public async post(
    url: string,
    data: string,
    timeoutSeconds: number,
    userAgent: string,
    options: TransportOptions = {},
  ): Promise<[string, string | null]> {
    // Small runtime check for plain-JS consumers, who have no compiler to
    // catch what `RequestOptions` already excludes for TS callers.
    for (const [managed, replacement] of HttpTransport.OWNED_OPTIONS) {
      if (managed in options) {
        throw UnsupportedFeatureException.transportOwnedOption(
          managed,
          "HttpTransport",
          replacement,
        );
      }
    }

    const {
      headers: callerHeaders,
      proxy = null,
      referer = null,
      ...rest
    } = options;

    // A caller-supplied `dispatcher` and a configured proxy are two ways to
    // say the same thing, and only one can be attached. Refuse rather than
    // pick: letting the bag win would leave `getProxy()` reporting a proxy
    // that never reached the wire — the silently-inert setter this port
    // exists to eliminate — while letting the proxy win would discard a
    // dispatcher the caller built deliberately. Same rule as the header
    // collision below: additive, never a silent override. Rejected up here
    // with the rest, because a collision is a programming error rather than
    // a network event and must not cost a request.
    if (proxy !== null && rest.dispatcher !== undefined) {
      throw UnsupportedFeatureException.conflictingTransportOption(
        "dispatcher",
        "HttpTransport",
        "setProxy()",
      );
    }

    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    });
    if (referer !== null) {
      headers.set("Referer", referer);
    }
    // Caller headers are appended, never allowed to replace the transport's
    // own — restating one is an error, not a silent override (mirrors PHP's
    // appendHeaders()). `Headers` comparisons are case-insensitive by spec,
    // so this needs no manual case-folding.
    if (callerHeaders !== undefined) {
      for (const [name, value] of new Headers(callerHeaders)) {
        if (headers.has(name)) {
          throw UnsupportedFeatureException.transportOwnedHeader(
            name,
            "HttpTransport",
          );
        }
        headers.set(name, value);
      }
    }

    const init: RequestInit = {
      ...rest,
      method: "POST",
      body: data,
      headers,
    };
    if (timeoutSeconds > 0) {
      init.signal = AbortSignal.timeout(timeoutSeconds * 1000);
    }
    // nock 14 intercepts `fetch` by patching the *global* dispatcher; a
    // per-request `dispatcher` bypasses that patch entirely. Only attach one
    // when a proxy is actually configured, so a proxy-less request keeps
    // using the global dispatcher and stays visible to HTTP-level nock specs.
    if (proxy !== null) {
      if (this.proxyAgentUrl !== proxy) {
        this.releaseProxyAgent();
        this.proxyAgent = new ProxyAgent(proxy);
        this.proxyAgentUrl = proxy;
      }
      // Non-null by the invariant just established above; TS can't see across
      // the reassignment inside the nested `if`, so make the type explicit.
      init.dispatcher = this.proxyAgent ?? undefined;
    } else {
      // The proxy was cleared (setProxy("")) or was never set on this call;
      // a cached agent from an earlier request with a proxy would otherwise
      // sit open — its sockets and keep-alive timers unreleased — for as
      // long as this transport lives, since nothing else revisits this
      // branch until a *different* non-null proxy shows up.
      this.releaseProxyAgent();
    }

    try {
      const response = await fetch(url, init);
      return [await response.text(), null];
    } catch (err) {
      return ["", HttpTransport.describeError(err)];
    }
  }

  /**
   * Render a rejected `fetch()` as the diagnostic string that goes into the
   * tuple's error slot — the counterpart of PHP's `curl_error()`.
   *
   * A rejected `fetch()` reports `"fetch failed"` and nothing else: what
   * actually went wrong is one level down, in `cause`. `curl_error()` names
   * the host, the port and the reason, and that string is what reaches an
   * integrator through the `httperror` template's `{HTTPERROR}` slot — so
   * returning only the top-level message tells them a request failed while
   * withholding every fact needed to act on it:
   *
   * ```text
   * top-level only:  fetch failed
   * with the cause:  fetch failed: connect ECONNREFUSED 127.0.0.1:9999
   * ```
   *
   * The whole `cause` chain is walked, not just one link, because undici
   * nests further for TLS and HTTP/2 failures. Identical consecutive
   * messages collapse, and the walk is depth-capped — a `cause` chain can be
   * made cyclic, and this runs on an error path that must not itself fail.
   */
  private static describeError(err: unknown): string {
    if (!(err instanceof Error)) {
      return String(err);
    }
    const parts: string[] = [];
    let current: unknown = err;
    for (let depth = 0; depth < 5 && current instanceof Error; depth++) {
      const { message } = current;
      if (message !== "" && message !== parts[parts.length - 1]) {
        parts.push(message);
      }
      current = (current as Error & { cause?: unknown }).cause;
    }
    return parts.length === 0 ? err.name : parts.join(": ");
  }

  /**
   * Close and release the cached proxy agent, if one was created.
   *
   * Never throws (part of {@link TransportInterface.close}'s contract): a
   * rejecting agent teardown is caught and reported to `console.error`
   * rather than propagated. A caller running this in a `finally` — which is
   * exactly how {@link AbstractClient.close} documents the contract, and how
   * `CNR.Client.logout()` actually uses it — must not have the real error it
   * was cleaning up after replaced by an unrelated teardown failure.
   * {@link releaseProxyAgent} is the sibling case this mirrors, minus the
   * reporting: that one is a background cleanup nothing is waiting on, so
   * there is no caller for a reported error to reach either.
   */
  public async close(): Promise<void> {
    const agent = this.proxyAgent;
    this.proxyAgent = null;
    this.proxyAgentUrl = null;
    try {
      await agent?.close();
    } catch (err) {
      console.error("HttpTransport.close(): proxy agent teardown failed", err);
    }
  }

  /**
   * Release the cached proxy agent (if any) without awaiting the close —
   * called from a synchronous branch of {@link post} that cannot itself be
   * async. `.close()` rejecting must never become an unhandled rejection
   * (fatal under Node's default `--unhandled-rejections=throw`): the agent
   * is already unreachable from this transport by the time we'd find out,
   * so there is nothing to retry and nothing a caller could act on.
   */
  private releaseProxyAgent(): void {
    const stale = this.proxyAgent;
    this.proxyAgent = null;
    this.proxyAgentUrl = null;
    stale?.close().catch(() => {
      // Deliberately swallowed — see the docblock above.
    });
  }
}
