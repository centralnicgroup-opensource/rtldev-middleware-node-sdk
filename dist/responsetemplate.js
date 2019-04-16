"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseparser_1 = require("./responseparser");
const responsetemplatemanager_1 = require("./responsetemplatemanager");
class ResponseTemplate {
    constructor(raw) {
        if (!raw) {
            raw = responsetemplatemanager_1.ResponseTemplateManager.getInstance().getTemplate("empty").getPlain();
        }
        this.raw = raw;
        this.hash = responseparser_1.ResponseParser.parse(raw);
    }
    getCode() {
        return parseInt(this.hash.CODE, 10);
    }
    getDescription() {
        return this.hash.DESCRIPTION;
    }
    getPlain() {
        return this.raw;
    }
    getQueuetime() {
        if (this.hash.hasOwnProperty("QUEUETIME")) {
            return parseFloat(this.hash.QUEUETIME);
        }
        return 0.00;
    }
    getHash() {
        return this.hash;
    }
    getRuntime() {
        if (this.hash.hasOwnProperty("RUNTIME")) {
            return parseFloat(this.hash.RUNTIME);
        }
        return 0.00;
    }
    isError() {
        return this.hash.CODE.charAt(0) === "5";
    }
    isSuccess() {
        return this.hash.CODE.charAt(0) === "2";
    }
    isTmpError() {
        return this.hash.CODE.charAt(0) === "4";
    }
    isPending() {
        return (this.hash.hasOwnProperty("PENDING")) ? this.hash.PENDING === "1" : false;
    }
}
exports.ResponseTemplate = ResponseTemplate;
//# sourceMappingURL=responsetemplate.js.map