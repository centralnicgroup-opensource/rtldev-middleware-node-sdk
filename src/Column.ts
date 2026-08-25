/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { ApiDateTime } from "./ApiDateTime.js";
import type { ColumnInterface } from "./ColumnInterface.js";

/**
 * Shared Column implementation
 *
 * Brand-neutral, immutable column of response data. Every brand stores the
 * same thing — a key plus an ordered bag of values — so all behaviour lives
 * here and is instantiated directly by each Response's `addColumn()`. What
 * differs between brands is only the *value type*: CNR responses are
 * plaintext and carry strings, IBS/Moniker responses are JSON and carry
 * arbitrary values (nested arrays and objects included). That difference is
 * expressed as a native return type on the interface itself
 * (getStringByIndex()/getDateTimeByIndex()), never a generic — see decision
 * #11: one shared Column, no brand subclass, no `TValue` type parameter.
 */
export class Column implements ColumnInterface {
  /**
   * count of column data entries
   *
   * Not public: `ColumnInterface` exposes this as {@link getLength}, a
   * method, to match PHP's shape (PHP's interface genuinely cannot declare a
   * property; RSRMID-2971). A public field here was unreachable to an
   * interface-typed consumer regardless of that PHP-specific reason — see
   * the guard in `tests/seams/ColumnInterfaceCoverageSeam.spec.ts`.
   */
  private readonly length: number;

  public constructor(
    private readonly columnName: string,
    private readonly data: unknown[],
  ) {
    this.length = data.length;
  }

  /**
   * Get column name
   */
  public getKey(): string {
    return this.columnName;
  }

  /**
   * Get the number of data entries this column holds.
   */
  public getLength(): number {
    return this.length;
  }

  /**
   * Get column data
   */
  public getData(): unknown[] {
    // A fresh copy, not the live array — see AbstractResponse.getColumnKeys()'s
    // comment on why PHP's identical `return $this->data;` is safe and this
    // one is not without it.
    return [...this.data];
  }

  /**
   * Get column data at given index
   */
  public getDataByIndex(recordIndex: number): unknown {
    return this.hasDataIndex(recordIndex) ? this.data[recordIndex] : null;
  }

  /**
   * Check if column has a given data index
   */
  private hasDataIndex(recordIndex: number): boolean {
    return recordIndex >= 0 && recordIndex < this.length;
  }

  /**
   * Get column data at given index, narrowed to a string.
   *
   * Returns `null` for an out-of-range index or a non-string value. CNR
   * cells are always strings; IBS/Moniker JSON cells may be nested arrays
   * or objects, which yield null here — use {@link getDataByIndex} for the
   * raw value in that case.
   */
  public getStringByIndex(recordIndex: number): string | null {
    const value = this.getDataByIndex(recordIndex);
    return typeof value === "string" ? value : null;
  }

  /**
   * Get column data at given index, parsed as a date/time value.
   *
   * Opt-in narrowing over {@link getDataByIndex}: returns `null` for an
   * out-of-range index, a non-string value, or a string
   * `ApiDateTime.tryFrom()` cannot parse.
   */
  public getDateTimeByIndex(recordIndex: number): ApiDateTime | null {
    const value = this.getDataByIndex(recordIndex);
    return typeof value === "string" ? ApiDateTime.tryFrom(value) : null;
  }
}
