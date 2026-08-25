/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import type { ApiDateTime } from "./ApiDateTime.js";

/**
 * Common Column Interface
 *
 * Declares what a column can be *asked*, not how it is built. Do not add a
 * constructor signature here: nothing constructs through this type (columns
 * come from a brand's `addColumn()`, which names its concrete class).
 * Guarded by tests/RecordColumnSeamTest equivalent; rationale in
 * docs/agents/architecture.md.
 *
 * No generic type parameter: decision #11 keeps one shared Column across
 * brands, and value-type narrowing lives in getStringByIndex() /
 * getDateTimeByIndex(), not in a `TValue` template.
 */
export interface ColumnInterface {
  /**
   * Get column name
   */
  getKey(): string;

  /**
   * Get the number of data entries this column holds.
   *
   * A method here, not a `readonly length: number` property signature: PHP's
   * `ColumnInterface` cannot declare a property at all (RSRMID-2971), and
   * this SDK matches its public API shape rather than using the property
   * signature TS would otherwise permit. `Column.length` used to be a
   * public field, unreachable to an interface-typed consumer regardless —
   * see the guard in `tests/seams/ColumnInterfaceCoverageSeam.spec.ts`.
   */
  getLength(): number;

  /**
   * Get column data
   */
  getData(): unknown[];

  /**
   * Get column data at given index
   */
  getDataByIndex(recordIndex: number): unknown;

  /**
   * Get column data at given index, narrowed to a string.
   *
   * Returns `null` for an out-of-range index or a non-string value. CNR
   * cells are always strings; IBS/Moniker JSON cells may be nested arrays
   * or objects, which yield null here — use {@link getDataByIndex} for the
   * raw value in that case.
   */
  getStringByIndex(recordIndex: number): string | null;

  /**
   * Get column data at given index, parsed as a date/time value.
   *
   * Returns `null` for an out-of-range index, a non-string value, or a
   * string that cannot be parsed.
   */
  getDateTimeByIndex(recordIndex: number): ApiDateTime | null;
}
