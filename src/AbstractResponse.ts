/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { CommandFormatter } from "./CommandFormatter.js";
import { CommandRedactor } from "./CommandRedactor.js";
import { DuplicateColumnException } from "./Exception/DuplicateColumnException.js";
import { Paginator } from "./Paginator.js";
import type { ColumnInterface } from "./ColumnInterface.js";
import type { RecordInterface } from "./RecordInterface.js";
import type { ResponseInterface } from "./ResponseInterface.js";
import type { ResponseParserInterface } from "./ResponseParserInterface.js";
import type { ResponseTemplateManagerInterface } from "./ResponseTemplateManagerInterface.js";
import type { Hash, StringHash } from "./types.js";

/**
 * Shared Response foundation
 *
 * Brand-neutral base for every registrar Response. It owns the machinery that
 * is identical across brands — the constructor skeleton (template method),
 * command sanitisation, column/record bookkeeping, record iteration and the
 * assembly of the {@link Paginator} — and leaves the parts that genuinely
 * differ to the concrete subclasses:
 *
 *   - wire hooks: {@link translate} / {@link populate} (protected),
 *   - factories: {@link newRecord} and {@link newResponseParser} (protected),
 *   - the brand's own `addColumn()` (protected), which has to build its
 *     correctly-typed Column before handing it to {@link registerColumn},
 *   - the status/code accessors declared on `ResponseInterface`
 *     (getCode/getDescription/isError/isSuccess) — each reads a different wire
 *     shape,
 *   - the pagination primitives, likewise declared on `ResponseInterface`
 *     (getFirstRecordIndex, getLastRecordIndex, getRecordsTotalCount,
 *     getRecordsLimitation) — the four methods that read a brand's own
 *     pagination metadata off its hash (metadata is not column data since
 *     RSRMID-2965 — see {@link metaKeys}) — which this base deliberately does
 *     NOT implement, not even as single-page defaults — so a brand that
 *     forgets pagination fails at declaration time instead of silently
 *     answering "one page, no next page". The seam is drawn at the wire: a
 *     brand answers only what its own metadata says, and every derivation from
 *     those four answers is shared and written once — on {@link Paginator}
 *     since RSRMID-2965, which this base only assembles (see
 *     {@link getPagination}). RSRMID-2943 first collected those derivations
 *     here, for the same reason they now sit one step further out: none of
 *     them reads a column of its own.
 *
 * `CNR.Response` and `IBS.Response` both extend this as siblings (decision #1)
 * — neither brand is-a the other. The CNR-only capabilities (telemetry,
 * transient/pending status, list-hash) live on `CNR.Response` via
 * `ExtendedResponseInterface` and are deliberately NOT part of this base, so
 * brands like IBS/Moniker never inherit methods they cannot support.
 *
 * `sensitiveFields` and `metaKeys` are `get` accessors, not fields — the
 * #1 trap of this whole port: JS runs a subclass's field initialisers *after*
 * `super()` returns, so if these were plain properties a brand's override
 * would still read as the neutral default while this base's constructor runs.
 * A `get` accessor lives on the prototype and is available from the first
 * instant of construction, which is what makes the override visible in time.
 */
export abstract class AbstractResponse implements ResponseInterface {
  /**
   * The API Command used within this request (sanitized).
   */
  protected command: StringHash = {};

  /**
   * Plain API response.
   */
  protected raw = "";

  /**
   * Hash representation of the plain API response. The concrete parse happens
   * in the abstract {@link populate} hook, called from the constructor.
   */
  protected hash: Hash = {};

  /**
   * Column names available in this response.
   */
  protected columnKeys: string[] = [];

  /**
   * Container of Column instances.
   */
  protected columns: ColumnInterface[] = [];

  /**
   * Map of column name to its index in the column/columnKeys lists.
   * Maintained by {@link registerColumn} to provide O(1) column lookup. First
   * occurrence wins.
   */
  protected columnIndex: { [key: string]: number } = {};

