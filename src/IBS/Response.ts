// CNR/IBS Response are deliberate siblings (decision 1). The
// Response -> ResponseTranslator -> ResponseTemplateManager cycle is
// structural (the registry constructs Response instances for its
// templates) and resolved safely by ESM live bindings, since none of the
// three touch each other at module top-level.
// fallow-ignore-file circular-dependency
/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import { AbstractResponse } from "../AbstractResponse.js";
import { Column } from "../Column.js";
import { Record } from "../Record.js";
import { ResponseParser } from "./ResponseParser.js";
import { ResponseTranslator } from "./ResponseTranslator.js";
import { SensitiveFields } from "./SensitiveFields.js";
import type { RecordInterface } from "../RecordInterface.js";
import type { ResponseInterface } from "../ResponseInterface.js";
import type { ResponseParserInterface } from "../ResponseParserInterface.js";
import type { ResponseTemplateManagerInterface } from "../ResponseTemplateManagerInterface.js";
import type { Hash, StringHash } from "../types.js";

/**
 * IBS Response
 *
 * Extends the shared `AbstractResponse` and supplies only what differs for
 * the IBS platform: JSON-shaped parsing (translate()/populate()), the
 * code/description accessors and the flat (single-page) pagination model.
 * The constructor, column/record bookkeeping and derived pagination are
 * inherited.
 *
 * IBS does NOT provide the CNR-only telemetry/transient-status/list-hash
 * capabilities (`ExtendedResponseInterface`) — this class implements only
 * `ResponseInterface`, not that interface, so those methods are absent
 * rather than present-and-throwing.
 */
export class Response extends AbstractResponse implements ResponseInterface {
  /**
   * The count keys IBS emits alongside a list, as a regex alternation.
   *
   * Kept apart from {@link metaKeys} because on this brand the count keys
   * are also a **lookup pattern**, not just an exclusion list: the same
   * fact arrives under four different names depending on the endpoint —
   * Domain/List carries "domaincount", Url-/EmailForward/List
   * "total_rules", DnsRecord/List "total_records", Nameserver/List
   * "total_hosts" — so {@link getRecordsTotalCount} has to *scan* the hash
   * for whichever one is present. Do not "simplify" this into a plain list
   * of names, and do not fold it into {@link metaKeys}'s match order:
   * matching that would find "transactid" first.
   *
   * The alternation is anchored by {@link COUNT_KEY_PATTERN} and by
   * {@link metaKeys} so it matches these keys exactly and never as a
   * substring. In particular the loose ".*count" form is avoided on
   * purpose: Domain/Count returns one top-level key per TLD the reseller
   * holds, and ".discount" is a real gTLD, so a key literally named
   * "discount" can occur and must NOT be treated as metadata.
   * "totaldomains" (Domain/Count's grand total) is intentionally not
   * matched either — Domain/Count is a portfolio-structure query, not a
   * list, and its total is meaningful aggregate data.
   */
  private static readonly COUNT_KEYS = "total_.*|domaincount";

  /**
   * Anchored form of {@link COUNT_KEYS}, for the count-key scan in
   * {@link metaCount}.
   */
  private static readonly COUNT_KEY_PATTERN = new RegExp(
    `^(${Response.COUNT_KEYS})$`,
  );

  /**
   * Regex for IBS's response metadata keys — the count keys above plus the
   * transaction-level fields every IBS response carries at the root
   * (transactid, status, message, code).
   *
   * The transaction fields are metadata for the same reason the counters
   * are (RSRMID-2965): they describe the *response*, not a row.
   * Registering them as columns put "status" on row 0 of a domain list and
   * on no other row, and made an empty list — which returns status and
   * domaincount and no "domain" key at all — report one phantom row
   * consisting entirely of metadata. They stay reachable where they
   * belong: {@link getCode}, {@link getDescription}, {@link isError}/
   * {@link isSuccess} and `AbstractResponse.getHash()` all read the hash,
   * not the columns.
   *
   * A `get` accessor, not a field — see `AbstractResponse.metaKeys`'s
   * docblock for why.
   */
  protected override get metaKeys(): RegExp {
    return new RegExp(
      `^(transactid|status|message|code|${Response.COUNT_KEYS})$`,
    );
  }

