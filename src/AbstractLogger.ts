/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { EchoSink } from "./EchoSink.js";
import type { LoggerInterface } from "./LoggerInterface.js";
import type { LogSinkInterface } from "./LogSinkInterface.js";
import type { ResponseInterface } from "./ResponseInterface.js";

/**
 * Shared foundation for brand loggers: implement {@link format}, inherit the
 * destination.
 *
 * The format is the part that varies per brand — CNR joins command, POST
 * body, error and plain response with newlines; IBS emits a labelled
 * REQUEST/RESPONSE block — while the destination does not. So the brand
 * supplies `format()` and a {@link LogSinkInterface} supplies the
 * destination: one formatter serves every sink, instead of each sink
 * carrying a copy of the format.
 *
 * {@link log} is intended to be **final** — PHP declares it so. A subclass
 * reintroducing its own `log()` would be behaviour-identical under the
 * default {@link EchoSink} and would silently ignore any injected sink,
 * exactly the erosion this class exists to prevent. TS has no runtime
 * `final`; the guarantee is instead pinned by a seam spec asserting
 * `AbstractLogger.prototype.log` is the one every brand logger inherits. A
 * logger that genuinely owns its destination should implement
 * {@link LoggerInterface} directly instead of extending this class.
 */
export abstract class AbstractLogger implements LoggerInterface {
  /**
   * @param sink Destination for formatted records; defaults to standard output
   */
  public constructor(
    protected readonly sink: LogSinkInterface = new EchoSink(),
  ) {}

  public abstract format(
    post: string,
    response: ResponseInterface,
    error?: string | null,
  ): string;

  /**
   * Format the record, then hand it to the sink. The whole implementation of
   * the contract — see the class docblock for why it must not be
   * overridden.
   */
  public log(
    post: string,
    response: ResponseInterface,
    error: string | null = null,
  ): void {
    this.sink.write(this.format(post, response, error));
  }
}