  /**
   * Record list (list of rows).
   */
  protected records: RecordInterface[] = [];

  /**
   * Context data for the response.
   */
  protected context: Hash = {};

  /**
   * API request url.
   */
  protected requestUrl = "";

  /**
   * Command parameter keys that carry sensitive data for this brand (account
   * password, domain authorization code, ...). Their values are masked before
   * the command is stored so they can never be read back (e.g. by custom
   * loggers). Matching is case-insensitive (see {@link sanitizeCommand}), so
   * only the names matter, not their casing.
   *
   * A `get` accessor, not a field — see the class docblock. The neutral
   * default masks nothing; a brand overrides this accessor with its own
   * `SensitiveFields.KEYS`.
   */
  protected get sensitiveFields(): string[] {
    return [];
  }

  /**
   * Pattern for the response-level metadata keys this brand's wire format
   * mixes in among the data keys — pagination counters and, on brands that
   * carry them, the transaction-level status fields.
   *
   * **Metadata is not column data (RSRMID-2965).** A key matching this is
   * never registered as a column, so it appears in neither
   * {@link getColumnKeys}, {@link getColumns} nor any assembled record; the
   * pagination primitives read it straight off `hash` instead (via
   * {@link isMetaKey}). It used to become a one-cell column beside a
   * 200-cell data column, which made {@link assembleRecords} size the record
   * list as if the metadata were a row: an empty window carrying nothing but
   * counters reported one phantom record whose entire content was metadata,
   * and a populated list put the metadata on row 0 only. Both follow from
   * the modelling error, not from row assembly — which needed no change once
   * the column set became correct.
   *
   * A `get` accessor for the same reason as {@link sensitiveFields} — see
   * the class docblock. Brand-specific: each brand sets the keys its own
   * endpoints emit, and the two sets stay independent on purpose — CNR's
   * QueryDomainHistoryList returns a data column named STATUS, which a set
   * shared with IBS would silently delete. The neutral default (matches only
   * the empty string, i.e. no real key) excludes nothing, so a brand without
   * metadata keys needs no override.
   */
  protected get metaKeys(): RegExp {
    return /^$/;
  }

  /**
   * Is this wire key response metadata rather than data?
   *
   * The one place {@link metaKeys} is matched, called from each brand's
   * `populate()` before it registers a column. Shared so that "which keys
   * are metadata" is answered identically for every brand while *what* those
   * keys are stays brand-specific — see {@link metaKeys} for why the two
   * sets must not be merged.
   */
  protected isMetaKey(key: string): boolean {
    return this.metaKeys.test(key);
  }

  /**
   * Assembles the response completely: every column and record exists by the
   * time this returns, and nothing afterwards can add one (RSRMID-2939) — see
   * the sealing note on `ResponseInterface`.
   *
   * The parser, the translated raw response and the sanitized command are
   * passed into {@link populate} as arguments rather than read off `this`: the
   * order of the assignments below is load-bearing (e.g. IBS's parser reads
   * the command to choose JSON vs plain text), so making the dependency a
   * parameter leaves no order to get wrong.
   *
   * @param raw API plain response
   * @param cmd API command used within this request
   * @param placeholders vars the response description has dynamically replaced
   * @param context context data for the response (for use in custom loggers etc., optional, has no impact on SDK behaviour)
   * @param parser parser to use instead of the brand default (see {@link newResponseParser})
   * @param error transport error, if any; non-null means `raw` is unusable and the brand's "httperror" template is substituted instead
   * @param templates registry the translator resolves template ids against; null uses the brand's built-ins (RSRMID-2941)
   */
  public constructor(
    raw: string,
    cmd: StringHash = {},
    placeholders: StringHash = {},
    context: Hash = {},
    parser: ResponseParserInterface | null = null,
    error: string | null = null,
    templates: ResponseTemplateManagerInterface | null = null,
  ) {
    const sanitizedCmd = this.sanitizeCommand(cmd);
    this.context = context;
    this.command = sanitizedCmd;
    this.requestUrl = placeholders["CONNECTION_URL"] ?? "";
    const translated = this.translate(
      raw,
      sanitizedCmd,
      placeholders,
      error,
      templates,
    );
    this.raw = translated;
    this.populate(translated, parser ?? this.newResponseParser(), sanitizedCmd);
  }

