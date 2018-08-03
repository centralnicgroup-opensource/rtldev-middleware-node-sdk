"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Column {
    constructor(key, data) {
        this.key = key;
        this.data = data;
        this.length = data.length;
    }
    getKey() {
        return this.key;
    }
    getData() {
        return this.data;
    }
    getDataByIndex(idx) {
        return this.hasDataIndex(idx) ? this.data[idx] : null;
    }
    hasDataIndex(idx) {
        return (idx >= 0 && idx < this.data.length);
    }
}
exports.Column = Column;
//# sourceMappingURL=column.js.map