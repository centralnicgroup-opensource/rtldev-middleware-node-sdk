// CNR/IBS Response are deliberate siblings (decision 1). The
// Response -> ResponseTranslator -> ResponseTemplateManager cycle is
// structural (the registry constructs Response instances for its
// templates) and resolved safely by ESM live bindings, since none of the
// three touch each other at module top-level.
// fallow-ignore-file circular-dependency
/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { AbstractResponse } from "../AbstractResponse.js";
import { Column } from "../Column.js";
import { Record } from "../Record.js";
import { MalformedResponseException } from "../Exception/MalformedResponseException.js";
import { ResponseParser as RP } from "./ResponseParser.js";
import { ResponseTranslator as RT } from "./ResponseTranslator.js";
import { SensitiveFields } from "./SensitiveFields.js";
import type { ExtendedResponseInterface } from "../ExtendedResponseInterface.js";
import type { RecordInterface } from "../RecordInterface.js";
import type { ResponseParserInterface } from "../ResponseParserInterface.js";
import type { ResponseTemplateManagerInterface } from "../ResponseTemplateManagerInterface.js";
import type { Hash, StringHash } from "../types.js";

/**
 * CNR Response
 *
 * Extends the shared `AbstractResponse` with the CNR wire specifics — the
 * translate()/populate() hooks, the CODE/DESCRIPTION status accessors and the
 * column-driven pagination primitives — and adds the richer CNR-only
 * capabilities declared on `ExtendedResponseInterface` (telemetry,
 * transient/pending status and the list-hash projection) that flat platforms
 * like IBS/Moniker do not provide.
 */