  /**
   * Translate the raw API response into its canonical form. Brand-specific by
   * the ResponseTranslator each subclass imports; `cmd` is already sanitized.
   */
  protected abstract translate(
    raw: string,
    cmd: StringHash,
    placeholders: StringHash,
    error?: string | null,
    templates?: ResponseTemplateManagerInterface | null,
  ): string;

  /**
   * Parse the translated response into the hash and build the column/record
   * lists from it. Brand-specific because each brand's parser returns a
   * different hash shape (CNR nests columns under PROPERTY, IBS is a flat
   * key => value map).
   *
   * Called exactly once, from the constructor. It is the only place columns
   * and records are built, so it must finish the job: nothing afterwards can
   * add to either list.
   *
   * @param raw the translated response, as returned by {@link translate}
   * @param parser the brand default or the injected substitute
   * @param cmd API command used within this request, already sanitized
   */
  protected abstract populate(
    raw: string,
    parser: ResponseParserInterface,
    cmd: StringHash,
  ): void;

  /**
   * Instantiate the response parser for this brand.
   *
   * Factory hook: it supplies the default, and the constructor's `parser`
   * argument overrides it — so a substitute parser needs neither reflection
   * nor a subclass.
   */
  protected abstract newResponseParser(): ResponseParserInterface;

  /**
   * Instantiate the record type for this brand.
   *
   * Factory hook for {@link addRecord}. Records share one shape across brands,
   * so every brand currently returns the shared `Record` — the hook stays
   * abstract nonetheless, because it is the seam a brand needing genuinely
   * different row behaviour would implement.
   */
  protected abstract newRecord(row: Hash): RecordInterface;

  /**
   * Get API response code.
   */
  public abstract getCode(): number;

  /**
   * Get API response description.
   */
  public abstract getDescription(): string;

  /**
   * Check if current API response represents an error case.
   */
  public abstract isError(): boolean;

  /**
   * Check if current API response represents a success case.
   */
  public abstract isSuccess(): boolean;

  /**
   * Get index of first row in this response — the offset the current window
   * starts at, or null when the response carries no pagination metadata (a
   * non-list response).
   *
   * A pure read of the brand's own wire metadata since RSRMID-2965: it no
   * longer falls back to `0` because rows happen to be present, so "this is
   * page 1" and "this is not a list" are distinguishable answers.
   */
  public abstract getFirstRecordIndex(): number | null;

  /**
   * Get last record index of the current list query, or null when the
   * response carries no pagination metadata (a non-list response).
   *
   * Also a pure wire read since RSRMID-2965 — no `getRecordsCount() - 1`
   * fallback. Note it is an *offset into the whole result set*, not an index
   * into {@link getRecords}: the window FIRST=100, LIMIT=10 answers `109`
   * here, while its last row is `getRecord(9)`. The two coincide on the
   * first page only.
   */
  public abstract getLastRecordIndex(): number | null;

  /**
   * Get total count of records available for the list query, or null when
   * the response carries no pagination metadata (a non-list response). No
   * fallback to {@link getRecordsCount} (RSRMID-2943): a non-list response
   * reports "no total" honestly.
   */
  public abstract getRecordsTotalCount(): number | null;

  /**
   * Get limit(ation) setting of the current list query, or null when the
   * response carries no pagination metadata. `0` is a distinct, meaningful
   * value; it does not collide with "absent" (RSRMID-2943).
   */
  public abstract getRecordsLimitation(): number | null;

  /**
   * Mask the brand's sensitive command keys (see {@link sensitiveFields}) so
   * their values can never be read back from the response. Delegates to
   * {@link CommandRedactor.redact}, shared with `AbstractSocketConfig`.
   */
  protected sanitizeCommand(cmd: StringHash): StringHash {
    return CommandRedactor.redact(cmd, this.sensitiveFields);
  }

