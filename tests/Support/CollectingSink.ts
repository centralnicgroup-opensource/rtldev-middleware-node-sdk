/**
 * Test support (RSRMID-2974, porting RSRMID-2925)
 *
 * In-memory log sink: keeps every written message instead of writing it out.
 *
 * The second real implementation of `LogSinkInterface` alongside the shipped
 * `EchoSink`, and the reason debug output can be asserted without capturing
 * stdout.
 */

import type { LogSinkInterface } from "../../src/LogSinkInterface.ts";

export class CollectingSink implements LogSinkInterface {
  /** Everything written to this sink, in order. */
  private readonly recorded: string[] = [];

  public write(message: string): void {
    this.recorded.push(message);
  }

  /** All messages written so far, in order. */
  public messages(): string[] {
    return this.recorded;
  }

  /**
   * The messages written so far, concatenated — the bytes an echoing sink
   * would have emitted.
   */
  public contents(): string {
    return this.recorded.join("");
  }
}
