"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Record {
    constructor(data) {
        this.data = data;
    }
    getData() {
        return this.data;
    }
    getDataByKey(key) {
        if (this.hasData(key)) {
            return this.data[key];
        }
        return null;
    }
    hasData(key) {
        return this.data.hasOwnProperty(key);
    }
}
exports.Record = Record;
//# sourceMappingURL=record.js.map