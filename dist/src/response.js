var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Column } from "./column";
import { Record } from "./record";
import { ResponseTemplate } from "./responsetemplate";
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
        var col = new Column(key, data);
        this.columns.push(col);
        this.columnkeys.push(key);
        return this;
    };
    Response.prototype.addRecord = function (h) {
        this.records.push(new Record(h));
        return this;
    };
    Response.prototype.getColumn = function (key) {
        return this.hasColumn(key)
            ? this.columns[this.columnkeys.indexOf(key)]
            : null;
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
            return len - 1;
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
        return page <= pages ? page : pages;
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
        return cp - 1 || null;
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
        return cp + 1 <= this.getNumberOfPages();
    };
    Response.prototype.hasPreviousPage = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return cp - 1 > 0;
    };
    Response.prototype.rewindRecordList = function () {
        this.recordIndex = 0;
        return this;
    };
    Response.prototype.hasColumn = function (key) {
        return this.columnkeys.indexOf(key) !== -1;
    };
    Response.prototype.hasCurrentRecord = function () {
        var len = this.records.length;
        return len > 0 && this.recordIndex >= 0 && this.recordIndex < len;
    };
    Response.prototype.hasNextRecord = function () {
        var next = this.recordIndex + 1;
        return this.hasCurrentRecord() && next < this.records.length;
    };
    Response.prototype.hasPreviousRecord = function () {
        return this.recordIndex > 0 && this.hasCurrentRecord();
    };
    return Response;
}(ResponseTemplate));
export { Response };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBS3REO0lBQThCLDRCQUFnQjtJQThCNUMsa0JBQW1CLEdBQVcsRUFBRSxHQUFRLEVBQUUsRUFBWTtRQUFaLG1CQUFBLEVBQUEsT0FBWTtRQUF0RCxZQUNFLGtCQUFNLEdBQUcsQ0FBQyxTQWdEWDtRQTlDQyxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFlO1lBQzNCLEtBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBSSxPQUFPLE1BQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWhELFFBQUEsa0JBQU0sS0FBSSxDQUFDLEdBQUcsQ0FBQyxTQUFDO1FBR2hCLEtBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ25CLElBQ0UsS0FBSSxDQUFDLE9BQU87WUFDWixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFDOUQ7WUFFQSxLQUFJLENBQUMsT0FBTyxDQUFD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Z0IsR0FBdkI7UUFDRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFPTyw0QkFBUyxHQUFqQixVQUFrQixHQUFXO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQU9PLG1DQUFnQixHQUF4QjtRQUNFLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztJQUNwRSxDQUFDO0lBT08sZ0NBQWEsR0FBckI7UUFDRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUMvRCxDQUFDO0lBT08sb0NBQWlCLEdBQXpCO1FBQ0UsT0FBTyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBQ0gsZUFBQztBQUFELENBQUMsQUE5YkQsQ0FBOEIsZ0JBQWdCLEdBOGI3QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbHVtbiB9IGZyb20gXCIuL2NvbHVtblwiO1xuaW1wb3J0IHsgUmVjb3JkIH0gZnJvbSBcIi4vcmVjb3JkXCI7XG5pbXBvcnQgeyBSZXNwb25zZVRlbXBsYXRlIH0gZnJvbSBcIi4vcmVzcG9uc2V0ZW1wbGF0ZVwiO1xuXG4vKipcbiAqIFJlc3BvbnNlIENsYXNzIGluaGVyaXRpbmcgZnJvbSBSZXNwb25zZVRlbXBsYXRlIENsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNwb25zZSBleHRlbmRzIFJlc3BvbnNlVGVtcGxhdGUge1xuICAvKipcbiAgICogVGhlIEFQSSBDb21tYW5kIHVzZWQgd2l0aGluIHRoaXMgcmVxdWVzdFxuICAgKi9cbiAgcHJpdmF0ZSBjb21tYW5kOiBhbnk7XG4gIC8qKlxuICAgKiBDb2x1bW4gbmFtZXMgYXZhaWxhYmxlIGluIHRoaXMgcmVzcG9uc3NlXG4gICAqIE5PVEU6IHRoaXMgaW5jbHVkZXMgYWxzbyBGSVJTVCwgTEFTVCwgTElNSVQsIENPVU5ULCBUT1RBTFxuICAgKiBhbmQgbWF5YmUgZnVydGhlciBzcGVjaWZpYyBjb2x1bW5zIGluIGNhc2Ugb2YgYSBsaXN0IHF1ZXJ5XG4gICAqL1xuICBwcml2YXRlIGNvbHVtbmtleXM6IHN0cmluZ1tdO1xuICAvKipcbiAgICogQ29udGFpbmVyIG9mIENvbHVtbiBJbnN0YW5jZXNcbiAgICovXG4gIHByaXZhdGUgY29sdW1uczogQ29sdW1uW107XG4gIC8qKlxuICAgKiBSZWNvcmQgSW5kZXggd2UgY3VycmVudGx5IHBvaW50IHRvIGluIHJlY29yZCBsaXN0XG4gICAqL1xuICBwcml2YXRlIHJlY29yZEluZGV4OiBudW1iZXI7XG4gIC8qKlxuICAgKiBSZWNvcmQgTGlzdCAoTGlzdCBvZiByb3dzKVxuICAgKi9cbiAgcHJpdmF0ZSByZWNvcmRzOiBSZWNvcmRbXTtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3JcbiAgICogQHBhcmFtIHJhdyBBUEkgcGxhaW4gcmVzcG9uc2VcbiAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB1c2VkIHdpdGhpbiB0aGlzIHJlcXVlc3RcbiAgICogQHBhcmFtICRwaCBwbGFjZWhvbGRlciBhcnJheSB0byBnZXQgdmFycyBpbiByZXNwb25zZSBkZXNjcmlwdGlvbiBkeW5hbWljYWxseSByZXBsYWNlZFxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKHJhdzogc3RyaW5nLCBjbWQ6IGFueSwgcGg6IGFueSA9IHt9KSB7XG4gICAgc3VwZXIocmF3KTtcblxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhwaCk7XG4gICAga2V5cy5mb3JFYWNoKCh2YXJOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMucmF3ID0gdGhpcy5yYXcucmVwbGFjZShuZXcgUmVnRXhwKGB7JHt2YXJOYW1lfX1gLCBcImdcIiksIHBoW3Zhck5hbWVdKTtcbiAgICB9KTtcbiAgICB0aGlzLnJhdyA9IHRoaXMucmF3LnJlcGxhY2UoL1xce1tBLVpfXStcXH0vZywgXCJcIik7XG4gICAgLyogZXNsaW50LWRpc2FibGUgY29uc3RydWN0b3Itc3VwZXIgKi9cbiAgICBzdXBlcih0aGlzLnJhdyk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBjb25zdHJ1Y3Rvci1zdXBlciAqL1xuXG4gICAgdGhpcy5jb21tYW5kID0gY21kO1xuICAgIGlmIChcbiAgICAgIHRoaXMuY29tbWFuZCAmJlxuICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY29tbWFuZCwgXCJQQVNTV09SRFwiKVxuICAgICkge1xuICAgICAgLy8gbWFrZSBwYXNzd29yZCBubyBsb25nZXIgYWNjZXNzaWJsZVxuICAgICAgdGhpcy5jb21tYW5kLlBBU1NXT1JEID0gXCIqKipcIjtcbiAgICB9XG4gICAgdGhpcy5jb2x1bW5rZXlzID0gW107XG4gICAgdGhpcy5jb2x1bW5zID0gW107XG4gICAgdGhpcy5yZWNvcmRJbmRleCA9IDA7XG4gICAgdGhpcy5yZWNvcmRzID0gW107XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuaGFzaCwgXCJQUk9QRVJUWVwiKSkge1xuICAgICAgY29uc3QgY29sS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuaGFzaC5QUk9QRVJUWSk7XG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgY29sS2V5cy5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZCA9IHRoaXMuaGFzaC5QUk9QRVJUWVtjXTtcbiAgICAgICAgdGhpcy5hZGRDb2x1bW4oYywgZCk7XG4gICAgICAgIGlmIChkLmxlbmd0aCA+IGNvdW50KSB7XG4gICAgICAgICAgY291bnQgPSBkLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgZDogYW55ID0ge307XG4gICAgICAgIGNvbEtleXMuZm9yRWFjaCgoazogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29sID0gdGhpcy5nZXRDb2x1bW4oayk7XG4gICAgICAgICAgaWYgKGNvbCkge1xuICAgICAgICAgICAgY29uc3QgdiA9IGNvbC5nZXREYXRhQnlJbmRleChpKTtcbiAgICAgICAgICAgIGlmICh2ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGRba10gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkUmVjb3JkKGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBjb2x1bW4gdG8gdGhlIGNvbHVtbiBsaXN0XG4gICAqIEBwYXJhbSBrZXkgY29sdW1uIG5hbWVcbiAgICogQHBhcmFtIGRhdGEgYXJyYXkgb2YgY29sdW1uIGRhdGFcbiAgICogQHJldHVybnMgQ3VycmVudCBSZXNwb25zZSBJbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgYWRkQ29sdW1uKGtleTogc3RyaW5nLCBkYXRhOiBzdHJpbmdbXSk6IFJlc3BvbnNlIHtcbiAgICBjb25zdCBjb2wgPSBuZXcgQ29sdW1uKGtleSwgZGF0YSk7XG4gICAgdGhpcy5jb2x1bW5zLnB1c2goY29sKTtcbiAgICB0aGlzLmNvbHVtbmtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlY29yZCB0byB0aGUgcmVjb3JkIGxpc3RcbiAgICogQHBhcmFtIGggcm93IGhhc2ggZGF0YVxuICAgKiBAcmV0dXJucyBDdXJyZW50IFJlc3BvbnNlIEluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBhZGRSZWNvcmQoaDogYW55KTogUmVzcG9uc2Uge1xuICAgIHRoaXMucmVjb3Jkcy5wdXNoKG5ldyBSZWNvcmQoaCkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjb2x1bW4gYnkgY29sdW1uIG5hbWVcbiAgICogQHBhcmFtIGtleSBjb2x1bW4gbmFtZVxuICAgKiBAcmV0dXJucyBjb2x1bW4gaW5zdGFuY2Ugb3IgbnVsbCBpZiBjb2x1bW4gZG9lcyBub3QgZXhpc3RcbiAgICovXG4gIHB1YmxpYyBnZXRDb2x1bW4oa2V5OiBzdHJpbmcpOiBDb2x1bW4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5oYXNDb2x1bW4oa2V5KVxuICAgICAgPyB0aGlzLmNvbHVtbnNbdGhpcy5jb2x1bW5rZXlzLmluZGV4T2Yoa2V5KV1cbiAgICAgIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRGF0YSBieSBDb2x1bW4gTmFtZSBhbmQgSW5kZXhcbiAgICogQHBhcmFtIGNvbGtleSBjb2x1bW4gbmFtZVxuICAgKiBAcGFyYW0gaW5kZXggY29sdW1uIGRhdGEgaW5kZXhcbiAgICogQHJldHVybnMgY29sdW1uIGRhdGEgYXQgaW5kZXggb3IgbnVsbCBpZiBub3QgZm91bmRcbiAgICovXG4gIHB1YmxpYyBnZXRDb2x1bW5JbmRleChjb2xrZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGNvbCA9IHRoaXMuZ2V0Q29sdW1uKGNvbGtleSk7XG4gICAgcmV0dXJuIGNvbCA/IGNvbC5nZXREYXRhQnlJbmRleChpbmRleCkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBDb2x1bW4gTmFtZXNcbiAgICogQHJldHVybnMgQXJyYXkgb2YgQ29sdW1uIE5hbWVzXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29sdW1uS2V5cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuY29sdW1ua2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgTGlzdCBvZiBDb2x1bW5zXG4gICAqIEByZXR1cm5zIEFycmF5IG9mIENvbHVtbnNcbiAgICovXG4gIHB1YmxpYyBnZXRDb2x1bW5zKCk6IENvbHVtbltdIHtcbiAgICByZXR1cm4gdGhpcy5jb2x1bW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBDb21tYW5kIHVzZWQgaW4gdGhpcyByZXF1ZXN0XG4gICAqIEByZXR1cm5zIGNvbW1hbmRcbiAgICovXG4gIHB1YmxpYyBnZXRDb21tYW5kKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgQ29tbWFuZCB1c2VkIGluIHRoaXMgcmVxdWVzdCBpbiBwbGFpbiB0ZXh0IGZvcm1hdFxuICAgKiBAcmV0dXJuIGNvbW1hbmQgYXMgcGxhaW4gdGV4dFxuICAgKi9cbiAgcHVibGljIGdldENvbW1hbmRQbGFpbigpOiBzdHJpbmcge1xuICAgIGxldCB0bXAgPSBcIlwiO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuY29tbWFuZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIHRtcCArPSBgJHtrZXl9ID0gJHt0aGlzLmNvbW1hbmRba2V5XX1cXG5gO1xuICAgIH0pO1xuICAgIHJldHVybiB0bXA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IFBhZ2UgTnVtYmVyIG9mIGN1cnJlbnQgTGlzdCBRdWVyeVxuICAgKiBAcmV0dXJucyBwYWdlIG51bWJlciBvciBudWxsIGluIGNhc2Ugb2YgYSBub24tbGlzdCByZXNwb25zZVxuICAgKi9cbiAgcHVibGljIGdldEN1cnJlbnRQYWdlTnVtYmVyKCk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5nZXRGaXJzdFJlY29yZEluZGV4KCk7XG4gICAgY29uc3QgbGltaXQgPSB0aGlzLmdldFJlY29yZHNMaW1pdGF0aW9uKCk7XG4gICAgaWYgKGZpcnN0ICE9PSBudWxsICYmIGxpbWl0KSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihmaXJzdCAvIGxpbWl0KSArIDE7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBSZWNvcmQgb2YgY3VycmVudCByZWNvcmQgaW5kZXhcbiAgICogQHJldHVybnMgUmVjb3JkIG9yIG51bGwgaW4gY2FzZSBvZiBhIG5vbi1saXN0IHJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgZ2V0Q3VycmVudFJlY29yZCgpOiBSZWNvcmQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5oYXNDdXJyZW50UmVjb3JkKCkgPyB0aGlzLnJlY29yZHNbdGhpcy5yZWNvcmRJbmRleF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBJbmRleCBvZiBmaXJzdCByb3cgaW4gdGhpcyByZXNwb25zZVxuICAgKiBAcmV0dXJucyBmaXJzdCByb3cgaW5kZXhcbiAgICovXG4gIHB1YmxpYyBnZXRGaXJzdFJlY29yZEluZGV4KCk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IGNvbCA9IHRoaXMuZ2V0Q29sdW1uKFwiRklSU1RcIik7XG4gICAgaWYgKGNvbCkge1xuICAgICAgY29uc3QgZiA9IGNvbC5nZXREYXRhQnlJbmRleCgwKTtcbiAgICAgIGlmIChmICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChmLCAxMCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnJlY29yZHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGxhc3QgcmVjb3JkIGluZGV4IG9mIHRoZSBjdXJyZW50IGxpc3QgcXVlcnlcbiAgICogQHJldHVybnMgcmVjb3JkIGluZGV4IG9yIG51bGwgZm9yIGEgbm9uLWxpc3QgcmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBnZXRMYXN0UmVjb3JkSW5kZXgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgY29sID0gdGhpcy5nZXRDb2x1bW4oXCJMQVNUXCIpO1xuICAgIGlmIChjb2wpIHtcbiAgICAgIGNvbnN0IGwgPSBjb2wuZ2V0RGF0YUJ5SW5kZXgoMCk7XG4gICAgICBpZiAobCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQobCwgMTApO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsZW4gPSB0aGlzLmdldFJlY29yZHNDb3VudCgpO1xuICAgIGlmIChsZW4pIHtcbiAgICAgIHJldHVybiBsZW4gLSAxO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgUmVzcG9uc2UgYXMgTGlzdCBIYXNoIGluY2x1ZGluZyB1c2VmdWwgbWV0YSBkYXRhIGZvciB0YWJsZXNcbiAgICogQHJldHVybnMgaGFzaCBpbmNsdWRpbmcgbGlzdCBtZXRhIGRhdGEgYW5kIGFycmF5IG9mIHJvd3MgaW4gaGFzaCBub3RhdGlvblxuICAgKi9cbiAgcHVibGljIGdldExpc3RIYXNoKCk6IGFueSB7XG4gICAgY29uc3QgbGg6IGFueVtdID0gW107XG4gICAgdGhpcy5nZXRSZWNvcmRzKCkuZm9yRWFjaCgocmVjKSA9PiB7XG4gICAgICBsaC5wdXNoKHJlYy5nZXREYXRhKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBMSVNUOiBsaCxcbiAgICAgIG1ldGE6IHtcbiAgICAgICAgY29sdW1uczogdGhpcy5nZXRDb2x1bW5LZXlzKCksXG4gICAgICAgIHBnOiB0aGlzLmdldFBhZ2luYXRpb24oKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbmV4dCByZWNvcmQgaW4gcmVjb3JkIGxpc3RcbiAgICogQHJldHVybnMgUmVjb3JkIG9yIG51bGwgaW4gY2FzZSB0aGVyZSdzIG5vIGZ1cnRoZXIgcmVjb3JkXG4gICAqL1xuICBwdWJsaWMgZ2V0TmV4dFJlY29yZCgpOiBSZWNvcmQgfCBudWxsIHtcbiAgICBpZiAodGhpcy5oYXNOZXh0UmVjb3JkKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlY29yZHNbKyt0aGlzLnJlY29yZEluZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IFBhZ2UgTnVtYmVyIG9mIG5leHQgbGlzdCBxdWVyeVxuICAgKiBAcmV0dXJucyBwYWdlIG51bWJlciBvciBudWxsIGlmIHRoZXJlJ3Mgbm8gbmV4dCBwYWdlXG4gICAqL1xuICBwdWJsaWMgZ2V0TmV4dFBhZ2VOdW1iZXIoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgY3AgPSB0aGlzLmdldEN1cnJlbnRQYWdlTnVtYmVyKCk7XG4gICAgaWYgKGNwID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcGFnZSA9IGNwICsgMTtcbiAgICBjb25zdCBwYWdlcyA9IHRoaXMuZ2V0TnVtYmVyT2ZQYWdlcygpO1xuICAgIHJldHVybiBwYWdlIDw9IHBhZ2VzID8gcGFnZSA6IHBhZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHBhZ2VzIGF2YWlsYWJsZSBmb3IgdGhpcyBsaXN0IHF1ZXJ5XG4gICAqIEByZXR1cm5zIG51bWJlciBvZiBwYWdlc1xuICAgKi9cbiAgcHVibGljIGdldE51bWJlck9mUGFnZXMoKTogbnVtYmVyIHtcbiAgICBjb25zdCB0ID0gdGhpcy5nZXRSZWNvcmRzVG90YWxDb3VudCgpO1xuICAgIGNvbnN0IGxpbWl0ID0gdGhpcy5nZXRSZWNvcmRzTGltaXRhdGlvbigpO1xuICAgIGlmICh0ICYmIGxpbWl0KSB7XG4gICAgICByZXR1cm4gTWF0aC5jZWlsKHQgLyB0aGlzLmdldFJlY29yZHNMaW1pdGF0aW9uKCkpO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHBhZ2luZyBkYXRhXG4gICAqIEByZXR1cm5zIHBhZ2luYXRvciBkYXRhXG4gICAqL1xuICBwdWJsaWMgZ2V0UGFnaW5hdGlvbigpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBDT1VOVDogdGhpcy5nZXRSZWNvcmRzQ291bnQoKSxcbiAgICAgIENVUlJFTlRQQUdFOiB0aGlzLmdldEN1cnJlbnRQYWdlTnVtYmVyKCksXG4gICAgICBGSVJTVDogdGhpcy5nZXRGaXJzdFJlY29yZEluZGV4KCksXG4gICAgICBMQVNUOiB0aGlzLmdldExhc3RSZWNvcmRJbmRleCgpLFxuICAgICAgTElNSVQ6IHRoaXMuZ2V0UmVjb3Jkc0xpbWl0YXRpb24oKSxcbiAgICAgIE5FWFRQQUdFOiB0aGlzLmdldE5leHRQYWdlTnVtYmVyKCksXG4gICAgICBQQUdFUzogdGhpcy5nZXROdW1iZXJPZlBhZ2VzKCksXG4gICAgICBQUkVWSU9VU1BBR0U6IHRoaXMuZ2V0UHJldmlvdXNQYWdlTnVtYmVyKCksXG4gICAgICBUT1RBTDogdGhpcy5nZXRSZWNvcmRzVG90YWxDb3VudCgpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogR2V0IFBhZ2UgTnVtYmVyIG9mIHByZXZpb3VzIGxpc3QgcXVlcnlcbiAgICogQHJldHVybnMgcGFnZSBudW1iZXIgb3IgbnVsbCBpZiB0aGVyZSdzIG5vIHByZXZpb3VzIHBhZ2VcbiAgICovXG4gIHB1YmxpYyBnZXRQcmV2aW91c1BhZ2VOdW1iZXIoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgY3AgPSB0aGlzLmdldEN1cnJlbnRQYWdlTnVtYmVyKCk7XG4gICAgaWYgKGNwID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNwIC0gMSB8fCBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwcmV2aW91cyByZWNvcmQgaW4gcmVjb3JkIGxpc3RcbiAgICogQHJldHVybnMgUmVjb3JkIG9yIG51bGwgaWYgdGhlcmUncyBubyBwcmV2aW91cyByZWNvcmRcbiAgICovXG4gIHB1YmxpYyBnZXRQcmV2aW91c1JlY29yZCgpOiBSZWNvcmQgfCBudWxsIHtcbiAgICBpZiAodGhpcy5oYXNQcmV2aW91c1JlY29yZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWNvcmRzWy0tdGhpcy5yZWNvcmRJbmRleF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBSZWNvcmQgYXQgZ2l2ZW4gaW5kZXhcbiAgICogQHBhcmFtIGlkeCByZWNvcmQgaW5kZXhcbiAgICogQHJldHVybnMgUmVjb3JkIG9yIG51bGwgaWYgaW5kZXggZG9lcyBub3QgZXhpc3RcbiAgICovXG4gIHB1YmxpYyBnZXRSZWNvcmQoaWR4OiBudW1iZXIpOiBSZWNvcmQgfCBudWxsIHtcbiAgICBpZiAoaWR4ID49IDAgJiYgdGhpcy5yZWNvcmRzLmxlbmd0aCA+IGlkeCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVjb3Jkc1tpZHhdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIFJlY29yZHNcbiAgICogQHJldHVybnMgYXJyYXkgb2YgcmVjb3Jkc1xuICAgKi9cbiAgcHVibGljIGdldFJlY29yZHMoKTogUmVjb3JkW10ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZHM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvdW50IG9mIHJvd3MgaW4gdGhpcyByZXNwb25zZVxuICAgKiBAcmV0dXJucyBjb3VudCBvZiByb3dzXG4gICAqL1xuICBwdWJsaWMgZ2V0UmVjb3Jkc0NvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVjb3Jkcy5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRvdGFsIGNvdW50IG9mIHJlY29yZHMgYXZhaWxhYmxlIGZvciB0aGUgbGlzdCBxdWVyeVxuICAgKiBAcmV0dXJucyB0b3RhbCBjb3VudCBvZiByZWNvcmRzIG9yIGNvdW50IG9mIHJlY29yZHMgZm9yIGEgbm9uLWxpc3QgcmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBnZXRSZWNvcmRzVG90YWxDb3VudCgpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvbCA9IHRoaXMuZ2V0Q29sdW1uKFwiVE9UQUxcIik7XG4gICAgaWYgKGNvbCkge1xuICAgICAgY29uc3QgdCA9IGNvbC5nZXREYXRhQnlJbmRleCgwKTtcbiAgICAgIGlmICh0ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0LCAxMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFJlY29yZHNDb3VudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBsaW1pdChhdGlvbikgc2V0dGluZyBvZiB0aGUgY3VycmVudCBsaXN0IHF1ZXJ5XG4gICAqIFRoaXMgaXMgdGhlIGNvdW50IG9mIHJlcXVlc3RlZCByb3dzXG4gICAqIEByZXR1cm5zIGxpbWl0IHNldHRpbmcgb3IgY291bnQgcmVxdWVzdGVkIHJvd3NcbiAgICovXG4gIHB1YmxpYyBnZXRSZWNvcmRzTGltaXRhdGlvbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvbCA9IHRoaXMuZ2V0Q29sdW1uKFwiTElNSVRcIik7XG4gICAgaWYgKGNvbCkge1xuICAgICAgY29uc3QgbCA9IGNvbC5nZXREYXRhQnlJbmRleCgwKTtcbiAgICAgIGlmIChsICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChsLCAxMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFJlY29yZHNDb3VudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoaXMgbGlzdCBxdWVyeSBoYXMgYSBuZXh0IHBhZ2VcbiAgICogQHJldHVybnMgYm9vbGVhbiByZXN1bHRcbiAgICovXG4gIHB1YmxpYyBoYXNOZXh0UGFnZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBjcCA9IHRoaXMuZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKTtcbiAgICBpZiAoY3AgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNwICsgMSA8PSB0aGlzLmdldE51bWJlck9mUGFnZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGlzIGxpc3QgcXVlcnkgaGFzIGEgcHJldmlvdXMgcGFnZVxuICAgKiBAcmV0dXJucyBib29sZWFuIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGhhc1ByZXZpb3VzUGFnZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBjcCA9IHRoaXMuZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKTtcbiAgICBpZiAoY3AgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNwIC0gMSA+IDA7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgaW5kZXggaW4gcmVjb3JkIGxpc3QgYmFjayB0byB6ZXJvXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgUmVzcG9uc2UgSW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHJld2luZFJlY29yZExpc3QoKTogUmVzcG9uc2Uge1xuICAgIHRoaXMucmVjb3JkSW5kZXggPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbHVtbiBleGlzdHMgaW4gcmVzcG9uc2VcbiAgICogQHBhcmFtIGtleSBjb2x1bW4gbmFtZVxuICAgKiBAcmV0dXJucyBib29sZWFuIHJlc3VsdFxuICAgKi9cbiAgcHJpdmF0ZSBoYXNDb2x1bW4oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb2x1bW5rZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIHJlY29yZCBsaXN0IGNvbnRhaW5zIGEgcmVjb3JkIGZvciB0aGVcbiAgICogY3VycmVudCByZWNvcmQgaW5kZXggaW4gdXNlXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gcmVzdWx0XG4gICAqL1xuICBwcml2YXRlIGhhc0N1cnJlbnRSZWNvcmQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGVuID0gdGhpcy5yZWNvcmRzLmxlbmd0aDtcbiAgICByZXR1cm4gbGVuID4gMCAmJiB0aGlzLnJlY29yZEluZGV4ID49IDAgJiYgdGhpcy5yZWNvcmRJbmRleCA8IGxlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgcmVjb3JkIGxpc3QgY29udGFpbnMgYSBuZXh0IHJlY29yZCBmb3IgdGhlXG4gICAqIGN1cnJlbnQgcmVjb3JkIGluZGV4IGluIHVzZVxuICAgKiBAcmV0dXJucyBib29sZWFuIHJlc3VsdFxuICAgKi9cbiAgcHJpdmF0ZSBoYXNOZXh0UmVjb3JkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5leHQgPSB0aGlzLnJlY29yZEluZGV4ICsgMTtcbiAgICByZXR1cm4gdGhpcy5oYXNDdXJyZW50UmVjb3JkKCkgJiYgbmV4dCA8IHRoaXMucmVjb3Jkcy5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIHJlY29yZCBsaXN0IGNvbnRhaW5zIGEgcHJldmlvdXMgcmVjb3JkIGZvciB0aGVcbiAgICogY3VycmVudCByZWNvcmQgaW5kZXggaW4gdXNlXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gcmVzdWx0XG4gICAqL1xuICBwcml2YXRlIGhhc1ByZXZpb3VzUmVjb3JkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZEluZGV4ID4gMCAmJiB0aGlzLmhhc0N1cnJlbnRSZWNvcmQoKTtcbiAgfVxufVxuIl19