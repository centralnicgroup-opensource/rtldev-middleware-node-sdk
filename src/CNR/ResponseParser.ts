/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import type { ResponseParserInterface } from "../ResponseParserInterface.js";
import type { Hash, StringHash } from "../types.js";

/**
 * CNR ResponseParser
 *
 * Turns the line-oriented CNR wire format (`KEY=value`, with list columns
 * under `PROPERTY[NAME][index]`) into the response hash. Instantiable and
 * stateless — see {@link ResponseParserInterface} for why the parse step is a
 * seam rather than a static call.
 */
export class ResponseParser implements ResponseParserInterface {
  /**
   * Parse a raw CNR API response into a hash.
   *
   * The CNR wire format is self-describing, so `cmd` is accepted only to keep
   * the contract uniform across brands (IBS needs it to pick its JSON or
   * plain-text branch) and is deliberately unused here.
   *
   * @param raw API plain response
   * @param _cmd API command used within this request (unused)
   */
  public parse(raw: string, _cmd: StringHash = {}): Hash {
    const hash: Hash = {};
    const properties: { [key: string]: string[] } = {};
    const normalized = raw.replace(/\r\n/g, "\n");
    const rlist = normalized.split("\n");
    for (const item of rlist) {
      const m = /^([^=]*[^\t= ])[\t ]*=[\t ]*(.*)$/.exec(item);
      if (m === null) {
        continue;
      }
      const attr = m[1] ?? "";
      const value = (m[2] ?? "").replace(/[\t ]*$/, "");
      const propMatch = /^property\[([^\]]*)]/i.exec(attr);
      if (propMatch !== null) {
        const prop = (propMatch[1] ?? "").toUpperCase().replace(/\s/g, "");
        const list = properties[prop];
        if (list !== undefined) {
          list.push(value);
        } else {
          properties[prop] = [value];
        }
      } else {
        hash[attr.toUpperCase()] = value;
      }
    }
    if (Object.keys(properties).length !== 0) {
      hash["PROPERTY"] = properties;
    }
    return hash;
  }
}
