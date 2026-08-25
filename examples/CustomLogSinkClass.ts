/**
 * MYCUSTOMNAMESPACE
 * Copyright © MYCUSTOMNAMESPACE
 *
 * Mirrors `examples/CustomLogSinkClass.php` from the PHP SDK.
 */

import { appendFile } from "node:fs/promises";
import type { LogSinkInterface } from "../src/LogSinkInterface.js";

/**
 * The destination half of the debug-output seam — all you need when the
 * brand's format already suits you and you only want the bytes somewhere
 * other than STDOUT (a file, a logger, a WHMCS/Blesta module log):
 *
 * ```ts
 * client.enableDebugMode().setLogSink(new FileSink("/var/log/cnic.log"));
 * ```
 *
 * See `CustomLoggerClass.ts` for the format half.
 *
 * `write()` is synchronous by contract, because the client calls it from
 * `performRequest()` and logging must not reorder relative to the request.
 * PHP can block on `file_put_contents()`; blocking Node's event loop for
 * every debug line is the wrong trade, so this appends in the background and
 * reports a failed write rather than letting it reject unhandled.
 */
export class FileSink implements LogSinkInterface {
  public constructor(private readonly path: string) {}

  public write(message: string): void {
    void appendFile(this.path, `${message}\n`).catch((err: unknown) => {
      console.error(`FileSink: could not append to ${this.path}:`, err);
    });
  }
}
