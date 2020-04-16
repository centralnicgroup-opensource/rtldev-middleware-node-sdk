"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var responseparser_1 = require("./responseparser");
var responsetemplatemanager_1 = require("./responsetemplatemanager");
var ResponseTemplate = (function () {
    function ResponseTemplate(raw) {
        if (!raw) {
            raw = responsetemplatemanager_1.ResponseTemplateManager.getInstance().getTemplate("empty").getPlain();
        }
        this.raw = raw;
        this.hash = responseparser_1.ResponseParser.parse(raw);
        if (!Object.prototype.hasOwnProperty.call(this.hash, "CODE") ||
            !Object.prototype.hasOwnProperty.call(this.hash, "DESCRIPTION")) {
            this.raw = responsetemplatemanager_1.ResponseTemplateManager.getInstance().getTemplate("invalid").getPlain();
            this.hash = responseparser_1.ResponseParser.parse(this.raw);
        }
    }
    ResponseTemplate.prototype.getCode = function () {
        return parseInt(this.hash.CODE, 10);
    };
    ResponseTemplate.prototype.getDescription = function () {
        return this.hash.DESCRIPTION;
    };
    ResponseTemplate.prototype.getPlain = function () {
        return this.raw;
    };
    ResponseTemplate.prototype.getQueuetime = function () {
        if (this.hash.hasOwnProperty("QUEUETIME")) {
            return parseFloat(this.hash.QUEUETIME);
        }
        return 0.00;
    };
    ResponseTemplate.prototype.getHash = function () {
        return this.hash;
    };
    ResponseTemplate.prototype.getRuntime = function () {
        if (this.hash.hasOwnProperty("RUNTIME")) {
            return parseFloat(this.hash.RUNTIME);
        }
        return 0.00;
    };
    ResponseTemplate.prototype.isError = function () {
        return this.hash.CODE.charAt(0) === "5";
    };
    ResponseTemplate.prototype.isSuccess = function () {
        return this.hash.CODE.charAt(0) === "2";
    };
    ResponseTemplate.prototype.isTmpError = function () {
        return this.hash.CODE.charAt(0) === "4";
    };
    ResponseTemplate.prototype.isPending = function () {
        return (this.hash.hasOwnProperty("PENDING")) ? this.hash.PENDING === "1" : false;
    };
    return ResponseTemplate;
}());
exports.ResponseTemplate = ResponseTemplate;
//# sourceMappingURL=responsetemplate.js.map