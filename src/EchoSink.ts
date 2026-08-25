/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import type { LogSinkInterface } from "./LogSinkInterface.js";

/**
 * Log sink writing to standard output — the shipped default, and what keeps
 * a client's debug mode emitting the bytes consumers expect.
 *
 * `process.stdout.write()`, not `console.log()`: the latter appends a
 * newline the formatted record does not ask for, unlike PHP's `echo`, which
 * writes exactly the bytes it is given.
 */
export class EchoSink implements LogSinkInterface {
  public write(message: string): void {
    process.stdout.write(message);
  }
}
