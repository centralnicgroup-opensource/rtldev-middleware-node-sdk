"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Column = (function () {
    function Column(key, data) {
        this.key = key;
        this.data = data;
        this.length = data.length;
    }
    Column.prototype.getKey = function () {
        return this.key;
    };
    Column.prototype.getData = function () {
        return this.data;
    };
    Column.prototype.getDataByIndex = function (idx) {
        return this.hasDataIndex(idx) ? this.data[idx] : null;
    };
    Column.prototype.hasDataIndex = function (idx) {
        return (idx >= 0 && idx < this.length);
    };
    return Column;
}());
exports.Column = Column;
//# sourceMappingURL=column.js.map