  /**
   * Assemble the record (row) list from the columns already added via
   * `addColumn()`. Shared by all brands: each subclass populates the columns
   * with its own Column type beforehand, while the row assembly is identical.
   *
   * Replaces the record list rather than appending to it, so calling it twice
   * yields the same rows instead of doubling them (RSRMID-2939).
   */
  protected assembleRecords(): void {
    this.records = [];
    let count = 0;
    for (const col of this.columns) {
      count = Math.max(count, col.getData().length);
    }
    for (let i = 0; i < count; i++) {
      const row: Hash = {};
      for (const key of this.columnKeys) {
        const col = this.getColumn(key);
        if (col !== null) {
          const value = col.getDataByIndex(i);
          if (value !== null) {
            row[key] = value;
          }
        }
      }
      this.addRecord(row);
    }
  }

  /**
   * Get context data for the response.
   */
  public getContext(): Hash {
    return this.context;
  }

  /**
   * Get Request URL.
   */
  public getRequestURL(): string {
    return this.requestUrl;
  }

  /**
   * Get Plain API response.
   */
  public getPlain(): string {
    return this.raw;
  }

  /**
   * Get API response as Hash.
   */
  public getHash(): Hash {
    // A fresh shallow copy, not the live object — see the comment above
    // getColumnKeys() for why PHP's identical `return $this->hash;` is safe
    // and this one is not without it. Shallow only: nested objects/arrays
    // inside the hash (IBS/Moniker JSON payloads) are not independently
    // protected from mutation.
    return { ...this.hash };
  }

  /**
   * Register an already-constructed column into the list bookkeeping.
   *
   * A repeated column name is refused rather than half-registered
   * (RSRMID-2939): a second column under an existing name would otherwise
   * append to `columns`/`columnKeys` while `columnIndex` kept pointing at the
   * first, leaving `getColumns()` holding a column `getColumn()` could never
   * return.
   *
   * @throws DuplicateColumnException if a column of that name is already registered
   */
  protected registerColumn(col: ColumnInterface): this {
    const key = col.getKey();
    if (Object.prototype.hasOwnProperty.call(this.columnIndex, key)) {
      throw new DuplicateColumnException(
        `Column "${key}" is already registered on this response; a column name resolves to exactly one column.`,
      );
    }
    this.columns.push(col);
    this.columnKeys.push(key);
    this.columnIndex[key] = this.columns.length - 1;
    return this;
  }

  /**
   * Add a record to the record list.
   *
   * Protected since RSRMID-2939: a record added after construction would
   * change {@link getRecordsCount} and, through it, every pagination getter
   * derived from it. Only {@link assembleRecords} calls this.
   */
  protected addRecord(row: Hash): this {
    this.records.push(this.newRecord(row));
    return this;
  }

  /**
   * Get column by column name, or null if the column does not exist.
   */
  public getColumn(columnName: string): ColumnInterface | null {
    const idx = this.columnIndex[columnName];
    return idx === undefined ? null : (this.columns[idx] ?? null);
  }

  /**
   * Get Data by Column Name and Index, or null if not found.
   */
  public getColumnIndex(columnName: string, recordIndex: number): unknown {
    const col = this.getColumn(columnName);
    return col !== null ? col.getDataByIndex(recordIndex) : null;
  }

  /**
   * Get Column Names — the response's data columns, in wire order.
   *
   * Never includes the brand's response metadata (CNR: TOTAL, FIRST, LAST,
   * COUNT, LIMIT; IBS: transactid, status, message, code, the total_
   * prefixed keys and domaincount). Those are not columns at all since
   * RSRMID-2965 — read them through {@link getPagination} and the status
   * accessors instead of {@link getColumn}/{@link getColumnIndex}. The
   * former `getColumnKeys(filterPaginationKeys)` that stripped them is gone:
   * with the column set correct there is nothing left to strip.
   */
  public getColumnKeys(): string[] {
    // A fresh copy, not the live array. PHP's identical `return
    // $this->columnKeys;` is safe there because PHP arrays are copy-on-write
    // value types; JS arrays are references, so returning the field directly
    // would let a caller's push()/splice() desync this list from
    // `columnIndex`/`columns`, breaking the sealed-response invariant
    // (RSRMID-2939).
    return [...this.columnKeys];
  }

