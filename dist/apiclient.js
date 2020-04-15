"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const request = require("request");
const response_1 = require("./response");
const responsetemplatemanager_1 = require("./responsetemplatemanager");
const socketconfig_1 = require("./socketconfig");
const rtm = responsetemplatemanager_1.ResponseTemplateManager.getInstance();
const defaultLogger = (post, r, error) => {
    console.dir(r.getCommand());
    console.log(post);
    if (error) {
        console.error("HTTP communication failed:", error);
    }
    console.log(r.getPlain());
};
class APIClient {
    constructor() {
        this.ua = "";
        this.socketURL = "";
        this.debugMode = false;
        this.setURL("https://api.ispapi.net/api/call.cgi");
        this.socketConfig = new socketconfig_1.SocketConfig();
        this.useLIVESystem();
        this.logger = defaultLogger;
    }
    setCustomLogger(customLogger) {
        this.logger = customLogger;
        return this;
    }
    setDefaultLogger() {
        this.logger = defaultLogger;
        return this;
    }
    enableDebugMode() {
        this.debugMode = true;
        return this;
    }
    disableDebugMode() {
        this.debugMode = false;
        return this;
    }
    getPOSTData(cmd) {
        let data = this.socketConfig.getPOSTData();
        let tmp = "";
        if (!(typeof cmd === "string" || cmd instanceof String)) {
            Object.keys(cmd).forEach((key) => {
                if (cmd[key] !== null && cmd[key] !== undefined) {
                    tmp += `${key}=${cmd[key].toString().replace(/\r|\n/g, "")}\n`;
                }
            });
        }
        tmp = tmp.replace(/\n$/, "");
        data += `${socketconfig_1.fixedURLEnc("s_command")}=${socketconfig_1.fixedURLEnc(tmp)}`;
        return data;
    }
    getSession() {
        const sessid = this.socketConfig.getSession();
        return (sessid === "") ? null : sessid;
    }
    getURL() {
        return this.socketURL;
    }
    setUserAgent(str, rv) {
        this.ua = (`${str} ` +
            `(${process.platform}; ${process.arch}; rv:${rv}) ` +
            `node-sdk/${this.getVersion()} ` +
            `node/${process.version}`);
        return this;
    }
    getUserAgent() {
        if (!this.ua.length) {
            this.ua = (`NODE-SDK (${process.platform}; ${process.arch}; rv:${this.getVersion()}) ` +
                `node/${process.version}`);
        }
        return this.ua;
    }
    getVersion() {
        const packageInfo = require(path.join(__dirname, "/../package.json"));
        return packageInfo.version;
    }
    saveSession(session) {
        session.socketcfg = {
            entity: this.socketConfig.getSystemEntity(),
            session: this.socketConfig.getSession(),
        };
        return this;
    }
    reuseSession(session) {
        this.socketConfig.setSystemEntity(session.socketcfg.entity);
        this.setSession(session.socketcfg.session);
        return this;
    }
    setURL(value) {
        this.socketURL = value;
        return this;
    }
    setOTP(value) {
        this.socketConfig.setOTP(value);
        return this;
    }
    setSession(value) {
        this.socketConfig.setSession(value);
        return this;
    }
    setRemoteIPAddress(value) {
        this.socketConfig.setRemoteAddress(value);
        return this;
    }
    setCredentials(uid, pw) {
        this.socketConfig.setLogin(uid);
        this.socketConfig.setPassword(pw);
        return this;
    }
    setRoleCredentials(uid, role, pw) {
        return this.setCredentials(role ? `${uid}!${role}` : uid, pw);
    }
    login(otp = "") {
        return __awaiter(this, void 0, void 0, function* () {
            this.setOTP(otp || "");
            const rr = yield this.request({ COMMAND: "StartSession" });
            if (rr.isSuccess()) {
                const col = rr.getColumn("SESSION");
                this.setSession(col ? col.getData()[0] : "");
            }
            return rr;
        });
    }
    loginExtended(params, otp = "") {
        return __awaiter(this, void 0, void 0, function* () {
            this.setOTP(otp);
            const rr = yield this.request(Object.assign({
                COMMAND: "StartSession",
            }, params));
            if (rr.isSuccess()) {
                const col = rr.getColumn("SESSION");
                this.setSession(col ? col.getData()[0] : "");
            }
            return rr;
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const rr = yield this.request({
                COMMAND: "EndSession",
            });
            if (rr.isSuccess()) {
                this.setSession("");
            }
            return rr;
        });
    }
    request(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            let mycmd = this.flattenCommand(cmd);
            mycmd = yield this.autoIDNConvert(mycmd);
            return new Promise((resolve) => {
                const data = this.getPOSTData(mycmd);
                request({
                    encoding: "utf8",
                    form: data,
                    gzip: true,
                    headers: {
                        "User-Agent": this.getUserAgent(),
                    },
                    method: "POST",
                    timeout: APIClient.socketTimeout,
                    url: this.socketURL,
                }, (error, r, body) => {
                    if ((!error) &&
                        (r.statusCode !== undefined) &&
                        (r.statusCode < 200 || r.statusCode > 299)) {
                        error = new Error(r.statusCode + (r.statusMessage ? " " + r.statusMessage : ""));
                    }
                    if (error) {
                        body = rtm.getTemplate("httperror").getPlain();
                    }
                    const rr = new response_1.Response(body, mycmd);
                    if (this.debugMode) {
                        this.logger(data, rr, error);
                    }
                    resolve(rr);
                });
            });
        });
    }
    requestNextResponsePage(rr) {
        return __awaiter(this, void 0, void 0, function* () {
            const mycmd = rr.getCommand();
            if (mycmd.hasOwnProperty("LAST")) {
                throw new Error("Parameter LAST in use. Please remove it to avoid issues in requestNextPage.");
            }
            let first = 0;
            if (mycmd.hasOwnProperty("FIRST")) {
                first = mycmd.FIRST;
            }
            const total = rr.getRecordsTotalCount();
            const limit = rr.getRecordsLimitation();
            first += limit;
            if (first < total) {
                mycmd.FIRST = first;
                mycmd.LIMIT = limit;
                return this.request(mycmd);
            }
            else {
                return null;
            }
        });
    }
    requestAllResponsePages(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const responses = [];
            const rr = yield this.request(Object.assign({}, cmd, { FIRST: 0 }));
            let tmp = rr;
            let idx = 0;
            do {
                responses[idx++] = tmp;
                tmp = yield this.requestNextResponsePage(tmp);
            } while (tmp !== null);
            return responses;
        });
    }
    setUserView(uid) {
        this.socketConfig.setUser(uid);
        return this;
    }
    resetUserView() {
        this.socketConfig.setUser("");
        return this;
    }
    useOTESystem() {
        this.socketConfig.setSystemEntity("1234");
        return this;
    }
    useLIVESystem() {
        this.socketConfig.setSystemEntity("54cd");
        return this;
    }
    toUpperCaseKeys(cmd) {
        const newcmd = {};
        Object.keys(cmd).forEach((k) => {
            newcmd[k.toUpperCase()] = cmd[k];
        });
        return newcmd;
    }
    flattenCommand(cmd) {
        const mycmd = this.toUpperCaseKeys(cmd);
        const newcmd = {};
        Object.keys(mycmd).forEach((key) => {
            const val = mycmd[key];
            if (val !== null && val !== undefined) {
                if (Array.isArray(val)) {
                    let index = 0;
                    for (const row of val) {
                        newcmd[`${key}${index}`] = (row + "").replace(/\r|\n/g, "");
                        index++;
                    }
                }
                else {
                    if (typeof val === "string" || val instanceof String) {
                        newcmd[key] = val.replace(/\r|\n/g, "");
                    }
                    else {
                        newcmd[key] = val;
                    }
                }
            }
        });
        return newcmd;
    }
    autoIDNConvert(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof cmd === "string" || cmd instanceof String || /^CONVERTIDN$/i.test(cmd.COMMAND)) {
                return cmd;
            }
            const keys = Object.keys(cmd).filter((key) => {
                return /^(DOMAIN|NAMESERVER|DNSZONE)([0-9]*)$/i.test(key);
            });
            if (!keys.length) {
                return cmd;
            }
            const toconvert = [];
            const idxs = [];
            keys.forEach((key) => {
                if (cmd[key] !== null && cmd[key] !== undefined && /[^a-z0-9\.\- ]/i.test(cmd[key])) {
                    toconvert.push(cmd[key]);
                    idxs.push(key);
                }
            });
            if (!toconvert.length) {
                return cmd;
            }
            const r = yield this.request({
                COMMAND: "ConvertIDN",
                DOMAIN: toconvert,
            });
            console.dir(r.getPlain());
            if (r.isSuccess()) {
                const col = r.getColumn("ACE");
                if (col) {
                    col.getData().forEach((pc, idx) => {
                        cmd[idxs[idx]] = pc;
                    });
                }
            }
            return cmd;
        });
    }
}
exports.APIClient = APIClient;
APIClient.socketTimeout = 300000;
//# sourceMappingURL=apiclient.js.map