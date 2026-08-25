/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { InvalidDateTimeException } from "./Exception/InvalidDateTimeException.js";

/**
 * An immutable, UTC-only date/time value parsed from an API response.
 *
 * The Team Internet APIs declare their date columns in UTC and emit exactly two
 * shapes: a full timestamp (`2026-07-25 07:46:34`, optionally with a fractional
 * second part, as CNR sends) and a bare calendar date (`2030/07/17`, as
 * IBS/Moniker send — accepted directly, rather than being rewritten upstream).
 * This class parses both into one flat struct and does nothing else — it is a
 * **parser, not a formatter**. There is no `in(tz)`, no locale formatting and no
 * ICU dependency; presenting a value in the viewer's timezone is a display
 * concern and belongs in the consuming application.
 *
 * The date separator may be `-` or `/`, but must be consistent within one
 * value — `2026-02/20` and `2026/02-20` are both rejected. {@link date} and
 * {@link dateTime} always emit `-` regardless of the input separator, so a
 * consumer never has to branch on which one the source used.
 *
 * Responses are **not** rewritten to use this type. `getPlain()`, `getHash()`
 * and `getListHash()` keep returning the raw API strings; this parser is opt-in
 * at the point where a value is actually used.
 *
 * A bare calendar date names no instant, so {@link ts} and {@link dateTime} are
 * both `null` for one — deliberately, instead of defaulting to midnight, which
 * would be an invented instant a consumer could not tell apart from a real one.
 * {@link date} is always populated.
 *
 * {@link raw} keeps the original input string exactly as given — the only place
 * the discarded fractional-second precision, or the source's own separator,
 * survives. It is for display, logging and round-trip fidelity only;
 * comparison and sorting must use {@link ts} or {@link date}.
 *
 * ```ts
 * const dt = ApiDateTime.from("2026-07-25 07:46:34");
 * dt.ts;       // 1784965594
 * dt.date;     // "2026-07-25"
 * dt.dateTime; // "2026-07-25 07:46:34"
 * dt.raw;      // "2026-07-25 07:46:34"
 * ```
 */
export class ApiDateTime {
  /**
   * The only timezone this type ever represents. The API declares UTC and the
   * parser refuses offset-bearing input, so the value can never be anything
   * else — see {@link tz}.
   */
  private static readonly TIMEZONE = "UTC";

  /**
   * Shape gate for the two accepted formats, anchored at both ends.
   *
   * The date separator may be `-` (CNR) or `/` (IBS/Moniker); the captured
   * `sep` group plus the `\k<sep>` backreference requires the SAME separator
   * both times, so a mixed value like `2026-02/20` is rejected rather than
   * silently accepted. Only the space separator is accepted before a time
   * part — the ISO `T` variant, a `Z` suffix and numeric offsets are all
   * rejected rather than assumed to mean UTC.
   *
   * JS's `$` (without the `m` flag) already refuses a match immediately
   * before a trailing newline — unlike PCRE, which needs the `D` modifier for
   * that — so no extra flag is needed to stop `"2026-07-25\n"` from passing.
   */
  private static readonly PATTERN =
    /^(?<date>\d{4}(?<sep>[-/])\d{2}\k<sep>\d{2})(?: (?<time>\d{2}:\d{2}:\d{2})(?:\.\d+)?)?$/;

  /**
   * Unix timestamp (seconds) of the instant, or `null` when the source value
   * was a bare calendar date and the instant is therefore unknown.
   *
   * `ts === null` is the unambiguous test for a date-only value.
   */
  public readonly ts: number | null;

  /**
   * The calendar date as `Y-m-d`. Always populated, for both shapes.
   */
  public readonly date: string;

  /**
   * The full timestamp as `Y-m-d H:i:s`, or `null` for a date-only value.
   *
   * It is null rather than falling back to {@link date} on purpose: a
   * fallback would invent midnight UTC as the instant — precisely the
   * fictitious value `ts === null` exists to refuse.
   */
  public readonly dateTime: string | null;

  /**
   * Timezone of the source declaration — always `"UTC"`.
   */
  public readonly tz: string;

  /**
   * The original input string, exactly as passed to {@link from} /
   * {@link tryFrom} — no separator normalisation, no fractional-second
   * stripping.
   *
   * **Display, logging and round-trip fidelity only.** Comparison and sorting
   * must use {@link ts} or {@link date}, never `raw`: a string comparison of
   * `"2026/02/20"` against `"2026-03-01"` yields the wrong answer.
   */
  public readonly raw: string;

