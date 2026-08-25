/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { toAscii } from "idna-uts46-hx";
import type { StringHash } from "../types.js";

/**
 * Rewrites the IDN-bearing parameters of a CNR API command to punycode.
 *
 * ## Why this is a module and not a client method
 *
 * These rules are CNR domain knowledge: which parameter names carry a domain
 * name, that `OBJECTID` is a pattern parameter whose content depends on
 * `OBJECTCLASS`, and that an already-ASCII value must be left alone. They are
 * called from CNR's `Client.buildCommand()` hook — the brand variation point
 * the shared request template method already provides — and asserted
 * directly in `tests/CNR/IDNCommandRewriter.spec.ts`.
 *
 * Synchronous throughout: `toAscii()` from `idna-uts46-hx` is synchronous, so
 * there is no async boundary to cross here.
 */
export class IDNCommandRewriter {
  /**
   * Values consisting only of letters, digits, dots and hyphens are already
   * on the wire alphabet and are passed through untouched.
   */
  private static readonly ASCII_PATTERN = /^[a-zA-Z0-9.-]+$/i;

  /**
   * Parameters carrying a domain name that the API does *not* convert itself.
   * `DOMAIN` is absent on purpose — the API converts that one server-side.
   * `NS`/`NS<n>` is the short nameserver form (RSRBE-7149).
   */
  private static readonly KEY_PATTERN =
    /^(PARENTDOMAIN|NAMESERVER|NS|DNSZONE)([0-9]*)$/i;

  /**
   * The `OBJECTCLASS` values for which `OBJECTID` holds a domain-like name.
   * Anything else (a contact handle, a user id, ...) must not be converted.
   */
  private static readonly OBJECTCLASS_PATTERN =
    /^(DOMAIN(APPLICATION|BLOCKING)?|NAMESERVER|NS|DNSZONE)$/i;

  /**
   * Convert the IDN-bearing values of a flattened CNR command to punycode.
   *
   * Values are rewritten in a fresh object so key order survives — this runs
   * after `CommandFormatter.flattenCommand()` has applied the priority sort,
   * and the wire output must not depend on it.
   *
   * @param cmd flattened API command
   * @returns the command with IDN values converted to punycode
   */
  public static rewrite(cmd: StringHash): StringHash {
    const objectClass = cmd["OBJECTCLASS"] ?? null;
    const result: StringHash = { ...cmd };
    for (const [key, val] of Object.entries(cmd)) {
      if (
        !IDNCommandRewriter.carriesDomainName(key, objectClass) ||
        IDNCommandRewriter.ASCII_PATTERN.test(val)
      ) {
        continue;
      }
      try {
        result[key] = toAscii(val);
      } catch {
        // Deliberate divergence from PHP: `(string)$row["punycode"]` on a
        // failed (string|false) conversion writes the empty string onto the
        // wire there. Keeping the caller's original value instead is a
        // strict improvement — an unconverted name is a better failure mode
        // than an empty command parameter.
      }
    }
    return result;
  }

  /**
   * Whether the given command key holds a domain name that needs converting.
   *
   * `OBJECTID` is the one key whose answer depends on another parameter: it
   * is a pattern parameter in the CNR API and does not accept IDNs, but what
   * it matches against is whatever `OBJECTCLASS` selects, so it is only a
   * domain name for the domain-like classes (RSRTPM-3167).
   */
  private static carriesDomainName(
    key: string,
    objectClass: string | null,
  ): boolean {
    if (IDNCommandRewriter.KEY_PATTERN.test(key)) {
      return true;
    }
    return (
      key === "OBJECTID" &&
      objectClass !== null &&
      IDNCommandRewriter.OBJECTCLASS_PATTERN.test(objectClass)
    );
  }
}
