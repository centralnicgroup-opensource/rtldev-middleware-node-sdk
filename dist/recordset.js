"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const record_1 = require("./record");
class RecordSet {
    constructor() {
        this.currentIndex = 0;
        this.records = [];
    }
    addRecord(h) {
        this.records.push(new record_1.Record(h));
        return this;
    }
    getLength() {
        return this.records.length;
    }
    getRecords() {
        return this.records;
    }
    getRecord(idx) {
        if (idx >= 0 && this.records.length > idx) {
            return this.records[idx];
        }
        return null;
    }
    getCurrent() {
        return this.hasCurrent() ? this.records[this.currentIndex] : null;
    }
    getPrevious() {
        if (this.hasPrevious()) {
            return this.records[--this.currentIndex];
        }
        return null;
    }
    getNext() {
        if (this.hasNext()) {
            return this.records[++this.currentIndex];
        }
        return null;
    }
    rewind() {
        this.currentIndex = 0;
        return this;
    }
    hasCurrent() {
        const len = this.records.length;
        return (len > 0 &&
            this.currentIndex >= 0 &&
            this.currentIndex < len);
    }
    hasNext() {
        const next = this.currentIndex + 1;
        return (this.hasCurrent() && (next < this.records.length));
    }
    hasPrevious() {
        return (this.currentIndex > 0 && this.hasCurrent());
    }
}
exports.RecordSet = RecordSet;
//# sourceMappingURL=recordset.js.map