  /**
   * Private by design: instances come from {@link from} / {@link tryFrom}
   * only, which is what makes the UTC invariant structurally unforgeable.
   */
  private constructor(
    ts: number | null,
    date: string,
    dateTime: string | null,
    raw: string,
  ) {
    this.ts = ts;
    this.date = date;
    this.dateTime = dateTime;
    this.tz = ApiDateTime.TIMEZONE;
    this.raw = raw;
  }

  /**
   * Parse an API date/time value.
   *
   * Accepts `Y-m-d H:i:s` / `Y/m/d H:i:s` (with an optional fractional-second
   * part, which is discarded) and `Y-m-d` / `Y/m/d` — the separator may be
   * either, as long as it is the same one twice. Anything else throws —
   * including values that would otherwise roll over silently, such as
   * `2026-02-30` or `0000-00-00`.
   *
   * @throws InvalidDateTimeException If the value is not one of the two accepted shapes, or names a non-existent date or time
   */
  public static from(value: string): ApiDateTime {
    const match = ApiDateTime.PATTERN.exec(value);
    if (match?.groups === undefined) {
      throw new InvalidDateTimeException(
        `Unparsable API date/time value: "${value}". Expected "Y-m-d H:i:s" or "Y-m-d" in UTC ` +
          `(with a consistent "-" or "/" separator).`,
      );
    }

    const groups = match.groups as { date: string; sep: string; time?: string };
    // date/dateTime always emit "-" regardless of the input separator, so the
    // struct's shape does not depend on which brand sent it.
    const date = groups.date.split(groups.sep).join("-");
    const isDateOnly = groups.time === undefined;

    const [yearStr, monthStr, dayStr] = date.split("-") as [
      string,
      string,
      string,
    ];
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const day = Number(dayStr);

    let hour = 0;
    let minute = 0;
    let second = 0;
    if (groups.time !== undefined) {
      const [h, mi, s] = groups.time.split(":") as [string, string, string];
      hour = Number(h);
      minute = Number(mi);
      second = Number(s);
    }

    // setUTCFullYear()/setUTCHours() (rather than `new Date(Date.UTC(...))`)
    // sidestep the JS legacy quirk where a year in 0-99 passed to the Date
    // constructor/Date.UTC() is silently reinterpreted as 1900+year.
    const parsed = new Date(0);
    parsed.setUTCFullYear(year, monthIndex, day);
    parsed.setUTCHours(hour, minute, second, 0);

    // Reading every component back and comparing is what catches a rollover
    // (2026-02-30 -> 2026-03-02): Date's setters normalise silently instead of
    // erroring, so a "did it parse" check alone would let it through.
    const rolledOver =
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== monthIndex ||
      parsed.getUTCDate() !== day ||
      parsed.getUTCHours() !== hour ||
      parsed.getUTCMinutes() !== minute ||
      parsed.getUTCSeconds() !== second;

    if (rolledOver) {
      throw new InvalidDateTimeException(
        `Non-existent API date/time value: "${value}".`,
      );
    }

    if (isDateOnly) {
      return new ApiDateTime(null, date, null, value);
    }
    return new ApiDateTime(
      Math.floor(parsed.getTime() / 1000),
      date,
      // Non-null: reaching here means isDateOnly was false at line 196's
      // early return, which means groups.time !== undefined (line 151) —
      // not an immediately-preceding guard, a cross-branch invariant.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `${date} ${groups.time!}`,
      value,
    );
  }

  /**
   * Null-tolerant, non-throwing counterpart of {@link from}.
   *
   * Returns `null` for a `null` input and for anything {@link from} would
   * reject. Use it for optional columns that may be absent or empty; use
   * `from()` when an unparsable value is a bug you want to hear about.
   */
  public static tryFrom(value: string | null): ApiDateTime | null {
    if (value === null) {
      return null;
    }
    try {
      return ApiDateTime.from(value);
    } catch (e) {
      if (e instanceof InvalidDateTimeException) {
        return null;
      }
      throw e;
    }
  }

  /**
   * Whether the source value was a bare calendar date, naming no instant.
   *
   * Equivalent to `ts === null`.
   */
  public isDateOnly(): boolean {
    return this.ts === null;
  }

  /**
   * The value as a plain object — ready for `JSON.stringify()` and for
   * handing to a template or frontend.
   */
  public toArray(): {
    ts: number | null;
    date: string;
    dateTime: string | null;
    tz: string;
    raw: string;
  } {
    return {
      ts: this.ts,
      date: this.date,
      dateTime: this.dateTime,
      tz: this.tz,
      raw: this.raw,
    };
  }
}
