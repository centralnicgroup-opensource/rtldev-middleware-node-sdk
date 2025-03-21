import { Column } from "./column.js";
import { Record } from "./record.js";
import { ResponseTranslator as RT } from "./responsetranslator.js";
import { ResponseParser as RP } from "./responseparser.js";

/**
 * Response Class
 */
export class Response {
  /**
   * plain API response
   */
  protected raw: string;
  /**
   * hash representation of plain API response
   */
  protected hash: any;
  /**
   * The API Command used within this request
   */
  private command: any;
  /**
   * Column names available in this responsse
   * NOTE: this includes also FIRST, LAST, LIMIT, COUNT, TOTAL
   * and maybe further specific columns in case of a list query
   */
  private columnkeys: string[];
  /**
   * Container of Column Instances
   */
  private columns: Column[];
  /**
   * Record Index we currently point to in record list
   */
  private recordIndex: number;
  /**
   * Record List (List of rows)
   */
  private records: Record[];

  /**
   * Constructor
   * @param raw API plain response
   * @param cmd API command used within this request
   * @param ph placeholder array to get vars in response description dynamically replaced
   */
  public constructor(raw: string, cmd: any = {}, ph: any = {}) {
    this.command = cmd;
    if (
      this.command &&
      Object.prototype.hasOwnProperty.call(this.command, "PASSWORD")
    ) {
      // make password no longer accessible
      this.command.PASSWORD = "***";
    }

    this.raw = RT.translate(raw, cmd, ph);
    console.log(this.raw);
    console.log("-----------------------------------------");
    this.hash = RP.parse(this.raw);
    this.columnkeys = [];
    this.columns = [];
    this.recordIndex = 0;
    this.records = [];

    if (Object.prototype.hasOwnProperty.call(this.hash, "PROPERTY")) {
      const colKeys = Object.keys(this.hash.PROPERTY);
      let count = 0;
      colKeys.forEach((c: string) => {
        const d = this.hash.PROPERTY[c];
        this.addColumn(c, d);
        if (d.length > count) {
          count = d.length;
        }
      });
      for (let i = 0; i < count; i++) {
        const d: any = {};
        colKeys.forEach((k: string) => {
          const col = this.getColumn(k);
          if (col) {
            const v = col.getDataByIndex(i);
            if (v !== null) {
              d[k] = v;
            }
          }
        });
        this.addRecord(d);
      }
    }
  }

  /**
   * Get API response code
   * @returns API response code
   */
  public getCode(): number {
    return parseInt(this.hash.CODE, 10);
  }

  /**
   * Get API response description
   * @returns API response description
   */
  public getDescription(): string {
    return this.hash.DESCRIPTION;
  }

  /**
   * Get Plain API response
   * @returns Plain API response
   */
  public getPlain(): string {
    return this.raw;
  }

  /**
   * Get Queuetime of API response
   * @returns Queuetime of API response
   */
  public getQueuetime(): number {
    if (Object.prototype.hasOwnProperty.call(this.hash, "QUEUETIME")) {
      return parseFloat(this.hash.QUEUETIME);
    }
    return 0.0;
  }

  /**
   * Get API response as Hash
   * @returns API response hash
   */
  public getHash(): any {
    return this.hash;
  }

  /**
   * Get Runtime of API response
   * @returns Runtime of API response
   */
  public getRuntime(): number {
    if (Object.prototype.hasOwnProperty.call(this.hash, "RUNTIME")) {
      return parseFloat(this.hash.RUNTIME);
    }
    return 0.0;
  }

  /**
   * Check if current API response represents an error case
   * API response code is an 5xx code
   * @returns boolean result
   */
  public isError(): boolean {
    return this.hash.CODE.charAt(0) === "5";
  }

  /**
   * Check if current API response represents a success case
   * API response code is an 2xx code
   * @returns boolean result
   */
  public isSuccess(): boolean {
    return this.hash.CODE.charAt(0) === "2";
  }

  /**
   * Check if current API response represents a temporary error case
   * API response code is an 4xx code
   * @returns boolean result
   */
  public isTmpError(): boolean {
    return this.hash.CODE.charAt(0) === "4";
  }