export class Response
  extends AbstractResponse
  implements ExtendedResponseInterface
{
  /**
   * Command parameter keys carrying sensitive data (masked before storage).
   * CNR uses upper-case keys. Declared once in {@link SensitiveFields.KEYS},
   * shared with `CNR.SocketConfig`.
   *
   * A `get` accessor, not a field — the base constructor reads this before
   * this class's field initialisers would run (see the field-initialisation-
   * order trap).
   */
  protected override get sensitiveFields(): string[] {
    return SensitiveFields.KEYS;
  }

  /**
   * Regex for CNR's pagination metadata keys — the five counters the API
   * returns *inside* PROPERTY, interleaved with the data columns
   * (`PROPERTY[TOTAL][0]` next to `PROPERTY[DOMAIN][0..n]`).
   *
   * These five names are reserved for pagination on this brand by
   * definition: a command answering one of them as data is an API defect,
   * not a case for the SDK to disambiguate. The alternation is grouped so
   * the `^…$` anchors apply to every keyword; without the group only
   * TOTAL/LAST are anchored and COUNT|LIMIT|FIRST would match anywhere,
   * wrongly excluding real columns such as COUNTRY, FIRSTNAME, DISCOUNT or
   * ACCOUNT.
   *
   * Since RSRMID-2965 a match is not registered as a column at all and the
   * pagination primitives below read PROPERTY directly — see
   * {@link AbstractResponse.metaKeys}.
   */
  protected override get metaKeys(): RegExp {
    return /^(TOTAL|COUNT|LIMIT|FIRST|LAST)$/;
  }

  /**
   * Translate the raw API response into its canonical form using the CNR
   * translator. `cmd` is already sanitized.
   */
  protected override translate(
    raw: string,
    cmd: StringHash,
    placeholders: StringHash,
    error: string | null = null,
    templates: ResponseTemplateManagerInterface | null = null,
  ): string {
    return new RT().translate(raw, cmd, placeholders, error, templates);
  }

  /**
   * Parse the translated response into the hash and build the column/record
   * lists from it. CNR exposes its columns under the PROPERTY sub-array and
   * assembles records only when properties are present.
   *
   * The five pagination counters arrive in that same PROPERTY block, and
   * are deliberately skipped rather than registered (RSRMID-2965): they are
   * response metadata, and a one-cell TOTAL "column" beside a 200-cell
   * DOMAIN one made {@link AbstractResponse.assembleRecords} count the
   * metadata as a row. The primitives below read them back off the hash.
   * Their cells are still validated by {@link stringCells} before being
   * dropped, so a parser handing CNR a non-string keeps failing at
   * construction wherever it put it — the guarantee does not get quietly
   * narrower for the keys that stopped being columns.
   *
   * `cmd` is forwarded to keep the parse call uniform across brands even
   * though the CNR parser ignores it — see `ResponseParserInterface.parse()`.
   */
  protected override populate(
    raw: string,
    parser: ResponseParserInterface,
    cmd: StringHash,
  ): void {
    this.hash = parser.parse(raw, cmd);
    // A PROPERTY that is absent or not an object yields no columns and no
    // records — the same as the is_array() guard this replaced.
    const properties = this.getHashArray("PROPERTY");
    const keys = Object.keys(properties);
    if (keys.length !== 0) {
      for (const key of keys) {
        const cells = Response.stringCells(key, properties[key]);
        if (this.isMetaKey(key)) {
          continue;
        }
        this.addColumn(key, cells);
      }
      this.assembleRecords();
    }
  }

  /**
   * Narrow one parsed PROPERTY entry to the string list a CNR column takes.
   *
   * The CNR wire format is textual, so every cell of a real response is
   * already a string and this rejects nothing; it exists because the parse
   * step is a seam (`ResponseParserInterface` returns `Hash`), so a substitute
   * parser handing CNR a non-string list is a programming error that must
   * fail loudly here rather than surface as a wrong value three calls later.
   * @throws MalformedResponseException if the entry is not an array, or a cell is not a string
   */
  private static stringCells(key: string, values: unknown): string[] {
    if (!Array.isArray(values)) {
      throw new MalformedResponseException(
        `CNR columns are string lists: PROPERTY[${key}] is a ${typeof values}.`,
      );
    }
    const cells: string[] = [];
    for (const cell of values) {
      if (typeof cell !== "string") {
        throw new MalformedResponseException(
          `CNR columns are string-valued: PROPERTY[${key}] carries a ${typeof cell}.`,
        );
      }
      cells.push(cell);
    }
    return cells;
  }

  /**
   * Get API response code.
   */
  public override getCode(): number {
    return Number.parseInt(this.getHashString("CODE"), 10) || 0;
  }

  /**
   * Get API response description.
   */
  public override getDescription(): string {
    return this.getHashString("DESCRIPTION");
  }

  /**
   * Get Queuetime of API response.
   */
  public getQueuetime(): number {
    if (Object.prototype.hasOwnProperty.call(this.hash, "QUEUETIME")) {
      return Number.parseFloat(this.getHashString("QUEUETIME")) || 0;
    }
    return 0;
  }

  /**
   * Get Runtime of API response.
   */
  public getRuntime(): number {
    if (Object.prototype.hasOwnProperty.call(this.hash, "RUNTIME")) {
      return Number.parseFloat(this.getHashString("RUNTIME")) || 0;
    }
    return 0;
  }

  /**
   * Check if current API response represents an error case.
   * API response code is a 5xx code.
   */
  public override isError(): boolean {
    return this.getHashString("CODE").startsWith("5");
  }

  /**
   * Check if current API response represents a success case.
   * API response code is a 2xx code.
   */
  public override isSuccess(): boolean {
    return this.getHashString("CODE").startsWith("2");
  }

  /**
   * Check if current API response represents a temporary error case.
   * API response code is a 4xx code.
   */
  public isTmpError(): boolean {
    return this.getHashString("CODE").startsWith("4");
  }

  /**
   * Check if current operation is returned as pending.
   *
   * Keys off `hash["PENDING"] === "1"`, matching PHP — not the pre-port Node
   * SDK's `COMMAND === "AddDomain"` + `STATUS === "REQUESTED"` heuristic.
   * See MIGRATION.md's "isPending() now keys off PENDING" entry for the v10
   * -> v11 behaviour change this causes for existing Node consumers.
   */
  public isPending(): boolean {
    return this.hash["PENDING"] === "1";
  }

  /**
   * Add a column to the column list.
   *
   * CNR responses are plaintext, so column values are always strings —
   * {@link stringCells} guarantees it before this is called. Protected: called
   * only from {@link populate}, since records are assembled from the columns
   * once, at the end of construction.
   * @param data array of column data, already narrowed by {@link stringCells}
   */
  protected addColumn(columnName: string, data: string[]): this {
    return this.registerColumn(new Column(columnName, data));
  }

  /**
   * Instantiate the record type for this brand.
   */
  protected override newRecord(row: Hash): RecordInterface {
    return new Record(row);
  }

  /**
   * Instantiate the response parser for this brand.
   */
  protected override newResponseParser(): ResponseParserInterface {
    return new RP();
  }

  /**
   * Read one of CNR's pagination counters, as a base-10 integer.
   *
   * The counters live in the PROPERTY block but are not columns (see
   * {@link populate}), so this reads the parsed hash —
   * `PROPERTY[<key>][0]`, a counter being a one-cell entry by construction
   * — rather than {@link getColumn}. An absent key, or an entry without a
   * first cell, is `null`: "this response carries no such counter", never a
   * stand-in value (RSRMID-2943, RSRMID-2965).
   */
  private metaInt(key: string): number | null {
    const properties = this.getHashArray("PROPERTY");
    const cells = properties[key];
    if (!Array.isArray(cells) || cells.length === 0) {
      return null;
    }
    const cell: unknown = cells[0];
    if (typeof cell !== "string") {
      return null;
    }
    const n = Number.parseInt(cell, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  /**
   * Get Index of first row in this response — the offset the current
   * window starts at, or `null` when this response carries no FIRST
   * counter (a non-list response).
   *
   * No "0 because there are rows" fallback (RSRMID-2965): that stand-in
   * made every response that happened to hold a row claim to be the first
   * page of a list.
   */
  public override getFirstRecordIndex(): number | null {
    return this.metaInt("FIRST");
  }

  /**
   * Get last record index of the current list query, or `null` when this
   * response carries no LAST counter.
   *
   * Reported exactly as CNR reports it, including the one shape that is
   * not a row index: an **empty** window echoes `LAST = FIRST` (with
   * `COUNT = 0`) rather than omitting LAST. Callers must not read it as
   * "the offset of a row that exists" — {@link AbstractResponse.hasNextPage}
   * is where that shape is accounted for. The former
   * `getRecordsCount() - 1` fallback is gone (RSRMID-2965): it answered a
   * *record index* to a question about a *result-set offset*, which agreed
   * with the wire on the first page only.
   */
  public override getLastRecordIndex(): number | null {
    return this.metaInt("LAST");
  }

  /**
   * Get Response as List Hash including useful meta data for tables.
   */
  public getListHash(): Hash {
    // The column set is already metadata-free (RSRMID-2965), so there is
    // no filtering left to do here: the pagination counters never became
    // columns.
    const columns = this.getColumnKeys();
    const lh: Hash[] = [];
    for (const rec of this.records) {
      lh.push(rec.getData());
    }
    return {
      LIST: lh,
      meta: {
        columns,
        // toArray(), not the Paginator itself: this projection is a table
        // renderer's payload and its key set is consumer-facing, so it
        // stays the flat object it has always been (RSRMID-2965, matching
        // PHP).
        pg: this.getPagination().toArray(),
      },
    };
  }

  /**
   * Get total count of records available for the list query, or `null`
   * when this response carries no TOTAL counter (a non-list response).
   *
   * No `getRecordsCount()` fallback (RSRMID-2943): a non-list response
   * reports "no total" honestly instead of a count that only happened to
   * equal the record count.
   */
  public override getRecordsTotalCount(): number | null {
    return this.metaInt("TOTAL");
  }

  /**
   * Get limit(ation) setting of the current list query — the count of
   * requested rows — or `null` when this response carries no LIMIT
   * counter.
   *
   * No `getRecordsCount()` fallback (RSRMID-2943), for the same reason as
   * {@link getRecordsTotalCount}: `0` is a real, requested limit and must
   * stay distinguishable from "this response carries no LIMIT counter at
   * all".
   */
  public override getRecordsLimitation(): number | null {
    return this.metaInt("LIMIT");
  }
}
