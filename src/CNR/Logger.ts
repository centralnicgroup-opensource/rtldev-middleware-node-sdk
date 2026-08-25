/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { inspect } from "node:util";
import { AbstractLogger } from "../AbstractLogger.js";
import type { ResponseInterface } from "../ResponseInterface.js";

/**
 * CNR Logger
 *
 * Formatting only — the destination belongs to the sink `AbstractLogger`
 * writes to. Do not add a `log()` override here; it is final upstream.
 */
export class Logger extends AbstractLogger {
  /**
   * Build the CNR debug record: command, POST body, optional transport error
   * and the plain response, joined by newlines.
   *
   * @param post post request data in string format (already masked)
   */
  public override format(
    post: string,
    response: ResponseInterface,
    error: string | null = null,
  ): string {
    return [
      // util.inspect() stands in for PHP's print_r() — a debug-log rendering
      // choice with no wire behaviour to keep byte-identical.
      inspect(response.getCommand()),
      post,
      error !== null && error !== ""
        ? `HTTP communication failed: ${error}`
        : "",
      response.getPlain(),
    ].join("\n");
  }
}
