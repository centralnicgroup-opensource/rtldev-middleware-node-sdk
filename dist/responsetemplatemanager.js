"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseparser_1 = require("./responseparser");
const responsetemplate_1 = require("./responsetemplate");
class ResponseTemplateManager {
    constructor() {
        this.templates = {
            404: this.generateTemplate("421", "Page not found"),
            500: this.generateTemplate("500", "Internal server error"),
            empty: this.generateTemplate("423", "Empty API response. Probably unreachable API end point"),
            error: this.generateTemplate("421", "Command failed due to server error. Client should try again"),
            expired: this.generateTemplate("530", "SESSION NOT FOUND"),
            httperror: this.generateTemplate("421", "Command failed due to HTTP communication error"),
            unauthorized: this.generateTemplate("530", "Unauthorized"),
        };
    }
    static getInstance() {
        if (!ResponseTemplateManager.instance) {
            ResponseTemplateManager.instance = new ResponseTemplateManager();
        }
        return ResponseTemplateManager.instance;
    }
    generateTemplate(code, description) {
        return `[RESPONSE]\r\nCODE=${code}\r\nDESCRIPTION=${description}\r\nEOF\r\n`;
    }
    addTemplate(id, plain) {
        this.templates[id] = plain;
        return ResponseTemplateManager.instance;
    }
    getTemplate(id) {
        if (this.hasTemplate(id)) {
            return new responsetemplate_1.ResponseTemplate(this.templates[id]);
        }
        return new responsetemplate_1.ResponseTemplate(this.generateTemplate("500", "Response Template not found"));
    }
    getTemplates() {
        const tpls = {};
        Object.keys(this.templates).forEach((key) => {
            tpls[key] = new responsetemplate_1.ResponseTemplate(this.templates[key]);
        });
        return tpls;
    }
    hasTemplate(id) {
        return this.templates.hasOwnProperty(id);
    }
    isTemplateMatchHash(tpl2, id) {
        const h = this.getTemplate(id).getHash();
        return ((h.CODE === tpl2.CODE) &&
            (h.DESCRIPTION === tpl2.DESCRIPTION));
    }
    isTemplateMatchPlain(plain, id) {
        const h = this.getTemplate(id).getHash();
        const tpl2 = responseparser_1.ResponseParser.parse(plain);
        return ((h.CODE === tpl2.CODE) &&
            (h.DESCRIPTION === tpl2.DESCRIPTION));
    }
}
exports.ResponseTemplateManager = ResponseTemplateManager;
ResponseTemplateManager.getInstance();
//# sourceMappingURL=responsetemplatemanager.js.map