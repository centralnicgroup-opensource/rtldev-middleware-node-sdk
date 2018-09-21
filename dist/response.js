"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const column_1 = require("./column");
const record_1 = require("./record");
const responsetemplate_1 = require("./responsetemplate");
class Response extends responsetemplate_1.ResponseTemplate {
    constructor(raw, cmd) {
        super(raw);
        this.command = cmd;
        this.columnkeys = [];
        this.columns = [];
        this.recordIndex = 0;
        this.records = [];
        if (this.hash.hasOwnProperty("PROPERTY")) {
            const colKeys = Object.keys(this.hash.PROPERTY);
            let count = 0;
            colKeys.forEach((c) => {
                const d = this.hash.PROPERTY[c];
                this.addColumn(c, d);
                if (d.length > count) {
                    count = d.length;
                }
            });
            for (let i = 0; i < count; i++) {
                const d = {};
                colKeys.forEach((k) => {
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
    addColumn(key, data) {
        const col = new column_1.Column(key, data);
        this.columns.push(col);
        this.columnkeys.push(key);
        return this;
    }
    addRecord(h) {
        this.records.push(new record_1.Record(h));
        return this;
    }
    getColumn(key) {
        return (this.hasColumn(key) ? this.columns[this.columnkeys.indexOf(key)] : null);
    }
    getColumnIndex(colkey, index) {
        const col = this.getColumn(colkey);
        return col ? col.getDataByIndex(index) : null;
    }
    getColumnKeys() {
        return this.columnkeys;
    }
    getColumns() {
        return this.columns;
    }
    getCommand() {
        return this.command;
    }
    getCurrentPageNumber() {
        const first = this.getFirstRecordIndex();
        const limit = this.getRecordsLimitation();
        if (first !== null && limit) {
            return Math.floor(first / limit) + 1;
        }
        return null;
    }
    getCurrentRecord() {
        return this.hasCurrentRecord() ? this.records[this.recordIndex] : null;
    }
    getFirstRecordIndex() {
        const col = this.getColumn("FIRST");
        if (col) {
            const f = col.getDataByIndex(0);
            return f === null ? 0 : parseInt(f, 10);
        }
        if (this.records.length) {
            return 0;
        }
        return null;
    }
    getLastRecordIndex() {
        const col = this.getColumn("LAST");
        if (col) {
            const l = col.getDataByIndex(0);
            return ((l === null) ? this.getRecordsCount() - 1 : parseInt(l, 10));
        }
        if (this.records.length) {
            return this.getRecordsCount() - 1;
        }
        return null;
    }
    getListHash() {
        const lh = [];
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
    getNextRecord() {
        if (this.hasNextRecord()) {
            return this.records[++this.recordIndex];
        }
        return null;
    }
    getNextPageNumber() {
        const cp = this.getCurrentPageNumber();
        if (cp === null) {
            return null;
        }
        const page = cp + 1;
        const pages = this.getNumberOfPages();
        return (page <= pages ? page : pages);
    }
    getNumberOfPages() {
        const t = this.getRecordsTotalCount();
        const limit = this.getRecordsLimitation();
        if (t && limit) {
            return Math.ceil(t / this.getRecordsLimitation());
        }
        return 0;
    }
    getPagination() {
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
    getPreviousPageNumber() {
        const cp = this.getCurrentPageNumber();
        if (cp === null) {
            return null;
        }
        return (cp - 1) || null;
    }
    getPreviousRecord() {
        if (this.hasPreviousRecord()) {
            return this.records[--this.recordIndex];
        }
        return null;
    }
    getRecord(idx) {
        if (idx >= 0 && this.records.length > idx) {
            return this.records[idx];
        }
        return null;
    }
    getRecords() {
        return this.records;
    }
    getRecordsCount() {
        return this.records.length;
    }
    getRecordsTotalCount() {
        const col = this.getColumn("TOTAL");
        if (col) {
            const t = col.getDataByIndex(0);
            if (t !== null) {
                return parseInt(t, 10);
            }
        }
        return this.getRecordsCount();
    }
    getRecordsLimitation() {
        const col = this.getColumn("LIMIT");
        if (col) {
            const l = col.getDataByIndex(0);
            return ((l === null) ? this.getRecordsCount() : parseInt(l, 10));
        }
        return this.getRecordsCount();
    }
    hasNextPage() {
        const cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return (cp + 1 <= this.getNumberOfPages());
    }
    hasPreviousPage() {
        const cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return ((cp - 1) > 0);
    }
    rewindRecordList() {
        this.recordIndex = 0;
        return this;
    }
    hasColumn(key) {
        return (this.columnkeys.indexOf(key) !== -1);
    }
    hasCurrentRecord() {
        const len = this.records.length;
        return (len > 0 &&
            this.recordIndex >= 0 &&
            this.recordIndex < len);
    }
    hasNextRecord() {
        const next = this.recordIndex + 1;
        return (this.hasCurrentRecord() && (next < this.records.length));
    }
    hasPreviousRecord() {
        return (this.recordIndex > 0 && this.hasCurrentRecord());
    }
}
exports.Response = Response;
//# sourceMappingURL=response.js.map