  /**
   * A `get` accessor, not a field: `AbstractResponse`'s constructor reads
   * this while sanitising the command, before a subclass field initialiser
   * would have run (the #1 trap of this port).
   */
  protected override get sensitiveFields(): string[] {
    return SensitiveFields.KEYS;
  }

  /**
   * Translate the raw API response using the IBS translator.
   *
   * @param cmd API command used within this request
   * @param error transport error, if any; non-null means `raw` is unusable
   * @param templates registry to resolve template ids against; null uses IBS's built-ins
   */
  protected override translate(
    raw: string,
    cmd: StringHash,
    placeholders: StringHash,
    error: string | null = null,
    templates: ResponseTemplateManagerInterface | null = null,
  ): string {
    return new ResponseTranslator().translate(
      raw,
      cmd,
      placeholders,
      error,
      templates,
    );
  }

  /**
   * Parse the translated response with the IBS parser and build the
   * columns from it. IBS responses are flat key => value maps; each
   * **data** entry becomes a column, JSON list values kept as-is and
   * anything else wrapped into a single-cell list so the shared record
   * assembly can iterate them.
   *
   * The metadata entries are skipped (RSRMID-2965) — see {@link metaKeys}
   * for which ones and why. That is the whole fix for both of this
   * brand's row defects: uniform row shape, because "status" is no longer
   * a one-cell column landing on row 0 of an n-row list, and 0 records
   * instead of 1 for an empty list, because nothing is left to size a row
   * from.
   *
   * @param cmd API command used within this request, already sanitized
   */
  protected override populate(
    raw: string,
    parser: ResponseParserInterface,
    cmd: StringHash,
  ): void {
    this.hash = parser.parse(raw, cmd);
    for (const key of Object.keys(this.hash)) {
      if (this.isMetaKey(key)) {
        continue;
      }
      const value = this.hash[key];
      this.addColumn(key, Array.isArray(value) ? value : [value]);
    }
    this.assembleRecords();
  }

  /**
   * Add a column to the column list.
   *
   * IBS responses are JSON, so column values are arbitrary (nested arrays and
   * objects included); the shared `Column` is used as-is. Called only from
   * {@link populate} (RSRMID-2939: records are assembled once, at the end of
   * construction, so a column added afterwards would be invisible to them).
   */
  protected addColumn(columnName: string, data: unknown[]): this {
    return this.registerColumn(new Column(columnName, data));
  }

  /**
   * Instantiate the record type for this brand.
   */
  protected override newRecord(row: Hash): RecordInterface {
    return new Record(row);
  }

  /**
   * Instantiate the response parser for this brand (Moniker inherits it).
   */
  protected override newResponseParser(): ResponseParserInterface {
    return new ResponseParser();
  }

  /**
   * Get API response code.
   *
   * IBS returns a numeric "code" on some responses even though it is not
   * part of the public API documentation. Two shapes occur: a top-level
   * "code", and — since the switch to ResponseFormat=JSON — a per-product
   * code nested under product[0].code. When present the code is returned
   * as-is; otherwise it is derived from the status: 200 for success, 500 for
   * an error (see {@link isError}).
   */
  public override getCode(): number {
    const topLevel = this.hash["code"];
    if (Response.isNumeric(topLevel)) {
      return Number(topLevel);
    }
    const nestedCode = this.getProductFirst()["code"];
    if (Response.isNumeric(nestedCode)) {
      return Number(nestedCode);
    }
    return this.isSuccess() ? 200 : 500;
  }

  /**
   * Get API response description.
   */
  public override getDescription(): string {
    const message = this.getHashString("message");
    if (message !== "") {
      return message;
    }
    // Per-product message nested under product[0].message, mirroring
    // getCode()'s product[0].code handling.
    const nestedMessage = this.getProductFirst()["message"];
    if (typeof nestedMessage === "string" && nestedMessage !== "") {
      return nestedMessage;
    }
    return this.isSuccess()
      ? "Command completed successfully"
      : "Command failed";
  }

  /**
   * PHP's `(array)($this->hash["product"] ?? [])[0] ?? []` chain, simplified:
   * the API always emits "product" as a JSON list when present, so reading
   * plain array index 0 is enough — PHP's looser array-cast semantics for a
   * value that in practice is never anything else are not worth reproducing.
   */
  private getProductFirst(): Hash {
    const product = this.hash["product"];
    const first = Array.isArray(product)
      ? (product as unknown[])[0]
      : undefined;
    return typeof first === "object" && first !== null ? (first as Hash) : {};
  }

