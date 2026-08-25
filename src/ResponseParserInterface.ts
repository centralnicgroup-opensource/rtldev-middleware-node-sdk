import type { Hash, StringHash } from "./types.js";

/**
 * Contract for the brand parser that turns a raw API response into its hash
 * form.
 *
 * Isolating the parse step behind this seam is the Response-tree twin of
 * {@link TransportInterface}: a substitute parser can be handed to a Response
 * without reflection or subclassing, and each brand's real parser can be
 * exercised directly instead of only through a fully constructed Response.
 * The production implementations are `CNR.ResponseParser` (line-oriented
 * `key=value` with `PROPERTY[…]` columns) and `IBS.ResponseParser` (JSON,
 * falling back to plain text), used by IBS and Moniker alike.
 *
 * The signature is deliberately uniform across brands even though only IBS
 * reads `cmd` — a contract the two could not both satisfy would be no
 * contract at all. CNR's wire format is self-describing and its parser
 * ignores the argument.
 */
export interface ResponseParserInterface {
  /**
   * Parse a raw API response into its hash form.
   *
   * @param raw raw (already translated) API response
   * @param cmd sanitized API command that produced the response
   */
  parse(raw: string, cmd?: StringHash): Hash;
}
