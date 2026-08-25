import { CnicException } from "./CnicException.js";

/**
 * Thrown when a list-pagination helper is used incorrectly.
 *
 * Raised by `CNR.Client.requestNextResponsePage()` when the current command
 * still carries a `LAST` parameter, which conflicts with the automatic
 * page-cursor arithmetic and must be removed before paginating.
 */
export class PaginationException extends CnicException {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PaginationException";
  }
}
