/**
 * Test support (RSRMID-2974, porting RSRMID-2919)
 *
 * Recording `TransportInterface` double.
 *
 * Captures what the client hands the transport for a request and returns a
 * canned wire response, so a test can assert the *effective* arguments — the
 * timeout and the request-options bag — without a network. This is the seam
 * PHP's history shows matters: a setter that stores a value nothing acts on
 * (`setExtraCurlOptions()`/`setProxy()`/the request timeout, all flagged in
 * the port plan) looks correct if a test only inspects the client's own
 * config bag; only a double sitting at the transport boundary can show
 * whether that value actually reached `post()`.
 *
 * For assertions about what the real transport does with those options, see
 * the `HttpTransport` nock specs — the merge/validation happens inside
 * `HttpTransport`, which this double replaces.
 *
 * Deliberately records only what is asserted on today — add a field when a
 * test needs it, rather than speculatively widening this ahead of time.
 *
 * It owns no request options, so — unlike `HttpTransport` — it accepts
 * whatever `TransportOptions` allows through at the type level. That is
 * correct for a recording double (its job is to report the arguments, not to
 * re-implement production rules), but it means a test written against this
 * class cannot show that an option is *rejected*; assert that against the
 * real transport instead.
 */

import type {
  TransportInterface,
  TransportOptions,
} from "../../src/TransportInterface.ts";

export class SpyTransport implements TransportInterface {
  /** Canned CNR success response, enough to drive the full parse path. */
  private static readonly DEFAULT_RAW =
    "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nEOF\r\n";

  /** Timeout handed over by the client; -1 until the first call. */
  public timeout = -1;

  /** Request-options bag handed over by the client, including proxy/referer. */
  public options: TransportOptions = {};

  /** Connection URL handed over by the client; empty until the first call. */
  public url = "";

  /** User agent handed over by the client; empty until the first call. */
  public userAgent = "";

  /**
   * The encoded payload handed over by the client; empty until the first
   * call. Recorded so "the bytes on the wire are what getPOSTData() produced"
   * is assertable end to end (RSRMID-2940) rather than only in isolation.
   */
  public data = "";

  /** Whether the client delegated {@link close} down to this transport. */
  public closed = false;

  /** @param raw canned wire response to return (defaults to a CNR success) */
  public constructor(private readonly raw: string = SpyTransport.DEFAULT_RAW) {}

  public async post(
    url: string,
    data: string,
    timeoutSeconds: number,
    userAgent: string,
    options: TransportOptions = {},
  ): Promise<[string, string | null]> {
    this.url = url;
    this.data = data;
    this.timeout = timeoutSeconds;
    this.userAgent = userAgent;
    this.options = options;
    return [this.raw, null];
  }

  public async close(): Promise<void> {
    this.closed = true;
  }
}
