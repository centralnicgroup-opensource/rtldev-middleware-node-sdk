"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var column_1 = require("./column");
var record_1 = require("./record");
var responsetemplate_1 = require("./responsetemplate");
var Response = (function (_super) {
    __extends(Response, _super);
    function Response(raw, cmd, ph) {
        if (ph === void 0) { ph = {}; }
        var _this = _super.call(this, raw) || this;
        var keys = Object.keys(ph);
        keys.forEach(function (varName) {
            _this.raw = _this.raw.replace(new RegExp("{" + varName + "}", "g"), ph[varName]);
        });
        _this.raw = _this.raw.replace(/\{[A-Z_]+\}/g, "");
        _this = _super.call(this, _this.raw) || this;
        _this.command = cmd;
        if (_this.command &&
            Object.prototype.hasOwnProperty.call(_this.command, "PASSWORD")) {
            _this.command.PASSWORD = "***";
        }
        _this.columnkeys = [];
        _this.columns = [];
        _this.recordIndex = 0;
        _this.records = [];
        if (Object.prototype.hasOwnProperty.call(_this.hash, "PROPERTY")) {
            var colKeys = Object.keys(_this.hash.PROPERTY);
            var count_1 = 0;
            colKeys.forEach(function (c) {
                var d = _this.hash.PROPERTY[c];
                _this.addColumn(c, d);
                if (d.length > count_1) {
                    count_1 = d.length;
                }
            });
            var _loop_1 = function (i) {
                var d = {};
                colKeys.forEach(function (k) {
                    var col = _this.getColumn(k);
                    if (col) {
                        var v = col.getDataByIndex(i);
                        if (v !== null) {
                            d[k] = v;
                        }
                    }
                });
                this_1.addRecord(d);
            };
            var this_1 = this;
            for (var i = 0; i < count_1; i++) {
                _loop_1(i);
            }
        }
        return _this;
    }
    Response.prototype.addColumn = function (key, data) {
        var col = new column_1.Column(key, data);
        this.columns.push(col);
        this.columnkeys.push(key);
        return this;
    };
    Response.prototype.addRecord = function (h) {
        this.records.push(new record_1.Record(h));
        return this;
    };
    Response.prototype.getColumn = function (key) {
        return (this.hasColumn(key) ? this.columns[this.columnkeys.indexOf(key)] : null);
    };
    Response.prototype.getColumnIndex = function (colkey, index) {
        var col = this.getColumn(colkey);
        return col ? col.getDataByIndex(index) : null;
    };
    Response.prototype.getColumnKeys = function () {
        return this.columnkeys;
    };
    Response.prototype.getColumns = function () {
        return this.columns;
    };
    Response.prototype.getCommand = function () {
        return this.command;
    };
    Response.prototype.getCommandPlain = function () {
        var _this = this;
        var tmp = "";
        Object.keys(this.command).forEach(function (key) {
            tmp += key + " = " + _this.command[key] + "\n";
        });
        return tmp;
    };
    Response.prototype.getCurrentPageNumber = function () {
        var first = this.getFirstRecordIndex();
        var limit = this.getRecordsLimitation();
        if (first !== null && limit) {
            return Math.floor(first / limit) + 1;
        }
        return null;
    };
    Response.prototype.getCurrentRecord = function () {
        return this.hasCurrentRecord() ? this.records[this.recordIndex] : null;
    };
    Response.prototype.getFirstRecordIndex = function () {
        var col = this.getColumn("FIRST");
        if (col) {
            var f = col.getDataByIndex(0);
            if (f !== null) {
                return parseInt(f, 10);
            }
        }
        if (this.records.length) {
            return 0;
        }
        return null;
    };
    Response.prototype.getLastRecordIndex = function () {
        var col = this.getColumn("LAST");
        if (col) {
            var l = col.getDataByIndex(0);
            if (l !== null) {
                return parseInt(l, 10);
            }
        }
        var len = this.getRecordsCount();
        if (len) {
            return (len - 1);
        }
        return null;
    };
    Response.prototype.getListHash = function () {
        var lh = [];
        this.getRecords().forEach(function (rec) {
            lh.push(rec.getData());
        });
        return {
            LIST: lh,
            meta: {
                columns: this.getColumnKeys(),
                pg: this.getPagination(),
            },
        };
    };
    Response.prototype.getNextRecord = function () {
        if (this.hasNextRecord()) {
            return this.records[++this.recordIndex];
        }
        return null;
    };
    Response.prototype.getNextPageNumber = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return null;
        }
        var page = cp + 1;
        var pages = this.getNumberOfPages();
        return (page <= pages ? page : pages);
    };
    Response.prototype.getNumberOfPages = function () {
        var t = this.getRecordsTotalCount();
        var limit = this.getRecordsLimitation();
        if (t && limit) {
            return Math.ceil(t / this.getRecordsLimitation());
        }
        return 0;
    };
    Response.prototype.getPagination = function () {
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
    };
    Response.prototype.getPreviousPageNumber = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return null;
        }
        return (cp - 1) || null;
    };
    Response.prototype.getPreviousRecord = function () {
        if (this.hasPreviousRecord()) {
            return this.records[--this.recordIndex];
        }
        return null;
    };
    Response.prototype.getRecord = function (idx) {
        if (idx >= 0 && this.records.length > idx) {
            return this.records[idx];
        }
        return null;
    };
    Response.prototype.getRecords = function () {
        return this.records;
    };
    Response.prototype.getRecordsCount = function () {
        return this.records.length;
    };
    Response.prototype.getRecordsTotalCount = function () {
        var col = this.getColumn("TOTAL");
        if (col) {
            var t = col.getDataByIndex(0);
            if (t !== null) {
                return parseInt(t, 10);
            }
        }
        return this.getRecordsCount();
    };
    Response.prototype.getRecordsLimitation = function () {
        var col = this.getColumn("LIMIT");
        if (col) {
            var l = col.getDataByIndex(0);
            if (l !== null) {
                return parseInt(l, 10);
            }
        }
        return this.getRecordsCount();
    };
    Response.prototype.hasNextPage = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return (cp + 1 <= this.getNumberOfPages());
    };
    Response.prototype.hasPreviousPage = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return ((cp - 1) > 0);
    };
    Response.prototype.rewindRecordList = function () {
        this.recordIndex = 0;
        return this;
    };
    Response.prototype.hasColumn = function (key) {
        return (this.columnkeys.indexOf(key) !== -1);
    };
    Response.prototype.hasCurrentRecord = function () {
        var len = this.records.length;
        return (len > 0 &&
            this.recordIndex >= 0 &&
            this.recordIndex < len);
    };
    Response.prototype.hasNextRecord = function () {
        var next = this.recordIndex + 1;
        return (this.hasCurrentRecord() && (next < this.records.length));
    };
    Response.prototype.hasPreviousRecord = function () {
        return (this.recordIndex > 0 && this.hasCurrentRecord());
    };
    return Response;
}(responsetemplate_1.ResponseTemplate));
exports.Response = Response;
//# sourceMappingURL=response.js.map