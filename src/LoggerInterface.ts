import type { ResponseInterface } from "./ResponseInterface.js";

/**
 * Common Logger Interface
 *
 * Two methods, and the split between them is the point: {@link format} is the
 * part that varies per brand and it **returns** the record, {@link log} only
 * decides where the record goes. Do not collapse them back into a single
 * echoing `log()`.
 *
 * Extend `AbstractLogger` to implement `format()` and inherit the sink
 * wiring; implement this interface directly only if you want to own the
 * destination too.
 */
export interface LoggerInterface {
  /**
   * Build the debug record for the given request/response pair.
   *
   * Callers get the record as a string; nothing is written. Both arguments
   * are already masked when they arrive — the response masks its own stored
   * command (`AbstractResponse.sanitizeCommand()`, so `getCommand()` and
   * `getCommandPlain()` are safe) and the client passes a secured POST body —
   * so implementations must not undo that. The exception is
   * `ResponseInterface.getContext()`, which is caller-supplied and
   * deliberately untouched: an implementation logging it masks it itself.
   *
   * @param post Post request data in string format (already masked)
   */
  format(
    post: string,
    response: ResponseInterface,
    error?: string | null,
  ): string;

  /**
   * Write the debug record for the given request/response pair.
   *
   * @param post Post request data in string format (already masked)
   */
  log(post: string, response: ResponseInterface, error?: string | null): void;
}
