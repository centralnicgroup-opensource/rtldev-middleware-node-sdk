/**
 * Test support (RSRMID-2974 review)
 *
 * A `TransportInterface` double whose `post()` calls suspend until the test
 * explicitly releases them, in the order they arrived. Deterministic
 * interleaving control for concurrency tests — a `setTimeout()`-based delay
 * cannot guarantee which of two concurrent calls resumes first, or that a
 * mutation the test performs "between" two calls actually lands in the
 * window that matters; a manually-released gate can.
 *
 * `SpyTransport` records one call; this one records every call it has seen
 * and lets the test drive each one's completion independently, which is
 * what a real race between two in-flight `request()`s needs.
 */

import type {
  TransportInterface,
  TransportOptions,
} from "../../src/TransportInterface.ts";

export type RecordedCall = {
  url: string;
  data: string;
  timeout: number;
  userAgent: string;
  options: TransportOptions;
};

export class DelayedTransport implements TransportInterface {
  private static readonly DEFAULT_RAW =
    "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nEOF\r\n";

  /** Every call `post()` has received so far, in arrival order. */
  public readonly calls: RecordedCall[] = [];

  /** Resolvers for calls that have not yet been released, in arrival order. */
  private readonly pendingResolvers: (() => void)[] = [];

  /** Whether the client delegated {@link close} down to this transport. */
  public closed = false;

  /** @param raw canned wire response every released call resolves with */
  public constructor(
    private readonly raw: string = DelayedTransport.DEFAULT_RAW,
  ) {}

  public async post(
    url: string,
    data: string,
    timeout: number,
    userAgent: string,
    options: TransportOptions = {},
  ): Promise<[string, string | null]> {
    this.calls.push({ url, data, timeout, userAgent, options });
    await new Promise<void>((resolve) => {
      this.pendingResolvers.push(resolve);
    });
    return [this.raw, null];
  }

  /**
   * Release the oldest still-pending `post()` call, letting it resolve.
   * Throws if there is nothing pending — a test relying on this to release
   * a call that never arrived would otherwise hang silently instead.
   */
  public releaseNext(): void {
    const resolve = this.pendingResolvers.shift();
    if (resolve === undefined) {
      throw new Error(
        "DelayedTransport.releaseNext(): no pending call to release",
      );
    }
    resolve();
  }

  /** How many `post()` calls are currently suspended, awaiting release. */
  public get pendingCount(): number {
    return this.pendingResolvers.length;
  }

  public async close(): Promise<void> {
    this.closed = true;
  }
}
