/**
 * Test support (RSRMID-2974, porting RSRMID-2924)
 *
 * Recording `ResponseParserInterface` double.
 *
 * Ignores the wire entirely: it returns a canned hash and records what the
 * Response handed it, so a test can prove that the substitute — not the
 * brand parser — produced the response, and that it was fed the *translated*
 * raw plus the *sanitized* command. The parser twin of {@link SpyTransport}.
 *
 * The canned hash deliberately carries both brands' status keys (CNR's
 * CODE/DESCRIPTION and IBS's status/message) plus a PROPERTY block, so one
 * double drives the column/record assembly of either brand.
 *
 * Deliberately records only what is asserted on today and takes no
 * configuration it is not given — add a field when a test needs it, rather
 * than speculatively widening this ahead of time.
 */

import type { ResponseParserInterface } from "../../src/ResponseParserInterface.ts";
import type { Hash, StringHash } from "../../src/types.ts";

export class SpyResponseParser implements ResponseParserInterface {
  /** Canned hash returned in place of a real parse. */
  private static readonly HASH: Hash = {
    CODE: "999",
    DESCRIPTION: "from the substitute",
    status: "FAILURE",
    message: "from the substitute",
    PROPERTY: { SUBSTITUTE: ["a", "b"] },
  };

  /** Raw response handed over by the Response; empty until the first call. */
  public seenRaw = "";

  /** Command handed over by the Response. */
  public seenCmd: StringHash = {};

  public parse(raw: string, cmd: StringHash = {}): Hash {
    this.seenRaw = raw;
    this.seenCmd = cmd;
    return SpyResponseParser.HASH;
  }
}