  /**
   * Check if current operation is returned as pending
   * @returns boolean result
   */
  public isPending(): boolean {
    const cmd = this.getCommand();

    // Check if the COMMAND is AddDomain (case-insensitive)
    if (!cmd.COMMAND || cmd.COMMAND.toLowerCase() !== "adddomain") {
      return false;
    }

    // Retrieve the STATUS column and check if its data equals REQUESTED (case-insensitive)
    const status = this.getColumn("STATUS");
    if (status) {
      const statusData = status.getDataByIndex(0);
      if (statusData && statusData.toLowerCase() === "requested") {
        return true;
      }
    }

    return false;
  }

  /**
   * Add a column to the column list
   * @param key column name
   * @param data array of column data
   * @returns Current Response Instance for method chaining
   */
  public addColumn(key: string, data: string[]): Response {
    const col = new Column(key, data);
    this.columns.push(col);
    this.columnkeys.push(key);
    return this;
  }

  /**
   * Add a record to the record list
   * @param h row hash data
   * @returns Current Response Instance for method chaining
   */
  public addRecord(h: any): Response {
    this.records.push(new Record(h));
    return this;
  }

  /**
   * Get column by column name
   * @param key column name
   * @returns column instance or null if column does not exist
   */
  public getColumn(key: string): Column | null {
    return this.hasColumn(key)
      ? this.columns[this.columnkeys.indexOf(key)]
      : null;
  }

  /**
   * Get Data by Column Name and Index
   * @param colkey column name
   * @param index column data index
   * @returns column data at index or null if not found
   */
  public getColumnIndex(colkey: string, index: number): string | null {
    const col = this.getColumn(colkey);
    return col ? col.getDataByIndex(index) : null;
  }

  /**
   * Get Column Names
   * @returns Array of Column Names
   */
  public getColumnKeys(): string[] {
    return this.columnkeys;
  }

  /**
   * Get List of Columns
   * @returns Array of Columns
   */
  public getColumns(): Column[] {
    return this.columns;
  }

  /**
   * Get Command used in this request
   * @returns command
   */
  public getCommand(): any {
    return this.command;
  }

  /**
   * Get Command used in this request in plain text format
   * @return command as plain text
   */
  public getCommandPlain(): string {
    let tmp = "";
    Object.keys(this.command).forEach((key: string) => {
      tmp += `${key} = ${this.command[key]}\n`;
    });
    return tmp;
  }

  /**
   * Get Page Number of current List Query
   * @returns page number or null in case of a non-list response
   */
  public getCurrentPageNumber(): number | null {
    const first = this.getFirstRecordIndex();
    const limit = this.getRecordsLimitation();
    if (first !== null && limit) {
      return Math.floor(first / limit) + 1;
    }
    return null;
  }

  /**
   * Get Record of current record index
   * @returns Record or null in case of a non-list response
   */
  public getCurrentRecord(): Record | null {
    return this.hasCurrentRecord() ? this.records[this.recordIndex] : null;
  }

  /**
   * Get Index of first row in this response
   * @returns first row index
   */
  public getFirstRecordIndex(): number | null {
    const col = this.getColumn("FIRST");
    if (col) {
      const f = col.getDataByIndex(0);
      if (f !== null) {
        return parseInt(f, 10);
      }
    }
    if (this.records.length) {
      return 0;
    }
    return null;
  }

  /**
   * Get last record index of the current list query
   * @returns record index or null for a non-list response
   */
  public getLastRecordIndex(): number | null {
    const col = this.getColumn("LAST");
    if (col) {
      const l = col.getDataByIndex(0);
      if (l !== null) {
        return parseInt(l, 10);
      }
    }
    const len = this.getRecordsCount();
    if (len) {
      return len - 1;
    }
    return null;
  }

  /**
   * Get Response as List Hash including useful meta data for tables
   * @returns hash including list meta data and array of rows in hash notation
   */
  public getListHash(): any {
    const lh: any[] = [];
    this.getRecords().forEach((rec) => {
      lh.push(rec.getData());
    });
    return {
      LIST: lh,
      meta: {
        columns: this.getColumnKeys(),
        pg: this.getPagination(),
      },
    };
  }

  /**
   * Get next record in record list
   * @returns Record or null in case there's no further record
   */
  public getNextRecord(): Record | null {
    if (this.hasNextRecord()) {
      return this.records[++this.recordIndex];
    }
    return null;
  }

  /**
   * Get Page Number of next list query
   * @returns page number or null if there's no next page
   */
  public getNextPageNumber(): number | null {
    const cp = this.getCurrentPageNumber();
    if (cp === null) {
      return null;
    }
    const page = cp + 1;
    const pages = this.getNumberOfPages();
    return page <= pages ? page : pages;
  }

