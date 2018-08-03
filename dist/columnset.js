"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const column_1 = require("./column");
class ColumnSet {
    constructor() {
        this.keys = [];
        this.columns = [];
    }
    addColumn(key, data) {
        const col = new column_1.Column(key, data);
        this.columns.push(col);
        this.keys.push(key);
        return this;
    }
    getColumn(key) {
        return (this.hasColumn(key) ? this.columns[this.keys.indexOf(key)] : null);
    }
    getColumns() {
        return this.columns;
    }
    getColumnKeys() {
        return this.keys;
    }
    hasColumn(key) {
        return (this.keys.indexOf(key) !== -1);
    }
}
exports.ColumnSet = ColumnSet;
//# sourceMappingURL=columnset.js.map