  /**
   * PHP's `is_numeric()`: true for a finite number or a non-empty numeric
   * string.
   */
  private static isNumeric(value: unknown): boolean {
    if (typeof value === "number") {
      return Number.isFinite(value);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed !== "" && !Number.isNaN(Number(trimmed));
    }
    return false;
  }

  /**
   * Check if current API response represents an error case.
   *
   * FAILURE is the only IBS status that signals an error. Every other status
   * means the command itself succeeded — "SUCCESS" for ordinary commands, and
   * for Domain/Check specifically "AVAILABLE"/"UNAVAILABLE", which report the
   * domain's registrability rather than a failure.
   */
  public override isError(): boolean {
    return this.getHashString("status") === "FAILURE";
  }

  /**
   * Check if current API response represents a success case.
   *
   * The complement of {@link isError} — any non-FAILURE status (SUCCESS,
   * AVAILABLE, UNAVAILABLE, ...) is a success.
   */
  public override isSuccess(): boolean {
    return !this.isError();
  }

  /**
   * The value of whichever count key this response carries, or `null` if
   * it carries none.
   *
   * The single wire read all four pagination primitives below are built
   * from: IBS returns the full result set in one page, so the count key is
   * the only pagination fact on the wire, and first/last/total/limit are
   * four questions about it. Scans for the first root key matching
   * {@link COUNT_KEY_PATTERN} because the key's name is endpoint-dependent
   * — see {@link COUNT_KEYS}.
   *
   * Numeric strings are accepted as well as numbers: the JSON wire is not
   * consistent about quoting counts.
   */
  private metaCount(): number | null {
    for (const key of Object.keys(this.hash)) {
      const value = this.hash[key];
      if (Response.COUNT_KEY_PATTERN.test(key) && Response.isNumeric(value)) {
        return Number(value);
      }
    }
    return null;
  }

  /**
   * Get index of first row in this response — `0` for a list, `null` for a
   * response that is not one.
   *
   * IBS's single page always starts at offset 0, so the only question is
   * whether this response describes a list at all; the presence of a
   * count key is what answers it. The former unconditional `0` was a
   * stand-in (RSRMID-2965) that made every Domain/Info or Domain/Check
   * look like the first page of a list.
   */
  public override getFirstRecordIndex(): number | null {
    return this.metaCount() === null ? null : 0;
  }

  /**
   * Get last record index of the current list query, or `null` when this
   * response carries no count key, or carries one that counts nothing.
   *
   * `count - 1`, from the wire count rather than from the record list
   * (RSRMID-2965). An empty list answers `null`, not `-1`: with the
   * metadata no longer forming a phantom row there is no row for an index
   * to point at, and `-1` was never a usable answer anyway — it was the
   * artefact that made the old code abandon the count key altogether.
   */
  public override getLastRecordIndex(): number | null {
    const total = this.metaCount();
    return total === null || total <= 0 ? null : total - 1;
  }

  /**
   * Get total count of records available for the list query, or `null`
   * when this response carries no count key (it is not a list).
   *
   * No `getRecordsCount()` (RSRMID-2965): the wire count is the brand's
   * own answer to "how many are there", and the record count is a
   * property of the rows this object holds — `getRecord()`'s bounds
   * authority, which must stay grounded in the array it indexes. They
   * agree on every honest IBS list, and conflating them is what let a
   * phantom row masquerade as a total.
   */
  public override getRecordsTotalCount(): number | null {
    return this.metaCount();
  }

  /**
   * Get limit(ation) setting of the current list query — the count of
   * requested rows — or `null` when this response carries no count key.
   *
   * IBS has no limit/offset concept: one request returns the whole result
   * set, so the window size *is* the total and both read the same count
   * key. This is not a stand-in for an absent LIMIT — it is what a
   * single-page brand's limit means — and it keeps the shared derivation
   * answering "1 page, no next page" from arithmetic rather than from a
   * brand special case.
   */
  public override getRecordsLimitation(): number | null {
    return this.metaCount();
  }
}
