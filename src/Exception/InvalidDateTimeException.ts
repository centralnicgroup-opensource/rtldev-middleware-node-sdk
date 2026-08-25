import { CnicException } from "./CnicException.js";

/**
 * Thrown when an API date/time value cannot be parsed.
 *
 * Raised by `ApiDateTime.from()` for any value that is not one of the two
 * shapes the Team Internet APIs emit — including values a naive date
 * constructor would silently roll over into a different instant
 * (`2026-02-30` becoming `2026-03-02`, for example). The parser refuses those
 * rather than inventing a plausible-looking date. Use `ApiDateTime.tryFrom()`
 * when a `null` is preferable to an exception.
 */
export class InvalidDateTimeException extends CnicException {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidDateTimeException";
  }
}
