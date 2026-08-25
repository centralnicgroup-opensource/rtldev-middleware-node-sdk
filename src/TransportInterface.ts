/**
 * Everything the SDK models itself, or the transport owns, is absent by
 * construction — this is PHP's two runtime rejection lists
 * (`HttpTransport::MANAGED_OPTIONS` / `PROTECTED_OPTIONS`) encoded as a type
 * instead of a pair of constant tables plus a runtime throw. `fetch` has
 * roughly six meaningful knobs, four of which already have a dedicated
 * setter — so the same guarantee can be had from the type system instead.
 */
export type RequestOptions = Omit<
  RequestInit,
  // MANAGED_OPTIONS — each has a dedicated setter that owns it
  | "signal" // -> setSocketTimeout()
  // PROTECTED_OPTIONS — the request envelope belongs to the transport
  | "method"
  | "body"
>;

/**
 * What the client actually hands the transport: the caller's extra options
 * plus the SDK-owned wire settings that have their own dedicated home on
 * `AbstractSocketConfig` (`setProxy()`/`setReferer()`). Mirrors PHP's
 * `$dedicated + $this->curlOptions` — the proxy/referer merged into the same
 * options array `HttpTransport::post()` receives, rather than living on the
 * transport itself. `proxy`/`referer` are never `RequestOptions` keys (they
 * are not `RequestInit` fields at all), so there is no collision to arbitrate
 * between the two halves of this type.
 */
export type TransportOptions = RequestOptions & {
  readonly proxy?: string | null;
  readonly referer?: string | null;
};

/**
 * Contract for the low-level HTTP transport used by `AbstractClient`.
 *
 * Isolating the HTTP layer behind this seam lets the request() lifecycle run
 * against a test double (e.g. a record/replay cassette transport) so the
 * whole path is exercisable offline, without touching the live API. The
 * production implementation is `HttpTransport`.
 */
export interface TransportInterface {
  /**
   * Execute a POST request and return the raw response.
   *
   * `options` carries the caller's transport tuning (see
   * `AbstractClient.setExtraRequestOptions()`). The contract is that a
   * caller's option **wins** over the implementation's own default for the
   * same key — an implementation that must own a key is required to reject
   * it by throwing `UnsupportedFeatureException`, naming what it refused,
   * rather than quietly ignoring it. Which keys those are is
   * implementation-specific: for the production transport they are encoded
   * out of reach in the `RequestOptions` type itself, while a test double
   * typically owns none and simply records what it was given.
   *
   * The return contract: a non-null second tuple element declares the
   * request a failure and the payload in the first element unusable. The
   * caller (see `AbstractResponseTranslator`) discards the raw payload
   * entirely in that case and substitutes the "httperror" template instead,
   * so an implementation that returns both real bytes and a non-null error
   * has its bytes thrown away — it must not rely on the payload surviving
   * alongside a set error. The production transport honours this by
   * returning `["", error]` on failure.
   *
   * @param data serialized POST payload
   * @param timeoutSeconds 0 carries the "no timeout" meaning
   * @param options additional request options, overriding the implementation's defaults
   * @returns [rawResponse, errorMessage] — errorMessage !== null means rawResponse is unusable
   */
  post(
    url: string,
    data: string,
    timeoutSeconds: number,
    userAgent: string,
    options?: TransportOptions,
  ): Promise<[string, string | null]>;

  /**
   * Close and release any underlying connection/handle.
   *
   * Must never throw or reject, and must be safe to call any number of
   * times (including with nothing open to close). `AbstractClient.close()`
   * documents both as a contract callers can rely on, and a caller running
   * it inside a `finally` — the documented usage — must not have the real
   * error it was cleaning up after replaced by a teardown failure here.
   * Catch and report a failing teardown internally instead of propagating
   * it; see `HttpTransport.close()` for the production implementation.
   */
  close(): Promise<void>;
}
