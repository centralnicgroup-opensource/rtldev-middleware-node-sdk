/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import { AbstractLogger } from "../AbstractLogger.js";
import type { ResponseInterface } from "../ResponseInterface.js";

/**
 * IBS Logger
 *
 * Formatting only — the destination belongs to the sink `AbstractLogger.log()`
 * writes to; that method is intended to be final and must not be overridden
 * here (see that class's docblock).
 *
 * PHP declares this `final`; TS has no runtime `final`, so the guarantee is
 * instead pinned by a seam spec asserting no subclass reintroduces `log()`.
 */
export class Logger extends AbstractLogger {
  /**
   * Build the IBS debug record: a labelled REQUEST/RESPONSE block with the
   * plain response indented by one tab per line.
   *
   * @param post Post request data in string format (already masked)
   */
  public override format(
    post: string,
    response: ResponseInterface,
    error: string | null = null,
  ): string {
    return (
      "R E Q U E S T\n" +
      `\tAPI:  ${response.getRequestURL()}\n` +
      `\tPOST: ${post}\n\n` +
      "R E S P O N S E\n" +
      (error !== null && error !== ""
        ? `\tHTTP communication failed: ${error}\n`
        : "") +
      `\t${response.getPlain().replace(/\n/g, "\n\t")}`
    );
  }
}
