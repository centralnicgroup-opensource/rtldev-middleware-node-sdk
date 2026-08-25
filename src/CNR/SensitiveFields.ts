/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

/**
 * CNR SensitiveFields
 *
 * The single declaration of which CNR command keys carry sensitive data
 * (account password, domain authorization code). `SocketConfig` and
 * `Response` both read {@link KEYS} for their `sensitiveFields` default
 * instead of each hard-coding the same literal array, so the two lists can no
 * longer silently diverge.
 *
 * Not part of the SDK's public surface — an internal anti-drift holder, not a
 * capability a consumer of the CNR API has any use for.
 */
export class SensitiveFields {
  /**
   * CNR carries sensitive data under upper-case command keys.
   */
  public static readonly KEYS: string[] = ["PASSWORD", "AUTH"];
}
