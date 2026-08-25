import { CnicException } from "./CnicException.js";

/**
 * Thrown when a capability is not available on the current platform or
 * response.
 *
 * Some operations exist on the shared contract but are not offered by every
 * brand — e.g. the IBS/Moniker platform has no API session, user roles, high
 * performance connection setup, queue/runtime metrics, temporary-error or
 * pending states, and no server-side list-hash. Calling such a method raises
 * this exception instead of returning a misleading value.
 *
 * It also covers the two "an option/header the transport already owns
 * cannot be overridden through a generic bag" rejections in
 * `HttpTransport.post()` — those are the situations a caller can actually
 * act on, so they carry structured context (which key was rejected, what
 * replaces it, which class owns the rejection) alongside the message, via
 * the named constructors below ({@link transportOwnedOption},
 * {@link transportOwnedHeader}) and read back through the accessors.
 *
 * PHP's equivalent (`CNIC\Exception\UnsupportedFeatureException`) has
 * *three* named constructors, because cURL gives it two runtime rejection
 * tables (`HttpTransport::MANAGED_OPTIONS`, options with a replacement
 * setter, and `::PROTECTED_OPTIONS`, options with none) that a plain-JS
 * caller's equivalent has collapsed into one: Node encodes both tables as
 * one `RequestOptions` type (`Omit<RequestInit, "signal" | "method" |
 * "body">`), so a normally-typed caller cannot reach either rejection at
 * all, and the one runtime guard left in `HttpTransport.post()` — for a
 * plain-JS caller bypassing the type system — checks all three keys in a
 * single pass. `transportOwnedOption()` takes an optional replacement
 * setter name so it still distinguishes "signal" (replace with
 * `setSocketTimeout()`) from "method"/"body" (no replacement — simply drop
 * them), without needing PHP's two separate constructors to say so. Not a
 * gap: it is what porting the *idea* rather than the cURL vocabulary looks
 * like once the type system already does most of the rejecting.
 *
 * Not every throw site has something actionable to hand back. The
 * config-type guard in `CNR.Client.getSocketConfig()` and the
 * `newResponse()`-produced-the-wrong-type guard in `CNR.Client.request()`
 * deliberately keep using the plain constructor: both protect against a
 * state that is unreachable through correctly-typed calls and, if ever
 * reached, is a programming error with no replacement setter or rejected
 * key to report.
 */
export class UnsupportedFeatureException extends CnicException {
  /**
   * The request-option key this instance rejected (e.g. `"signal"`), or
   * `null` for a plainly-constructed instance or one built via
   * {@link transportOwnedHeader}.
   */
  private rejectedOption: string | null = null;

  /**
   * The replacement for {@link getRejectedOption}, if the rejected option
   * has one (e.g. `"setSocketTimeout()"` for `"signal"`) — `null` when it
   * does not (a transport-owned option with nothing to redirect to) or for
   * an instance not built via {@link transportOwnedOption}.
   */
  private replacementSetter: string | null = null;

  /**
   * The rejected header name, as the throw site holds it, or `null` when
   * this instance does not describe a header rejection.
   */
  private rejectedHeaderName: string | null = null;

  /**
   * The class that owns the rejected option/header, or `null` when this
   * instance carries no structured context.
   */
  private owningClass: string | null = null;

  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    // String literal, not `new.target.name` — a minifier can rename a class
    // but not a string literal, so `.name` survives bundling.
    this.name = "UnsupportedFeatureException";
  }

  /**
   * Build the exception raised when `HttpTransport.post()` refuses a
   * request-option key a plain-JS caller supplied despite `RequestOptions`
   * already excluding it for a normally-typed one.
   *
   * @param option the rejected option key (e.g. `"signal"`, `"method"`, `"body"`)
   * @param owningClass the class that owns the option (e.g. `"HttpTransport"`)
   * @param replacementSetter what to call instead, or `null` when the option
   * has no replacement and must simply be omitted from the bag
   */
  public static transportOwnedOption(
    option: string,
    owningClass: string,
    replacementSetter: string | null = null,
  ): UnsupportedFeatureException {
    const suffix =
      replacementSetter === null ? "" : ` (use ${replacementSetter} instead)`;
    const e = new UnsupportedFeatureException(
      `Request option "${option}" is owned by ${owningClass}${suffix} and cannot be set through the option bag.`,
    );
    e.rejectedOption = option;
    e.replacementSetter = replacementSetter;
    e.owningClass = owningClass;
    return e;
  }

  /**
   * Build the exception raised when `HttpTransport.post()` refuses a
   * request-option key that would silently displace a dedicated setter the
   * caller has also used.
   *
   * Distinct from {@link transportOwnedOption}: the key is legitimate on its
   * own, and is refused only because it collides with a setting that already
   * has a home (`dispatcher` against `setProxy()`). PHP needs no counterpart
   * — cURL expresses a proxy exactly one way, so the collision does not
   * exist there. Refusing beats letting the bag win, which would leave
   * `getProxy()` reporting a proxy that never reached the wire.
   *
   * @param option the rejected option key (e.g. `"dispatcher"`)
   * @param owningClass the class that raised the rejection (e.g. `"HttpTransport"`)
   * @param conflictingSetter the setter it collides with (e.g. `"setProxy()"`)
   */
  public static conflictingTransportOption(
    option: string,
    owningClass: string,
    conflictingSetter: string,
  ): UnsupportedFeatureException {
    const e = new UnsupportedFeatureException(
      `Request option "${option}" conflicts with ${conflictingSetter} on this request: ${owningClass} cannot ` +
        `apply both. Drop one — clear ${conflictingSetter} to keep your own "${option}", or omit "${option}" ` +
        `to let ${conflictingSetter} build it.`,
    );
    e.rejectedOption = option;
    e.replacementSetter = conflictingSetter;
    e.owningClass = owningClass;
    return e;
  }

  /**
   * Build the exception raised when `HttpTransport.post()` refuses a
   * caller header line that restates one the transport owns.
   *
   * @param headerName the rejected header name, as the throw site holds it
   * @param owningClass the class that owns the header (e.g. `"HttpTransport"`)
   */
  public static transportOwnedHeader(
    headerName: string,
    owningClass: string,
  ): UnsupportedFeatureException {
    const e = new UnsupportedFeatureException(
      `HTTP header(s) owned by ${owningClass} cannot be overridden: ${headerName}. Content-Type describes the ` +
        "POST body and User-Agent/Referer are managed by the transport; add your own headers instead of " +
        "restating these.",
    );
    e.rejectedHeaderName = headerName;
    e.owningClass = owningClass;
    return e;
  }

  /**
   * The request-option key this instance rejected, or `null` for a plainly
   * constructed instance or a header rejection.
   */
  public getRejectedOption(): string | null {
    return this.rejectedOption;
  }

  /**
   * What to call instead of the rejected option, or `null` when it has no
   * replacement, or for an instance not built via {@link transportOwnedOption}.
   */
  public getReplacementSetter(): string | null {
    return this.replacementSetter;
  }

  /**
   * The rejected header name, or `null` when this instance does not
   * describe a header rejection.
   */
  public getRejectedHeaderName(): string | null {
    return this.rejectedHeaderName;
  }

  /**
   * The class that owns the rejected option/header, or `null` when this
   * instance carries no structured context.
   */
  public getOwningClass(): string | null {
    return this.owningClass;
  }
}