  /**
   * Get the number of pages available for this list query
   * @returns number of pages
   */
  public getNumberOfPages(): number {
    const t = this.getRecordsTotalCount();
    const limit = this.getRecordsLimitation();
    if (t && limit) {
      return Math.ceil(t / this.getRecordsLimitation());
    }
    return 0;
  }

  /**
   * Get object containing all paging data
   * @returns paginator data
   */
  public getPagination(): any {
    return {
      COUNT: this.getRecordsCount(),
      CURRENTPAGE: this.getCurrentPageNumber(),
      FIRST: this.getFirstRecordIndex(),
      LAST: this.getLastRecordIndex(),
      LIMIT: this.getRecordsLimitation(),
      NEXTPAGE: this.getNextPageNumber(),
      PAGES: this.getNumberOfPages(),
      PREVIOUSPAGE: this.getPreviousPageNumber(),
      TOTAL: this.getRecordsTotalCount(),
    };
  }

  /**
   * Get Page Number of previous list query
   * @returns page number or null if there's no previous page
   */
  public getPreviousPageNumber(): number | null {
    const cp = this.getCurrentPageNumber();
    if (cp === null) {
      return null;
    }
    return cp - 1 || null;
  }

  /**
   * Get previous record in record list
   * @returns Record or null if there's no previous record
   */
  public getPreviousRecord(): Record | null {
    if (this.hasPreviousRecord()) {
      return this.records[--this.recordIndex];
    }
    return null;
  }

  /**
   * Get Record at given index
   * @param idx record index
   * @returns Record or null if index does not exist
   */
  public getRecord(idx: number): Record | null {
    if (idx >= 0 && this.records.length > idx) {
      return this.records[idx];
    }
    return null;
  }

  /**
   * Get all Records
   * @returns array of records
   */
  public getRecords(): Record[] {
    return this.records;
  }

  /**
   * Get count of rows in this response
   * @returns count of rows
   */
  public getRecordsCount(): number {
    return this.records.length;
  }

  /**
   * Get total count of records available for the list query
   * @returns total count of records or count of records for a non-list response
   */
  public getRecordsTotalCount(): number {
    const col = this.getColumn("TOTAL");
    if (col) {
      const t = col.getDataByIndex(0);
      if (t !== null) {
        return parseInt(t, 10);
      }
    }
    return this.getRecordsCount();
  }

  /**
   * Get limit(ation) setting of the current list query
   * This is the count of requested rows
   * @returns limit setting or count requested rows
   */
  public getRecordsLimitation(): number {
    const col = this.getColumn("LIMIT");
    if (col) {
      const l = col.getDataByIndex(0);
      if (l !== null) {
        return parseInt(l, 10);
      }
    }
    return this.getRecordsCount();
  }

  /**
   * Check if this list query has a next page
   * @returns boolean result
   */
  public hasNextPage(): boolean {
    const cp = this.getCurrentPageNumber();
    if (cp === null) {
      return false;
    }
    return cp + 1 <= this.getNumberOfPages();
  }

  /**
   * Check if this list query has a previous page
   * @returns boolean result
   */
  public hasPreviousPage(): boolean {
    const cp = this.getCurrentPageNumber();
    if (cp === null) {
      return false;
    }
    return cp - 1 > 0;
  }

  /**
   * Reset index in record list back to zero
   * @returns Current Response Instance for method chaining
   */
  public rewindRecordList(): Response {
    this.recordIndex = 0;
    return this;
  }

  /**
   * Check if column exists in response
   * @param key column name
   * @returns boolean result
   */
  private hasColumn(key: string): boolean {
    return this.columnkeys.indexOf(key) !== -1;
  }

  /**
   * Check if the record list contains a record for the
   * current record index in use
   * @returns boolean result
   */
  private hasCurrentRecord(): boolean {
    const len = this.records.length;
    return len > 0 && this.recordIndex >= 0 && this.recordIndex < len;
  }

  /**
   * Check if the record list contains a next record for the
   * current record index in use
   * @returns boolean result
   */
  private hasNextRecord(): boolean {
    const next = this.recordIndex + 1;
    return this.hasCurrentRecord() && next < this.records.length;
  }

  /**
   * Check if the record list contains a previous record for the
   * current record index in use
   * @returns boolean result
   */
  private hasPreviousRecord(): boolean {
    return this.recordIndex > 0 && this.hasCurrentRecord();
  }
}
