/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

/**
 * CommandRedactor
 *
 * The single home for "which command keys are sensitive, and how do we mask
 * them" — shared by `AbstractSocketConfig` (which skips `null` values because
 * they are dropped from the request, not logged) and `AbstractResponse`
 * (whose command values are never `null`, so the skip is a no-op there, not a
 * behaviour change). Both call sites keep their own `sensitiveFields`
 * property — the two class hierarchies (SocketConfig side, Response side)
 * must each stay independently safe, since both `CNR.Response` and
 * `IBS.Response` are publicly constructible directly with a raw, unmasked
 * `cmd` object — this class only removes the duplicated matching/masking
 * algorithm they each ran over their own list.
 *
 * Not part of the SDK's public surface: it helps nobody talk to the API, it
 * only keeps this SDK's own two masking call sites in step.
 */
export class CommandRedactor {
  /**
   * The replacement value written over a sensitive command value.
   */
  public static readonly MASK = "***";

  /**
   * Mask the values of the sensitive keys in `command`.
   *
   * Matching is case-insensitive, so only the names in `sensitiveFields`
   * matter, not their casing versus the command's actual keys. A `null`
   * value is left untouched even when its key matches — the SocketConfig
   * caller relies on this to leave a dropped-from-the-request parameter as
   * `null` rather than turning it into the literal string "***".
   *
   * Builds and returns a new object rather than mutating `command` in
   * place, which is what lets the return type track the input's value type
   * (string|null in, string|null out) instead of widening every caller to
   * string|null regardless of whether it ever passes a null.
   */
  public static redact<TValue extends string | null>(
    command: { [key: string]: TValue },
    sensitiveFields: string[],
  ): { [key: string]: TValue | string } {
    const sensitive = sensitiveFields.map((field) => field.toLowerCase());
    const redacted: { [key: string]: TValue | string } = {};
    for (const [key, val] of Object.entries(command)) {
      redacted[key] =
        val !== null && sensitive.includes(key.toLowerCase())
          ? CommandRedactor.MASK
          : val;
    }
    return redacted;
  }
}
