/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import type { ResponseParserInterface } from "../ResponseParserInterface.js";
import type { Hash, StringHash } from "../types.js";

/**
 * IBS ResponseParser
 *
 * Decodes the IBS/Moniker JSON payload, falling back to the plain-text
 * `key=value` format the templates and non-JSON responses use. Instantiable
 * and stateless — see `ResponseParserInterface` for why the parse step is a
 * seam rather than a static call.
 */
export class ResponseParser implements ResponseParserInterface {
  /**
   * Parse a raw API response into its hash form.
   *
   * @param raw raw (already translated) API response
   * @param cmd sanitized API command that produced the response
   */
  public parse(raw: string, cmd: StringHash = {}): Hash {
    const responseFormat = cmd["ResponseFormat"];
    const isJson =
      Object.keys(cmd).length === 0 || responseFormat?.toUpperCase() === "JSON";

    const invalidResponse: Hash = {
      status: "FAILURE",
      message: "423 Invalid API response. Contact Support",
    };

    // `JSON.parse` throwing on malformed input is this port's equivalent of
    // PHP's `json_decode()` returning `null` on failure.
    let result: unknown = null;
    if (isJson) {
      try {
        result = JSON.parse(raw);
      } catch {
        result = null;
      }
    }

    // A bare valid JSON scalar (number, quoted string, boolean) decodes to a
    // non-null, non-object value, which is not a shape any caller expects
    // here. Report it as invalid up front rather than routing it through the
    // plain-text parser below (which would mis-split a scalar containing "=").
    if (
      typeof result === "string" ||
      typeof result === "number" ||
      typeof result === "boolean"
    ) {
      return invalidResponse;
    }

    // Plain text key=value format (templates and non-JSON responses).
    if (result === null) {
      const data: Hash = {};
      for (const line of raw.split(/\r\n|\n/)) {
        const trimmed = line.trim();
        const pos = trimmed.indexOf("=");
        if (trimmed !== "" && pos !== -1) {
          data[trimmed.slice(0, pos)] = trimmed.slice(pos + 1);
        }
      }
      result = Object.keys(data).length === 0 ? null : data;
    }

    if (result === null) {
      return invalidResponse;
    }

    return result as Hash;
  }
}
