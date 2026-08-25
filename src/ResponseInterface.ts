import type { ColumnInterface } from "./ColumnInterface.js";
import type { Paginator } from "./Paginator.js";
import type { RecordInterface } from "./RecordInterface.js";
import type { Hash, StringHash } from "./types.js";

/**
 * Common Response Interface
 *
 * The universal contract every brand Response fully supports. It describes
 * what a response can be asked, not how it is built: construction is
 * deliberately NOT part of this interface, and must not be re-added.
 * Responses are created by the brand factory hooks (`AbstractClient.newResponse()`
 * and `AbstractResponseTemplateManager.createResponseFromTemplateId()`), each instantiating
 * its own concrete Response, so nothing in the SDK — or in a consumer — ever
 * constructs through this type. Put construction concerns on the factory
 * hooks instead.
 *
 * A response is sealed once constructed, and read-only thereafter
 * (RSRMID-2939). There are no mutators here — `addColumn()`/`addRecord()` were
 * removed — because a column added after construction was silently absent
 * from every already-assembled record, and an added record changed four
 * derived pagination getters. Every column and record is built inside the
 * constructor by the brand's `populate()` hook. Do not re-add a mutator.
 *
 * Records are iterated, not stepped. This interface extends `Iterable`, so
 * `for (const record of response)` walks the rows without touching shared
 * state and can be repeated as often as a caller likes. The former record
 * cursor (`getCurrentRecord()`/`getNextRecord()`/`getPreviousRecord()`/
 * `rewindRecordList()`) was hidden mutable state shared by every holder of
 * the object. Use `for...of`, or `getRecord()` for random access.
 */
export interface ResponseInterface extends Iterable<RecordInterface> {
  /**
   * Get API response code
   */
  getCode(): number;

  /**
   * Get API response description
   */
  getDescription(): string;

  /**
   * Get Request URL
   */
  getRequestURL(): string;

  /**
   * Get Plain API response
   */
  getPlain(): string;

  /**
   * Get API response as Hash
   */
  getHash(): Hash;

  /**
   * Check if current API response represents an error case (a 5xx code)
   */
  isError(): boolean;

  /**
   * Check if current API response represents a success case (a 2xx code)
   */
  isSuccess(): boolean;

  /**
   * Get column by column name, or null if the column does not exist
   */
  getColumn(columnName: string): ColumnInterface | null;

  /**
   * Get Data by Column Name and Index, or null if not found
   */
  getColumnIndex(columnName: string, recordIndex: number): unknown;

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
  getColumnKeys(): string[];

  /**
   * Get List of Columns
   */
  getColumns(): ColumnInterface[];

  /**
   * Get Command used in this request
   */
  getCommand(): StringHash;

  /**
   * Get Command used in this request in plain text format
   */
  getCommandPlain(): string;

  /**
   * Get context data for the response
   */
  getContext(): Hash;

  /**
   * Get Index of first row in this response — the offset the current
   * window starts at, or null when the response carries no pagination
   * metadata (a non-list response).
   *
   * A pure read of the brand's own wire metadata since RSRMID-2965: it no
   * longer falls back to `0` because rows happen to be present, so "this is
   * page 1" and "this is not a list" are distinguishable answers.
   */
  getFirstRecordIndex(): number | null;

  /**
   * Get last record index of the current list query, or null when the
   * response carries no pagination metadata (a non-list response).
   *
   * Also a pure wire read since RSRMID-2965 — no `getRecordsCount() - 1`
   * fallback. Note it is an *offset into the whole result set*, not an
   * index into {@link getRecords}: the window FIRST=100, LIMIT=10 answers
   * `109` here, while its last row is `getRecord(9)`. The two coincide on
   * the first page only.
   */
  getLastRecordIndex(): number | null;

  /**
   * Get the paginator for this response's list window.
   *
   * Everything derived from the four primitives above — page numbers, the
   * page count and the has-next/has-previous predicates — is answered by
   * {@link Paginator} rather than by this interface (RSRMID-2965). It
   * reads no wire payload, so pagination arithmetic can be exercised
   * without one, and a caller who never pages is not carrying six methods
   * for it.
   *
   * The former array is `getPagination().toArray()`, unchanged in keys and
   * order.
   */
  getPagination(): Paginator;

  /**
   * Get Record at given index, or null if the index does not exist
   */
  getRecord(recordIndex: number): RecordInterface | null;

  /**
   * Get all Records
   */
  getRecords(): RecordInterface[];

  /**
   * Iterate the record list.
   *
   * Redeclared here — `Iterable` already requires it — so the element type is
   * stated on the contract consumers type against, rather than only where it
   * happens to be implemented. A conforming implementation must return a
   * fresh iterator on every call (a generator function does this for free),
   * so that nothing a caller does while iterating is visible to another
   * holder of the same response, and a second `for...of` starts from the top
   * with no rewind step. See the class docblock for what this replaced.
   */
  [Symbol.iterator](): Iterator<RecordInterface>;

  /**
   * Get count of rows in this response
   */
  getRecordsCount(): number;

  /**
   * Get total count of records available for the list query, or `null` when
   * the response carries no pagination metadata (a non-list response)
   */
  getRecordsTotalCount(): number | null;

  /**
   * Get limit(ation) setting of the current list query — the count of
   * requested rows — or `null` when the response carries no pagination
   * metadata. `0` is a distinct, meaningful value (LIMIT=0 was requested);
   * it does not collide with "absent".
   */
  getRecordsLimitation(): number | null;
}
