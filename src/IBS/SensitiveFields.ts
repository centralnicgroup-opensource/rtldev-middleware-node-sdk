/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

/**
 * IBS SensitiveFields
 *
 * The single declaration of which IBS command keys carry sensitive data
 * (account password, domain transfer authorization code). {@link SocketConfig}
 * and {@link Response} both read {@link SensitiveFields.KEYS} for their
 * `sensitiveFields` default instead of each hard-coding the same literal
 * array, so the two lists can no longer silently diverge. `MONIKER.SocketConfig`
 * inherits this via `extends IBS.SocketConfig` and `MONIKER` reuses `IBS.Response`
 * directly, so it needs no declaration of its own.
 *
 * Not part of the SDK's public surface — an internal anti-drift holder, not a
 * capability a consumer of the IBS API has any use for.
 *
 * Lowercase/camelCase keys, unlike CNR's `["PASSWORD","AUTH"]` — IBS's own
 * wire vocabulary, not a casing mistake.
 */
export class SensitiveFields {
  /**
   * IBS carries sensitive data under lower-/camel-case command keys.
   */
  public static readonly KEYS: string[] = ["password", "transferAuthInfo"];
}
