/**
 * MYCUSTOMNAMESPACE
 * Copyright © MYCUSTOMNAMESPACE
 *
 * Mirrors `examples/CustomLoggerClass.php` from the PHP SDK. Node has no
 * `examples/`-vs-`src/` autoload distinction, so this file lives here purely
 * by convention — matching PHP's split (the sample belongs beside app_*.ts,
 * not shipped as part of the library surface).
 */

import { AbstractLogger } from "../src/AbstractLogger.js";
import type { LogSinkInterface } from "../src/LogSinkInterface.js";
import type { ResponseInterface } from "../src/ResponseInterface.js";

/**
 * Two things vary in SDK debug output, and they are separate seams:
 *
 * 1. **The format** — implement {@link format} and return the record.
 *    Extending {@link AbstractLogger} is all it takes; writing is handled
 *    for you.
 * 2. **The destination** — implement `LogSinkInterface` and hand it to the
 *    client with `setLogSink()`. If the stock format is fine and you only
 *    want the bytes somewhere else, that half is all you need — see
 *    `CustomLogSinkClass.ts`.
 *
 * Use the class below when you want your own format. It takes a sink like
 * any other logger, so the two halves compose:
 *
 * ```ts
 * client
 *   .enableDebugMode()
 *   .setCustomLogger(new Logger(new FileSink("/var/log/cnic.log")));
 * ```
 *
 * Both arguments arrive masked: the response masks its own stored command
 * (so `getCommand()`/`getCommandPlain()` are safe) and the client passes a
 * masked POST body. The one thing that is **not** masked is
 * `response.getContext()` — that data is whatever you put there yourself,
 * so if you log it, mask it yourself.
 */
export class Logger extends AbstractLogger {
  public constructor(sink?: LogSinkInterface) {
    super(sink);
  }

  /**
   * Build the debug record. Return it; do not print it — `AbstractLogger.log()`
   * hands the return value to the sink.
   */
  public override format(
    post: string,
    response: ResponseInterface,
    error: string | null = null,
  ): string {
    // apply your custom formatting here
    return `[${response.getRequestURL()}] ${post} -> ${response.getCode()} ${response.getDescription()}${
      error !== null && error !== "" ? ` (transport error: ${error})` : ""
    }`;
  }
}
