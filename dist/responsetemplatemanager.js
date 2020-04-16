"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var responseparser_1 = require("./responseparser");
var responsetemplate_1 = require("./responsetemplate");
var ResponseTemplateManager = (function () {
    function ResponseTemplateManager() {
        this.templates = {
            404: this.generateTemplate("421", "Page not found"),
            500: this.generateTemplate("500", "Internal server error"),
            empty: this.generateTemplate("423", "Empty API response. Probably unreachable API end point {CONNECTION_URL}"),
            error: this.generateTemplate("421", "Command failed due to server error. Client should try again"),
            expired: this.generateTemplate("530", "SESSION NOT FOUND"),
            httperror: this.generateTemplate("421", "Command failed due to HTTP communication error"),
            invalid: this.generateTemplate("423", "Invalid API response. Contact Support"),
            unauthorized: this.generateTemplate("530", "Unauthorized"),
        };
    }
    ResponseTemplateManager.getInstance = function () {
        if (!ResponseTemplateManager.instance) {
            ResponseTemplateManager.instance = new ResponseTemplateManager();
        }
        return ResponseTemplateManager.instance;
    };
    ResponseTemplateManager.prototype.generateTemplate = function (code, description) {
        return "[RESPONSE]\r\nCODE=" + code + "\r\nDESCRIPTION=" + description + "\r\nEOF\r\n";
    };
    ResponseTemplateManager.prototype.addTemplate = function (id, plain) {
        this.templates[id] = plain;
        return ResponseTemplateManager.instance;
    };
    ResponseTemplateManager.prototype.getTemplate = function (id) {
        if (this.hasTemplate(id)) {
            return new responsetemplate_1.ResponseTemplate(this.templates[id]);
        }
        return new responsetemplate_1.ResponseTemplate(this.generateTemplate("500", "Response Template not found"));
    };
    ResponseTemplateManager.prototype.getTemplates = function () {
        var _this = this;
        var tpls = {};
        Object.keys(this.templates).forEach(function (key) {
            tpls[key] = new responsetemplate_1.ResponseTemplate(_this.templates[key]);
        });
        return tpls;
    };
    ResponseTemplateManager.prototype.hasTemplate = function (id) {
        return this.templates.hasOwnProperty(id);
    };
    ResponseTemplateManager.prototype.isTemplateMatchHash = function (tpl2, id) {
        var h = this.getTemplate(id).getHash();
        return ((h.CODE === tpl2.CODE) &&
            (h.DESCRIPTION === tpl2.DESCRIPTION));
    };
    ResponseTemplateManager.prototype.isTemplateMatchPlain = function (plain, id) {
        var h = this.getTemplate(id).getHash();
        var tpl2 = responseparser_1.ResponseParser.parse(plain);
        return ((h.CODE === tpl2.CODE) &&
            (h.DESCRIPTION === tpl2.DESCRIPTION));
    };
    return ResponseTemplateManager;
}());
exports.ResponseTemplateManager = ResponseTemplateManager;
ResponseTemplateManager.getInstance();
//# sourceMappingURL=responsetemplatemanager.js.map