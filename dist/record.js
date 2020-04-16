"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Record = (function () {
    function Record(data) {
        this.data = data;
    }
    Record.prototype.getData = function () {
        return this.data;
    };
    Record.prototype.getDataByKey = function (key) {
        if (this.hasData(key)) {
            return this.data[key];
        }
        return null;
    };
    Record.prototype.hasData = function (key) {
        return this.data.hasOwnProperty(key);
    };
    return Record;
}());
exports.Record = Record;
//# sourceMappingURL=record.js.map