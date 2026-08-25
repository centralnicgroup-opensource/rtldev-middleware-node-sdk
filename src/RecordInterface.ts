/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import type { ApiDateTime } from "./ApiDateTime.js";
import type { Hash } from "./types.js";

/**
 * Common Record Interface
 *
 * Declares what a record can be *asked*, not how it is built. Do not add a
 * constructor signature here, for the same reason as {@link ColumnInterface}:
 * records come from each Response's `newRecord()` hook, which names its
 * concrete class.
 */
export interface RecordInterface {
  /**
   * Get row data
   */
  getData(): Hash;

  /**
   * Get row data for given column, or null if the column does not exist
   */
  getDataByKey(columnName: string): unknown;

  /**
   * Get row data for given column, narrowed to a string.
   *
   * Returns `null` for a missing key or a non-string value. CNR cells are
   * always strings; IBS/Moniker JSON cells may be nested arrays or
   * objects, which yield null here — use {@link getDataByKey} for the raw
   * value in that case.
   */
  getStringByKey(columnName: string): string | null;

  /**
   * Get row data for given column, parsed as a date/time value.
   *
   * Returns `null` for a missing key, a non-string value, or a string that
   * cannot be parsed.
   */
  getDateTimeByKey(columnName: string): ApiDateTime | null;
}
