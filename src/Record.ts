/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { ApiDateTime } from "./ApiDateTime.js";
import type { RecordInterface } from "./RecordInterface.js";
import type { Hash } from "./types.js";

/**
 * Shared Record implementation
 *
 * Brand-neutral record (row) of a list response. Record data has one shape
 * across brands (a string-keyed hash of unknown values) and no brand has
 * ever needed to read a row differently, so there is exactly one Record and
 * every Response's `newRecord()` factory hook returns it. The hook itself
 * stays a per-brand declaration: a brand that genuinely needs different row
 * behaviour implements RecordInterface and returns that from its own
 * `newRecord()` instead. No generic type parameter — see decision #11.
 *
 * e.g.
 * ```ts
 * const data: Hash = {
 *   DOMAIN: "mydomain.com",
 *   USER: "test.user",
 *   // ... further column data ...
 * };
 * ```
 */
export class Record implements RecordInterface {
  public constructor(private readonly data: Hash) {}

  /**
   * get row data
   */
  public getData(): Hash {
    // A fresh copy, not the live object — see AbstractResponse.getColumnKeys()'s
    // comment on why PHP's identical `return $this->data;` is safe and this
    // one is not without it.
    return { ...this.data };
  }

  /**
   * get row data for given column
   */
  public getDataByKey(columnName: string): unknown {
    if (this.hasData(columnName)) {
      return this.data[columnName];
    }
    return null;
  }

  /**
   * check if record has data for given column
   */
  private hasData(columnName: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.data, columnName);
  }

  /**
   * Get row data for given column, narrowed to a string.
   *
   * Returns `null` for a missing key or a non-string value. CNR cells are
   * always strings; IBS/Moniker JSON cells may be nested arrays or
   * objects, which yield null here — use {@link getDataByKey} for the raw
   * value in that case.
   */
  public getStringByKey(columnName: string): string | null {
    const value = this.getDataByKey(columnName);
    return typeof value === "string" ? value : null;
  }

  /**
   * Get row data for given column, parsed as a date/time value.
   *
   * Opt-in narrowing over {@link getDataByKey}: returns `null` for a missing
   * key, a non-string value, or a string `ApiDateTime.tryFrom()` cannot
   * parse.
   */
  public getDateTimeByKey(columnName: string): ApiDateTime | null {
    const value = this.getDataByKey(columnName);
    return typeof value === "string" ? ApiDateTime.tryFrom(value) : null;
  }
}
