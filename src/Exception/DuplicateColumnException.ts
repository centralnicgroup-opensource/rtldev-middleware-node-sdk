import { CnicException } from "./CnicException.js";

/**
 * Thrown when a column name is registered twice on one response.
 *
 * Raised by `AbstractResponse.registerColumn()`. A response's column list is
 * keyed by name — `getColumn()` resolves a name to one position — so a
 * second column under the same name cannot be represented: the list would
 * hold a column `getColumn()` can never return (RSRMID-2939).
 *
 * Unreachable from either shipped brand, and from a substitute
 * `ResponseParserInterface` too: both brands derive their column names from
 * the keys of the parsed hash, and two distinct object keys cannot stringify
 * to the same name. It exists for a future brand whose `populate()` builds
 * its columns some other way — there a repeated name is a programming error
 * and says so rather than half-registering the column, the same policy as
 * `MalformedResponseException` for a non-string CNR cell.
 */
export class DuplicateColumnException extends CnicException {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DuplicateColumnException";
  }
}