  /**
   * Get List of Columns.
   */
  public getColumns(): ColumnInterface[] {
    // See the copy-vs-reference note on getColumnKeys() above.
    return [...this.columns];
  }

  /**
   * Get Command used in this request.
   */
  public getCommand(): StringHash {
    return CommandFormatter.getSortedCommand(this.command);
  }

  /**
   * Get Command used in this request in plain text format.
   */
  public getCommandPlain(): string {
    return CommandFormatter.formatCommand(this.getCommand());
  }

  /**
   * Get the paginator for this response's list window.
   *
   * The one place the four brand primitives meet the shared arithmetic.
   * Every derivation from them — page numbers, the page count, the
   * has-next/has-previous predicates — lives on {@link Paginator} since
   * RSRMID-2965, because none of it reads a column, holds state or needs a
   * wire payload: keeping it here meant an offset grid could only be
   * exercised by hand-authoring an API response that carried four
   * integers.
   *
   * A fresh `Paginator` per call, over numbers that can no longer change (a
   * response is sealed once constructed), so two callers cannot observe
   * each other and there is no cache to invalidate.
   *
   * {@link getRecordsCount} supplies the fifth member deliberately: it
   * counts the rows this response holds and is {@link getRecord}'s bounds
   * authority, so it is the reading that cannot be made to lie by a wire
   * that miscounts.
   */
  public getPagination(): Paginator {
    return new Paginator(
      this.getFirstRecordIndex(),
      this.getLastRecordIndex(),
      this.getRecordsTotalCount(),
      this.getRecordsLimitation(),
      this.getRecordsCount(),
    );
  }

  /**
   * Get Record at given index, or null if the index does not exist.
   */
  public getRecord(recordIndex: number): RecordInterface | null {
    if (recordIndex >= 0 && this.getRecordsCount() > recordIndex) {
      return this.records[recordIndex] ?? null;
    }
    return null;
  }

  /**
   * Get all Records.
   */
  public getRecords(): RecordInterface[] {
    // See the copy-vs-reference note on getColumnKeys() above.
    return [...this.records];
  }

  /**
   * Get count of rows in this response.
   */
  public getRecordsCount(): number {
    return this.records.length;
  }

  /**
   * Iterate the record list.
   *
   * A generator function, so every call to `response[Symbol.iterator]()`
   * produces a fresh iterator over a list that can no longer change: two
   * `for...of` loops over one response see identical rows, in either order,
   * with no rewind step and no shared cursor between them — the property the
   * removed record cursor (`getNextRecord()`/`hasNext()`/`reset()`) could not
   * offer.
   */
  public *[Symbol.iterator](): Iterator<RecordInterface> {
    yield* this.records;
  }

  /**
   * Get a string value from the hash by key, returning a default if not found or not a string.
   */
  protected getHashString(key: string, defaultValue = ""): string {
    const value = this.hash[key];
    return typeof value === "string" ? value : defaultValue;
  }

  /**
   * Get an object value from the hash by key, returning an empty object if
   * not found or not an object/array. The twin of {@link getHashString} for
   * the nested blocks a brand's populate() reads (e.g. CNR's PROPERTY).
   *
   * PHP's `is_array()` covers a JSON array and a JSON object alike; the cast
   * below mirrors that — every real caller here reads the result as a map
   * (`Object.keys()`/bracket access), which works identically at runtime
   * whether the parsed value was a JS array or a plain object.
   */
  protected getHashArray(key: string): Hash {
    const value = this.hash[key];
    return typeof value === "object" && value !== null ? (value as Hash) : {};
  }
}
