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
var logger_1 = require("./logger");
var CustomLogger = (function (_super) {
    __extends(CustomLogger, _super);
    function CustomLogger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomLogger.prototype.log = function (post, r, error) {
        if (error === void 0) { error = null; }
        console.log(post);
        console.dir(r.getCommand());
        if (error) {
            console.error(error.message);
        }
        console.log(r.getPlain());
        return this;
    };
    return CustomLogger;
}(logger_1.Logger));
exports.CustomLogger = CustomLogger;
//# sourceMappingURL=customlogger.js.map