/**
 * Test support (RSRMID-2974, porting RSRMID-2910)
 *
 * Record/replay ("cassette") HTTP transport for offline `request()` tests.
 *
 * Sitting behind {@link TransportInterface}, it is injected onto a client via
 * `AbstractClient.setTransport()` and intercepts the single choke point every
 * brand's `request()`/`login()`/`logout()`/pagination call passes through —
 * `AbstractClient.executeCurl()`. Two modes:
 *
 *  - **record** (`RTLDEV_MW_RECORD` set): each {@link post} call is delegated
 *    to a real inner transport (a plain `HttpTransport`), the true wire bytes
 *    are captured and written to `{dir}/{cassette}.json`, and the live tuple
 *    is returned.
 *  - **replay** (default, CI): no inner transport, no network — {@link post}
 *    returns the recorded exchanges back in the order they were captured.
 *
 * Cassettes are recorded at the transport layer (pre-`translate()`), so
 * replay feeds the raw bytes back through `newResponse()`/`translate()`
 * exactly like a live call. A cassette file is a bare JSON array of
 * `{"raw", "error"}` exchange objects, because one logical test operation
 * (e.g. list pagination, or `login()` + `logout()`) can drive several
 * `post()` calls; successive calls under one {@link useCassette} map to
 * successive array entries. `useCassette()` lives here only, never on
 * `TransportInterface`, so `src/` stays clean.
 *
 * `useCassette()` is synchronous (a straight port of PHP's, which loads the
 * file eagerly so a missing recording fails fast) even though {@link post}
 * must be async — the network step is the only genuinely async boundary in
 * this SDK, and reading a committed fixture off local disk is not it.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type {
  TransportInterface,
  TransportOptions,
} from "../../src/TransportInterface.ts";

/** One recorded `{"raw", "error"}` exchange as it is stored on disk. */
type CassetteExchange = {
  raw: string;
  error: string | null;
};

/** A `[raw, error]` tuple, matching `TransportInterface.post()`'s resolution. */
type Exchange = [string, string | null];

export class CassetteTransport implements TransportInterface {
  private cassette = "";

  /** Recorded exchanges for the current cassette, replayed in order. */
  private exchanges: Exchange[] = [];

  /** Cursor into {@link exchanges} for the current cassette. */
  private cursor = 0;

  /** Whether a cassette has been selected for the current run. */
  private selected = false;

  /**
   * @param inner real transport used in record mode; null in replay
   * @param dir directory holding the cassette JSON files
   * @param record true to record live exchanges, false to replay
   */
  public constructor(
    private readonly inner: TransportInterface | null,
    private readonly dir: string,
    private readonly record: boolean,
  ) {}

  /**
   * Select the cassette used by the following {@link post} calls, resetting
   * the exchange cursor. In replay mode the cassette file is loaded eagerly
   * so a missing recording fails fast with a clear, actionable message.
   */
  public useCassette(name: string): void {
    this.cassette = name;
    this.cursor = 0;
    this.exchanges = [];
    this.selected = true;

    if (this.record) {
      return;
    }

    const file = this.path();
    if (!existsSync(file)) {
      throw new Error(
        `Cassette "${name}" not found at ${file}. Record it with RTLDEV_MW_RECORD=1 (pnpm test:record).`,
      );
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      throw new Error(`Cassette "${name}" is malformed: ${file}`);
    }
    if (!Array.isArray(decoded)) {
      throw new Error(`Cassette "${name}" is malformed: ${file}`);
    }

    const exchanges: Exchange[] = [];
    for (const ex of decoded as unknown[]) {
      if (typeof ex !== "object" || ex === null || !("raw" in ex)) {
        throw new Error(`Cassette "${name}" has a malformed exchange: ${file}`);
      }
      const rec = ex as { raw: unknown; error?: unknown };
      const error = typeof rec.error === "string" ? rec.error : null;
      exchanges.push([String(rec.raw), error]);
    }
    this.exchanges = exchanges;
  }

  public async post(
    url: string,
    data: string,
    timeoutSeconds: number,
    userAgent: string,
    options?: TransportOptions,
  ): Promise<Exchange> {
    if (!this.selected) {
      throw new Error(
        "No cassette selected. Call useCassette() before driving a request through CassetteTransport.",
      );
    }

    if (this.record) {
      if (this.inner === null) {
        throw new Error("Record mode requires an inner transport.");
      }
      const exchange = await this.inner.post(
        url,
        data,
        timeoutSeconds,
        userAgent,
        options,
      );
      this.exchanges.push(exchange);
      this.flush();
      return exchange;
    }

    const next = this.exchanges[this.cursor];
    if (next === undefined) {
      throw new Error(
        `Cassette "${this.cassette}" exhausted after ${this.cursor} exchange(s); the test made more requests ` +
          "than were recorded. Re-record with RTLDEV_MW_RECORD=1.",
      );
    }
    this.cursor++;
    return next;
  }

  public async close(): Promise<void> {
    await this.inner?.close();
  }

  /** Persist the current cassette's exchanges to disk (record mode). */
  private flush(): void {
    if (!existsSync(this.dir)) {
      mkdirSync(this.dir, { recursive: true });
    }
    const payload: CassetteExchange[] = this.exchanges.map(([raw, error]) => ({
      raw,
      error,
    }));
    writeFileSync(this.path(), `${JSON.stringify(payload, null, 2)}\n`);
  }

  private path(): string {
    return `${this.dir.replace(/\/+$/, "")}/${this.cassette}.json`;
  }
}
