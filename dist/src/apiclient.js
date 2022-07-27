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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = exports.ISPAPI_CONNECTION_URL_OTE = exports.ISPAPI_CONNECTION_URL_LIVE = exports.ISPAPI_CONNECTION_URL_PROXY = void 0;
var package_json_1 = __importDefault(require("../package.json"));
var logger_1 = require("./logger");
var response_1 = require("./response");
var responsetemplatemanager_1 = require("./responsetemplatemanager");
var socketconfig_1 = require("./socketconfig");
exports.ISPAPI_CONNECTION_URL_PROXY = "http://127.0.0.1/api/call.cgi";
exports.ISPAPI_CONNECTION_URL_LIVE = "https://api.ispapi.net/api/call.cgi";
exports.ISPAPI_CONNECTION_URL_OTE = "https://api-ote.ispapi.net/api/call.cgi";
var rtm = responsetemplatemanager_1.ResponseTemplateManager.getInstance();
var APIClient = (function () {
    function APIClient() {
        this.ua = "";
        this.socketURL = "";
        this.debugMode = false;
        this.setURL(exports.ISPAPI_CONNECTION_URL_LIVE);
        this.socketConfig = new socketconfig_1.SocketConfig();
        this.useLIVESystem();
        this.curlopts = {};
        this.logger = null;
        this.setDefaultLogger();
    }
    APIClient.prototype.setCustomLogger = function (customLogger) {
        this.logger = customLogger;
        return this;
    };
    APIClient.prototype.setDefaultLogger = function () {
        this.logger = new logger_1.Logger();
        return this;
    };
    APIClient.prototype.enableDebugMode = function () {
        this.debugMode = true;
        return this;
    };
    APIClient.prototype.disableDebugMode = function () {
        this.debugMode = false;
        return this;
    };
    APIClient.prototype.getSession = function () {
        var sessid = this.socketConfig.getSession();
        return sessid === "" ? null : sessid;
    };
    APIClient.prototype.getURL = function () {
        return this.socketURL;
    };
    APIClient.prototype.setUserAgent = function (str, rv, modules) {
        if (modules === void 0) { modules = []; }
        var mods = modules.length ? " " + modules.join(" ") : "";
        this.ua =
            "".concat(str, " ") +
                "(".concat(process.platform, "; ").concat(process.arch, "; rv:").concat(rv, ")") +
                mods +
                " node-sdk/".concat(this.getVersion(), " ") +
                "node/".concat(process.version);
        return this;
    };
    APIClient.prototype.getUserAgent = function () {
        if (!this.ua.length) {
            this.ua =
                "NODE-SDK (".concat(process.platform, "; ").concat(process.arch, "; rv:").concat(this.getVersion(), ") ") + "node/".concat(process.version);
        }
        return this.ua;
    };
    APIClient.prototype.setProxy = function (proxy) {
        this.curlopts.proxy = proxy;
        return this;
    };
    APIClient.prototype.getProxy = function () {
        if (Object.prototype.hasOwnProperty.call(this.curlopts, "proxy")) {
            return this.curlopts.proxy;
        }
        return null;
    };
    APIClient.prototype.setReferer = function (referer) {
        this.curlopts.referer = referer;
        return this;
    };
    APIClient.prototype.getReferer = function () {
        if (Object.prototype.hasOwnProperty.call(this.curlopts, "referer")) {
            return this.curlopts.referer;
        }
        return null;
    };
    APIClient.prototype.getVersion = function () {
        return package_json_1.default.version;
    };
    APIClient.prototype.saveSession = function (session) {
        session.socketcfg = {
            entity: this.socketConfig.getSystemEntity(),
            session: this.socketConfig.getSession(),
        };
        return this;
    };
    APIClient.prototype.reuseSession = function (session) {
        this.socketConfig.setSystemEntity(session.socketcfg.entity);
        this.setSession(session.socketcfg.session);
        return this;
    };
    APIClient.prototype.setURL = function (value) {
        this.socketURL = value;
        return this;
    };
    APIClient.prototype.setOTP = function (value) {
        this.socketConfig.setOTP(value);
        return this;
    };
    APIClient.prototype.setSession = function (value) {
        this.socketConfig.setSession(value);
        return this;
    };
    APIClient.prototype.setRemoteIPAddress = function (value) {
        this.socketConfig.setRemoteAddress(value);
        return this;
    };
    APIClient.prototype.setCredentials = function (uid, pw) {
        this.socketConfig.setLogin(uid);
        this.socketConfig.setPassword(pw);
        return this;
    };
    APIClient.prototype.setRoleCredentials = function (uid, role, pw) {
        return this.setCredentials(role ? "".concat(uid, "!").concat(role) : uid, pw);
    };
    APIClient.prototype.login = function (otp) {
        if (otp === void 0) { otp = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var rr, col;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setOTP(otp || "");
                        return [4, this.request({ COMMAND: "StartSession" })];
                    case 1:
                        rr = _a.sent();
                        if (rr.isSuccess()) {
                            col = rr.getColumn("SESSION");
                            this.setSession(col ? col.getData()[0] : "");
                        }
                        return [2, rr];
                }
            });
        });
    };
    APIClient.prototype.loginExtended = function (params, otp) {
        if (otp === void 0) { otp = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var rr, col;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setOTP(otp);
                        return [4, this.request(Object.assign({
                                COMMAND: "StartSession",
                            }, params))];
                    case 1:
                        rr = _a.sent();
                        if (rr.isSuccess()) {
                            col = rr.getColumn("SESSION");
                            this.setSession(col ? col.getData()[0] : "");
                        }
                        return [2, rr];
                }
            });
        });
    };
    APIClient.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request({
                            COMMAND: "EndSession",
                        })];
                    case 1:
                        rr = _a.sent();
                        if (rr.isSuccess()) {
                            this.setSession("");
                        }
                        return [2, rr];
                }
            });
        });
    };
    APIClient.prototype.request = function (cmd) {
        return __awaiter(this, void 0, void 0, function () {
            function fetch(url, init) {
                return __awaiter(this, void 0, void 0, function () {
                    var fetch;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, _importDynamic("node-fetch")];
                            case 1:
                                fetch = (_a.sent()).default;
                                return [2, fetch(url, init)];
                        }
                    });
                });
            }
            var mycmd, cfg, reqCfg, proxy, referer, _importDynamic;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mycmd = this.flattenCommand(cmd);
                        return [4, this.autoIDNConvert(mycmd)];
                    case 1:
                        mycmd = _a.sent();
                        cfg = {
                            CONNECTION_URL: this.socketURL,
                        };
                        reqCfg = {
                            body: this.getPOSTData(mycmd),
                            headers: {
                                "User-Agent": this.getUserAgent(),
                            },
                            method: "POST",
                            timeout: APIClient.socketTimeout,
                            url: cfg.CONNECTION_URL,
                        };
                        proxy = this.getProxy();
                        if (proxy) {
                            reqCfg.proxy = proxy;
                        }
                        referer = this.getReferer();
                        if (referer) {
                            reqCfg.headers.Referer = referer;
                        }
                        _importDynamic = new Function("modulePath", "return import(modulePath)");
                        return [2, fetch(cfg.CONNECTION_URL, reqCfg)
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var error, body, rr;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            error = null;
                                            if (!res.ok) return [3, 2];
                                            return [4, res.text()];
                                        case 1:
                                            body = _a.sent();
                                            return [3, 3];
                                        case 2:
                                            error = res.status + (res.statusText ? " " + res.statusText : "");
                                            body = rtm.getTemplate("httperror").getPlain();
                                            _a.label = 3;
                                        case 3:
                                            rr = new response_1.Response(body, mycmd, cfg);
                                            if (this.debugMode && this.logger) {
                                                this.logger.log(this.getPOSTData(mycmd, true), rr, error);
                                            }
                                            return [2, rr];
                                    }
                                });
                            }); })
                                .catch(function (err) {
                                var body = rtm.getTemplate("httperror").getPlain();
                                var rr = new response_1.Response(body, mycmd, cfg);
                                if (_this.debugMode && _this.logger) {
                                    _this.logger.log(_this.getPOSTData(mycmd, true), rr, err.message);
                                }
                                return err;
                            })];
                }
            });
        });
    };
    APIClient.prototype.requestNextResponsePage = function (rr) {
        return __awaiter(this, void 0, void 0, function () {
            var mycmd, first, total, limit;
            return __generator(this, function (_a) {
                mycmd = rr.getCommand();
                if (Object.prototype.hasOwnProperty.call(mycmd, "LAST")) {
                    throw new Error("Parameter LAST in use. Please remove it to avoid issues in requestNextPage.");
                }
                first = 0;
                if (Object.prototype.hasOwnProperty.call(mycmd, "FIRST")) {
                    first = mycmd.FIRST;
                }
                total = rr.getRecordsTotalCount();
                limit = rr.getRecordsLimitation();
                first += limit;
                if (first < total) {
                    mycmd.FIRST = first;
                    mycmd.LIMIT = limit;
                    return [2, this.request(mycmd)];
                }
                else {
                    return [2, null];
                }
                return [2];
            });
        });
    };
    APIClient.prototype.requestAllResponsePages = function (cmd) {
        return __awaiter(this, void 0, void 0, function () {
            var responses, rr, tmp, idx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        responses = [];
                        return [4, this.request(Object.assign({}, cmd, { FIRST: 0 }))];
                    case 1:
                        rr = _a.sent();
                        tmp = rr;
                        idx = 0;
                        _a.label = 2;
                    case 2:
                        responses[idx++] = tmp;
                        return [4, this.requestNextResponsePage(tmp)];
                    case 3:
                        tmp = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (tmp !== null) return [3, 2];
                        _a.label = 5;
                    case 5: return [2, responses];
                }
            });
        });
    };
    APIClient.prototype.setUserView = function (uid) {
        this.socketConfig.setUser(uid);
        return this;
    };
    APIClient.prototype.resetUserView = function () {
        this.socketConfig.setUser("");
        return this;
    };
    APIClient.prototype.useHighPerformanceConnectionSetup = function () {
        this.setURL(exports.ISPAPI_CONNECTION_URL_PROXY);
        return this;
    };
    APIClient.prototype.useDefaultConnectionSetup = function () {
        this.setURL(exports.ISPAPI_CONNECTION_URL_LIVE);
        return this;
    };
    APIClient.prototype.useOTESystem = function () {
        this.setURL(exports.ISPAPI_CONNECTION_URL_OTE);
        this.socketConfig.setSystemEntity("1234");
        return this;
    };
    APIClient.prototype.useLIVESystem = function () {
        this.setURL(exports.ISPAPI_CONNECTION_URL_LIVE);
        this.socketConfig.setSystemEntity("54cd");
        return this;
    };
    APIClient.prototype.getPOSTData = function (cmd, secured) {
        if (secured === void 0) { secured = false; }
        var data = this.socketConfig.getPOSTData();
        if (secured) {
            data = data.replace(/s_pw=[^&]+/, "s_pw=***");
        }
        var tmp = "";
        if (!(typeof cmd === "string" || cmd instanceof String)) {
            Object.keys(cmd).forEach(function (key) {
                if (cmd[key] !== null && cmd[key] !== undefined) {
                    tmp += "".concat(key, "=").concat(cmd[key].toString().replace(/\r|\n/g, ""), "\n");
                }
            });
        }
        else {
            tmp = "" + cmd;
        }
        if (secured) {
            tmp = tmp.replace(/PASSWORD=[^\n]+/, "PASSWORD=***");
        }
        tmp = tmp.replace(/\n$/, "");
        data += "".concat((0, socketconfig_1.fixedURLEnc)("s_command"), "=").concat((0, socketconfig_1.fixedURLEnc)(tmp));
        return data;
    };
    APIClient.prototype.flattenCommand = function (cmd) {
        var newcmd = {};
        Object.keys(cmd).forEach(function (key) {
            var val = cmd[key];
            var newKey = key.toUpperCase();
            if (val !== null && val !== undefined) {
                if (Array.isArray(val)) {
                    var index = 0;
                    for (var _i = 0, val_1 = val; _i < val_1.length; _i++) {
                        var row = val_1[_i];
                        newcmd["".concat(newKey).concat(index)] = (row + "").replace(/\r|\n/g, "");
                        index++;
                    }
                }
                else {
                    if (typeof val === "string" || val instanceof String) {
                        newcmd[newKey] = val.replace(/\r|\n/g, "");
                    }
                    else {
                        newcmd[newKey] = val;
                    }
                }
            }
        });
        return newcmd;
    };
    APIClient.prototype.autoIDNConvert = function (cmd) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, toconvert, idxs, r, col;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof cmd === "string" ||
                            cmd instanceof String ||
                            /^CONVERTIDN$/i.test(cmd.COMMAND)) {
                            return [2, cmd];
                        }
                        keys = Object.keys(cmd).filter(function (key) {
                            return /^(DOMAIN|NAMESERVER|DNSZONE)([0-9]*)$/i.test(key);
                        });
                        if (!keys.length) {
                            return [2, cmd];
                        }
                        toconvert = [];
                        idxs = [];
                        keys.forEach(function (key) {
                            if (cmd[key] !== null &&
                                cmd[key] !== undefined &&
                                /[^a-z0-9.\- ]/i.test(cmd[key])) {
                                toconvert.push(cmd[key]);
                                idxs.push(key);
                            }
                        });
                        if (!toconvert.length) {
                            return [2, cmd];
                        }
                        return [4, this.request({
                                COMMAND: "ConvertIDN",
                                DOMAIN: toconvert,
                            })];
                    case 1:
                        r = _a.sent();
                        console.dir(r.getPlain());
                        if (r.isSuccess()) {
                            col = r.getColumn("ACE");
                            if (col) {
                                col.getData().forEach(function (pc, idx) {
                                    cmd[idxs[idx]] = pc;
                                });
                            }
                        }
                        return [2, cmd];
                }
            });
        });
    };
    APIClient.socketTimeout = 300000;
    return APIClient;
}());
exports.APIClient = APIClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxpRUFBMEM7QUFDMUMsbUNBQWtDO0FBQ2xDLHVDQUFzQztBQUN0QyxxRUFBb0U7QUFDcEUsK0NBQTJEO0FBRTlDLFFBQUEsMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDOUQsUUFBQSwwQkFBMEIsR0FBRyxxQ0FBcUMsQ0FBQztBQUNuRSxRQUFBLHlCQUF5QixHQUNwQyx5Q0FBeUMsQ0FBQztBQUU1QyxJQUFNLEdBQUcsR0FBRyxpREFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUtsRDtJQThCRTtRQUNFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQ0FBMEIsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSwyQkFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFPTSxtQ0FBZSxHQUF0QixVQUF1QixZQUFvQjtRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFLTSxvQ0FBZ0IsR0FBdkI7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZUFBTSxFQUFFLENBQUM7UUFDM0IsT0FBTyxJQUFJ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Im5vZGUtZmV0Y2hcIjtcblxuaW1wb3J0IHBhY2thZ2VJbmZvIGZyb20gXCIuLi9wYWNrYWdlLmpzb25cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xuaW1wb3J0IHsgUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZVwiO1xuaW1wb3J0IHsgUmVzcG9uc2VUZW1wbGF0ZU1hbmFnZXIgfSBmcm9tIFwiLi9yZXNwb25zZXRlbXBsYXRlbWFuYWdlclwiO1xuaW1wb3J0IHsgZml4ZWRVUkxFbmMsIFNvY2tldENvbmZpZyB9IGZyb20gXCIuL3NvY2tldGNvbmZpZ1wiO1xuXG5leHBvcnQgY29uc3QgSVNQQVBJX0NPTk5FQ1RJT05fVVJMX1BST1hZID0gXCJodHRwOi8vMTI3LjAuMC4xL2FwaS9jYWxsLmNnaVwiO1xuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9MSVZFID0gXCJodHRwczovL2FwaS5pc3BhcGkubmV0L2FwaS9jYWxsLmNnaVwiO1xuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9PVEUgPVxuICBcImh0dHBzOi8vYXBpLW90ZS5pc3BhcGkubmV0L2FwaS9jYWxsLmNnaVwiO1xuXG5jb25zdCBydG0gPSBSZXNwb25zZVRlbXBsYXRlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIEFQSUNsaWVudCBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgQVBJQ2xpZW50IHtcbiAgLyoqXG4gICAqIEFQSSBjb25uZWN0aW9uIHRpbWVvdXQgc2V0dGluZ1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBzb2NrZXRUaW1lb3V0OiBudW1iZXIgPSAzMDAwMDA7XG4gIC8qKlxuICAgKiBVc2VyIEFnZW50IHN0cmluZ1xuICAgKi9cbiAgcHJpdmF0ZSB1YTogc3RyaW5nO1xuICAvKipcbiAgICogQVBJIGNvbm5lY3Rpb24gdXJsXG4gICAqL1xuICBwcml2YXRlIHNvY2tldFVSTDogc3RyaW5nO1xuICAvKipcbiAgICogT2JqZWN0IGNvdmVyaW5nIEFQSSBjb25uZWN0aW9uIGRhdGFcbiAgICovXG4gIHByaXZhdGUgc29ja2V0Q29uZmlnOiBTb2NrZXRDb25maWc7XG4gIC8qKlxuICAgKiBhY3Rpdml0eSBmbGFnIGZvciBkZWJ1ZyBtb2RlXG4gICAqL1xuICBwcml2YXRlIGRlYnVnTW9kZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIGFkZGl0aW9uYWwgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgKi9cbiAgcHJpdmF0ZSBjdXJsb3B0czogYW55O1xuICAvKipcbiAgICogbG9nZ2VyIGZ1bmN0aW9uIGZvciBkZWJ1ZyBtb2RlXG4gICAqL1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyIHwgbnVsbDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy51YSA9IFwiXCI7XG4gICAgdGhpcy5zb2NrZXRVUkwgPSBcIlwiO1xuICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX0xJVkUpO1xuICAgIHRoaXMuc29ja2V0Q29uZmlnID0gbmV3IFNvY2tldENvbmZpZygpO1xuICAgIHRoaXMudXNlTElWRVN5c3RlbSgpO1xuICAgIHRoaXMuY3VybG9wdHMgPSB7fTtcbiAgICB0aGlzLmxvZ2dlciA9IG51bGw7XG4gICAgdGhpcy5zZXREZWZhdWx0TG9nZ2VyKCk7XG4gIH1cblxuICAvKipcbiAgICogc2V0IGN1c3RvbSBsb2dnZXIgdG8gdXNlIGluc3RlYWQgb2YgZGVmYXVsdCBvbmVcbiAgICogQHBhcmFtIGN1c3RvbUxvZ2dlclxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0Q3VzdG9tTG9nZ2VyKGN1c3RvbUxvZ2dlcjogTG9nZ2VyKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmxvZ2dlciA9IGN1c3RvbUxvZ2dlcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogc2V0IGRlZmF1bHQgbG9nZ2VyIHRvIHVzZVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0RGVmYXVsdExvZ2dlcigpOiBBUElDbGllbnQge1xuICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBFbmFibGUgRGVidWcgT3V0cHV0IHRvIFNURE9VVFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgZW5hYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5kZWJ1Z01vZGUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2FibGUgRGVidWcgT3V0cHV0XG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBkaXNhYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5kZWJ1Z01vZGUgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIEFQSSBTZXNzaW9uIHRoYXQgaXMgY3VycmVudGx5IHNldFxuICAgKiBAcmV0dXJucyBBUEkgU2Vzc2lvbiBvciBudWxsXG4gICAqL1xuICBwdWJsaWMgZ2V0U2Vzc2lvbigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBzZXNzaWQgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCk7XG4gICAgcmV0dXJuIHNlc3NpZCA9PT0gXCJcIiA/IG51bGwgOiBzZXNzaWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBBUEkgY29ubmVjdGlvbiB1cmwgdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAqIEByZXR1cm5zIEFQSSBjb25uZWN0aW9uIHVybCBjdXJyZW50bHkgaW4gdXNlXG4gICAqL1xuICBwdWJsaWMgZ2V0VVJMKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0VVJMO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvc3NpYmlsaXR5IHRvIGN1c3RvbWl6ZSBkZWZhdWx0IHVzZXIgYWdlbnQgdG8gZml0IHlvdXIgbmVlZHNcbiAgICogQHBhcmFtIHN0ciB1c2VyIGFnZW50IGxhYmVsXG4gICAqIEBwYXJhbSBydiByZXZpc2lvbiBvZiB1c2VyIGFnZW50XG4gICAqIEBwYXJhbSBtb2R1bGVzIGZ1cnRoZXIgbW9kdWxlcyB0byBhZGQgdG8gdXNlciBhZ2VudCBzdHJpbmcsIGZvcm1hdDogW1wiPG1vZDE+LzxyZXY+XCIsIFwiPG1vZDI+LzxyZXY+XCIsIC4uLiBdXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRVc2VyQWdlbnQoc3RyOiBzdHJpbmcsIHJ2OiBzdHJpbmcsIG1vZHVsZXM6IGFueSA9IFtdKTogQVBJQ2xpZW50IHtcbiAgICBjb25zdCBtb2RzID0gbW9kdWxlcy5sZW5ndGggPyBcIiBcIiArIG1vZHVsZXMuam9pbihcIiBcIikgOiBcIlwiO1xuICAgIHRoaXMudWEgPVxuICAgICAgYCR7c3RyfSBgICtcbiAgICAgIGAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgJHtwcm9jZXNzLmFyY2h9OyBydjoke3J2fSlgICtcbiAgICAgIG1vZHMgK1xuICAgICAgYCBub2RlLXNkay8ke3RoaXMuZ2V0VmVyc2lvbigpfSBgICtcbiAgICAgIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWA7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBVc2VyIEFnZW50XG4gICAqIEByZXR1cm5zIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnVhLmxlbmd0aCkge1xuICAgICAgdGhpcy51YSA9XG4gICAgICAgIGBOT0RFLVNESyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgJHtcbiAgICAgICAgICBwcm9jZXNzLmFyY2hcbiAgICAgICAgfTsgcnY6JHt0aGlzLmdldFZlcnNpb24oKX0pIGAgKyBgbm9kZS8ke3Byb2Nlc3MudmVyc2lvbn1gO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHByb3h5IHNlcnZlciB0byB1c2UgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSBwcm94eSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBjb21tdW5pY2F0aW9cbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFByb3h5KHByb3h5OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuY3VybG9wdHMucHJveHkgPSBwcm94eTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHByb3h5IHNlcnZlciBjb25maWd1cmF0aW9uXG4gICAqIEByZXR1cm5zIHByb3h5IHNlcnZlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgKi9cbiAgcHVibGljIGdldFByb3h5KCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJwcm94eVwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucHJveHk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgcmVmZXJlciB0byB1c2UgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSByZWZlcmVyIFJlZmVyZXJcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFJlZmVyZXIocmVmZXJlcjogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmN1cmxvcHRzLnJlZmVyZXIgPSByZWZlcmVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcmVmZXJlciBjb25maWd1cmF0aW9uXG4gICAqIEByZXR1cm5zIHJlZmVyZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICovXG4gIHB1YmxpYyBnZXRSZWZlcmVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJyZWZlcmVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJsb3B0cy5yZWZlcmVyO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgbW9kdWxlIHZlcnNpb25cbiAgICogQHJldHVybnMgbW9kdWxlIHZlcnNpb25cbiAgICovXG4gIHB1YmxpYyBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhY2thZ2VJbmZvLnZlcnNpb247XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgc2Vzc2lvbiBkYXRhIChzZXNzaW9uIGlkIGFuZCBzeXN0ZW0gZW50aXR5KSB0byBnaXZlbiBjbGllbnQgcmVxdWVzdCBzZXNzaW9uXG4gICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2F2ZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICBzZXNzaW9uLnNvY2tldGNmZyA9IHtcbiAgICAgIGVudGl0eTogdGhpcy5zb2NrZXRDb25maWcuZ2V0U3lzdGVtRW50aXR5KCksXG4gICAgICBzZXNzaW9uOiB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCksXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgZXhpc3RpbmcgY29uZmlndXJhdGlvbiBvdXQgb2YgQ2xpZW50UmVxdWVzdCBzZXNzaW9uXG4gICAqIHRvIHJlYnVpbGQgYW5kIHJldXNlIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICogQHBhcmFtIHNlc3Npb24gQ2xpZW50UmVxdWVzdCBzZXNzaW9uIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyByZXVzZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoc2Vzc2lvbi5zb2NrZXRjZmcuZW50aXR5KTtcbiAgICB0aGlzLnNldFNlc3Npb24oc2Vzc2lvbi5zb2NrZXRjZmcuc2Vzc2lvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFub3RoZXIgY29ubmVjdGlvbiB1cmwgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHZhbHVlIEFQSSBjb25uZWN0aW9uIHVybCB0byBzZXRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFVSTCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldFVSTCA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBvbmUgdGltZSBwYXNzd29yZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdmFsdWUgb25lIHRpbWUgcGFzc3dvcmRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldE9UUCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRPVFAodmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbiBBUEkgc2Vzc2lvbiBpZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdmFsdWUgQVBJIHNlc3Npb24gaWRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFNlc3Npb24odmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U2Vzc2lvbih2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFuIFJlbW90ZSBJUCBBZGRyZXNzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIFRvIGJlIHVzZWQgaW4gY2FzZSB5b3UgaGF2ZSBhbiBhY3RpdmUgaXAgZmlsdGVyIHNldHRpbmcuXG4gICAqIEBwYXJhbSB2YWx1ZSBSZW1vdGUgSVAgQWRkcmVzc1xuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0UmVtb3RlSVBBZGRyZXNzKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFJlbW90ZUFkZHJlc3ModmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgKiBAcGFyYW0gcHcgYWNjb3VudCBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0Q3JlZGVudGlhbHModWlkOiBzdHJpbmcsIHB3OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldExvZ2luKHVpZCk7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UGFzc3dvcmQocHcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgKiBAcGFyYW0gcm9sZSByb2xlIHVzZXIgaWRcbiAgICogQHBhcmFtIHB3IHJvbGUgdXNlciBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0Um9sZUNyZWRlbnRpYWxzKHVpZDogc3RyaW5nLCByb2xlOiBzdHJpbmcsIHB3OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHJldHVybiB0aGlzLnNldENyZWRlbnRpYWxzKHJvbGUgPyBgJHt1aWR9ISR7cm9sZX1gIDogdWlkLCBwdyk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBBUEkgbG9naW4gdG8gc3RhcnQgc2Vzc2lvbi1iYXNlZCBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSBvdHAgb3B0aW9uYWwgb25lIHRpbWUgcGFzc3dvcmRcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBsb2dpbihvdHAgPSBcIlwiKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHRoaXMuc2V0T1RQKG90cCB8fCBcIlwiKTtcbiAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7IENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIgfSk7XG4gICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICBjb25zdCBjb2wgPSByci5nZXRDb2x1bW4oXCJTRVNTSU9OXCIpO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uKGNvbCA/IGNvbC5nZXREYXRhKClbMF0gOiBcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJyO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gQVBJIGxvZ2luIHRvIHN0YXJ0IHNlc3Npb24tYmFzZWQgY29tbXVuaWNhdGlvbi5cbiAgICogVXNlIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHBhcmFtcyBnaXZlbiBzcGVjaWZpYyBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGxvZ2luRXh0ZW5kZWQocGFyYW1zOiBhbnksIG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgdGhpcy5zZXRPVFAob3RwKTtcbiAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICBDT01NQU5EOiBcIlN0YXJ0U2Vzc2lvblwiLFxuICAgICAgICB9LFxuICAgICAgICBwYXJhbXNcbiAgICAgIClcbiAgICApO1xuICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgfVxuICAgIHJldHVybiBycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIEFQSSBsb2dvdXQgdG8gY2xvc2UgQVBJIHNlc3Npb24gaW4gdXNlXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgbG9nb3V0KCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICBDT01NQU5EOiBcIkVuZFNlc3Npb25cIixcbiAgICB9KTtcbiAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgIHRoaXMuc2V0U2Vzc2lvbihcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJyO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gQVBJIHJlcXVlc3QgdXNpbmcgdGhlIGdpdmVuIGNvbW1hbmRcbiAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byByZXF1ZXN0XG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcmVxdWVzdChjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAvLyBmbGF0dGVuIG5lc3RlZCBhcGkgY29tbWFuZCBidWxrIHBhcmFtZXRlcnNcbiAgICBsZXQgbXljbWQgPSB0aGlzLmZsYXR0ZW5Db21tYW5kKGNtZCk7XG5cbiAgICAvLyBhdXRvIGNvbnZlcnQgdW1sYXV0IG5hbWVzIHRvIHB1bnljb2RlXG4gICAgbXljbWQgPSBhd2FpdCB0aGlzLmF1dG9JRE5Db252ZXJ0KG15Y21kKTtcblxuICAgIC8vIHJlcXVlc3QgY29tbWFuZCB0byBBUElcbiAgICBjb25zdCBjZmc6IGFueSA9IHtcbiAgICAgIENPTk5FQ1RJT05fVVJMOiB0aGlzLnNvY2tldFVSTCxcbiAgICB9O1xuICAgIC8vIFRPRE86IDMwMHMgKHRvIGJlIHN1cmUgdG8gZ2V0IGFuIEFQSSByZXNwb25zZSlcbiAgICBjb25zdCByZXFDZmc6IGFueSA9IHtcbiAgICAgIC8vZW5jb2Rpbmc6IFwidXRmOFwiLCAvL2RlZmF1bHQgZm9yIHR5cGUgc3RyaW5nXG4gICAgICAvL2d6aXA6IHRydWUsXG4gICAgICBib2R5OiB0aGlzLmdldFBPU1REYXRhKG15Y21kKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJVc2VyLUFnZW50XCI6IHRoaXMuZ2V0VXNlckFnZW50KCksXG4gICAgICB9LFxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIHRpbWVvdXQ6IEFQSUNsaWVudC5zb2NrZXRUaW1lb3V0LFxuICAgICAgdXJsOiBjZmcuQ09OTkVDVElPTl9VUkwsXG4gICAgfTtcbiAgICBjb25zdCBwcm94eSA9IHRoaXMuZ2V0UHJveHkoKTtcbiAgICBpZiAocHJveHkpIHtcbiAgICAgIHJlcUNmZy5wcm94eSA9IHByb3h5O1xuICAgIH1cbiAgICBjb25zdCByZWZlcmVyID0gdGhpcy5nZXRSZWZlcmVyKCk7XG4gICAgaWYgKHJlZmVyZXIpIHtcbiAgICAgIHJlcUNmZy5oZWFkZXJzLlJlZmVyZXIgPSByZWZlcmVyO1xuICAgIH1cblxuICAgIGNvbnN0IF9pbXBvcnREeW5hbWljID0gbmV3IEZ1bmN0aW9uKFxuICAgICAgXCJtb2R1bGVQYXRoXCIsXG4gICAgICBcInJldHVybiBpbXBvcnQobW9kdWxlUGF0aClcIlxuICAgICk7XG5cbiAgICBhc3luYyBmdW5jdGlvbiBmZXRjaCh1cmw6IFJlcXVlc3RJbmZvLCBpbml0PzogUmVxdWVzdEluaXQpIHtcbiAgICAgIGNvbnN0IHsgZGVmYXVsdDogZmV0Y2ggfSA9IGF3YWl0IF9pbXBvcnREeW5hbWljKFwibm9kZS1mZXRjaFwiKTtcbiAgICAgIHJldHVybiBmZXRjaCh1cmwsIGluaXQpO1xuICAgIH1cblxuICAgIHJldHVybiBmZXRjaChjZmcuQ09OTkVDVElPTl9VUkwsIHJlcUNmZylcbiAgICAgIC50aGVuKGFzeW5jIChyZXM6IGFueSkgPT4ge1xuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBsZXQgYm9keTtcbiAgICAgICAgaWYgKHJlcy5vaykge1xuICAgICAgICAgIC8vIHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDBcbiAgICAgICAgICBib2R5ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlcnJvciA9IHJlcy5zdGF0dXMgKyAocmVzLnN0YXR1c1RleHQgPyBcIiBcIiArIHJlcy5zdGF0dXNUZXh0IDogXCJcIik7XG4gICAgICAgICAgYm9keSA9IHJ0bS5nZXRUZW1wbGF0ZShcImh0dHBlcnJvclwiKS5nZXRQbGFpbigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJyID0gbmV3IFJlc3BvbnNlKGJvZHksIG15Y21kLCBjZmcpO1xuICAgICAgICBpZiAodGhpcy5kZWJ1Z01vZGUgJiYgdGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2codGhpcy5nZXRQT1NURGF0YShteWNtZCwgdHJ1ZSksIHJyLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBydG0uZ2V0VGVtcGxhdGUoXCJodHRwZXJyb3JcIikuZ2V0UGxhaW4oKTtcbiAgICAgICAgY29uc3QgcnIgPSBuZXcgUmVzcG9uc2UoYm9keSwgbXljbWQsIGNmZyk7XG4gICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0aGUgbmV4dCBwYWdlIG9mIGxpc3QgZW50cmllcyBmb3IgdGhlIGN1cnJlbnQgbGlzdCBxdWVyeVxuICAgKiBVc2VmdWwgZm9yIHRhYmxlc1xuICAgKiBAcGFyYW0gcnIgQVBJIFJlc3BvbnNlIG9mIGN1cnJlbnQgcGFnZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZSBvciBudWxsIGluIGNhc2UgdGhlcmUgYXJlIG5vIGZ1cnRoZXIgbGlzdCBlbnRyaWVzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcmVxdWVzdE5leHRSZXNwb25zZVBhZ2UocnI6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZSB8IG51bGw+IHtcbiAgICBjb25zdCBteWNtZCA9IHJyLmdldENvbW1hbmQoKTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkxBU1RcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJQYXJhbWV0ZXIgTEFTVCBpbiB1c2UuIFBsZWFzZSByZW1vdmUgaXQgdG8gYXZvaWQgaXNzdWVzIGluIHJlcXVlc3ROZXh0UGFnZS5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgbGV0IGZpcnN0ID0gMDtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkZJUlNUXCIpKSB7XG4gICAgICBmaXJzdCA9IG15Y21kLkZJUlNUO1xuICAgIH1cbiAgICBjb25zdCB0b3RhbCA9IHJyLmdldFJlY29yZHNUb3RhbENvdW50KCk7XG4gICAgY29uc3QgbGltaXQgPSByci5nZXRSZWNvcmRzTGltaXRhdGlvbigpO1xuICAgIGZpcnN0ICs9IGxpbWl0O1xuICAgIGlmIChmaXJzdCA8IHRvdGFsKSB7XG4gICAgICBteWNtZC5GSVJTVCA9IGZpcnN0O1xuICAgICAgbXljbWQuTElNSVQgPSBsaW1pdDtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QobXljbWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCBhbGwgcGFnZXMvZW50cmllcyBmb3IgdGhlIGdpdmVuIHF1ZXJ5IGNvbW1hbmRcbiAgICogQHBhcmFtIGNtZCBBUEkgbGlzdCBjb21tYW5kIHRvIHVzZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFycmF5IG9mIEFQSSBSZXNwb25zZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0QWxsUmVzcG9uc2VQYWdlcyhjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2VbXT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlczogUmVzcG9uc2VbXSA9IFtdO1xuICAgIGNvbnN0IHJyOiBSZXNwb25zZSA9IGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIGNtZCwgeyBGSVJTVDogMCB9KVxuICAgICk7XG4gICAgbGV0IHRtcDogUmVzcG9uc2UgfCBudWxsID0gcnI7XG4gICAgbGV0IGlkeCA9IDA7XG4gICAgZG8ge1xuICAgICAgcmVzcG9uc2VzW2lkeCsrXSA9IHRtcDtcbiAgICAgIHRtcCA9IGF3YWl0IHRoaXMucmVxdWVzdE5leHRSZXNwb25zZVBhZ2UodG1wKTtcbiAgICB9IHdoaWxlICh0bXAgIT09IG51bGwpO1xuICAgIHJldHVybiByZXNwb25zZXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgZGF0YSB2aWV3IHRvIGEgZ2l2ZW4gc3VidXNlclxuICAgKiBAcGFyYW0gdWlkIHN1YnVzZXIgYWNjb3VudCBuYW1lXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRVc2VyVmlldyh1aWQ6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcih1aWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGRhdGEgdmlldyBiYWNrIGZyb20gc3VidXNlciB0byB1c2VyXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyByZXNldFVzZXJWaWV3KCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcihcIlwiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBIaWdoIFBlcmZvcm1hbmNlIENvbm5lY3Rpb24gU2V0dXBcbiAgICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vaGV4b25ldC9ub2RlLXNkay9ibG9iL21hc3Rlci9SRUFETUUubWRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHVzZUhpZ2hQZXJmb3JtYW5jZUNvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgRGVmYXVsdCBDb25uZWN0aW9uIFNldHVwICh0aGUgZGVmYXVsdClcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHVzZURlZmF1bHRDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfTElWRSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE9UJkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgdXNlT1RFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX09URSk7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiMTIzNFwiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgTElWRSBTeXN0ZW0gZm9yIEFQSSBjb21tdW5pY2F0aW9uICh0aGlzIGlzIHRoZSBkZWZhdWx0IHNldHRpbmcpXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyB1c2VMSVZFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX0xJVkUpO1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShcIjU0Y2RcIik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIGdpdmVuIGNvbW1hbmQgZm9yIFBPU1QgcmVxdWVzdCBpbmNsdWRpbmcgY29ubmVjdGlvbiBjb25maWd1cmF0aW9uIGRhdGFcbiAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byBlbmNvZGVcbiAgICogQHJldHVybnMgZW5jb2RlZCBQT1NUIGRhdGEgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgZ2V0UE9TVERhdGEoY21kOiBhbnksIHNlY3VyZWQgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgbGV0IGRhdGEgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRQT1NURGF0YSgpO1xuICAgIGlmIChzZWN1cmVkKSB7XG4gICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9zX3B3PVteJl0rLywgXCJzX3B3PSoqKlwiKTtcbiAgICB9XG5cbiAgICBsZXQgdG1wID0gXCJcIjtcbiAgICBpZiAoISh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0bXAgKz0gYCR7a2V5fT0ke2NtZFtrZXldLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKX1cXG5gO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wID0gXCJcIiArIGNtZDtcbiAgICB9XG4gICAgaWYgKHNlY3VyZWQpIHtcbiAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9QQVNTV09SRD1bXlxcbl0rLywgXCJQQVNTV09SRD0qKipcIik7XG4gICAgfVxuICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9cXG4kLywgXCJcIik7XG4gICAgZGF0YSArPSBgJHtmaXhlZFVSTEVuYyhcInNfY29tbWFuZFwiKX09JHtmaXhlZFVSTEVuYyh0bXApfWA7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbiBuZXN0ZWQgYXJyYXlzIGluIGNvbW1hbmRcbiAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgKiBAcmV0dXJucyBhcGkgY29tbWFuZCB3aXRoIGZsYXR0ZW5kZWQgcGFyYW1ldGVyc1xuICAgKi9cbiAgcHJpdmF0ZSBmbGF0dGVuQ29tbWFuZChjbWQ6IGFueSk6IGFueSB7XG4gICAgY29uc3QgbmV3Y21kOiBhbnkgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjbWQpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCB2YWwgPSBjbWRba2V5XTtcbiAgICAgIGNvbnN0IG5ld0tleSA9IGtleS50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB2YWwpIHtcbiAgICAgICAgICAgIG5ld2NtZFtgJHtuZXdLZXl9JHtpbmRleH1gXSA9IChyb3cgKyBcIlwiKS5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgICAgICBuZXdjbWRbbmV3S2V5XSA9IHZhbC5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdjbWRbbmV3S2V5XSA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3Y21kO1xuICB9XG5cbiAgLyoqXG4gICAqIEF1dG8gY29udmVydCBBUEkgY29tbWFuZCBwYXJhbWV0ZXJzIHRvIHB1bnljb2RlLCBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBhcGkgY29tbWFuZCB3aXRoIElETiB2YWx1ZXMgcmVwbGFjZWQgdG8gcHVueWNvZGVcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgYXV0b0lETkNvbnZlcnQoY21kOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIGRvbid0IGNvbnZlcnQgZm9yIGNvbnZlcnRpZG4gY29tbWFuZCB0byBhdm9pZCBlbmRsZXNzIGxvb3BcbiAgICAvLyBhbmQgaWdub3JlIGNvbW1hbmRzIGluIHN0cmluZyBmb3JtYXQgKGV2ZW4gZGVwcmVjYXRlZClcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8XG4gICAgICBjbWQgaW5zdGFuY2VvZiBTdHJpbmcgfHxcbiAgICAgIC9eQ09OVkVSVElETiQvaS50ZXN0KGNtZC5DT01NQU5EKVxuICAgICkge1xuICAgICAgcmV0dXJuIGNtZDtcbiAgICB9XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNtZCkuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgIHJldHVybiAvXihET01BSU58TkFNRVNFUlZFUnxETlNaT05FKShbMC05XSopJC9pLnRlc3Qoa2V5KTtcbiAgICB9KTtcbiAgICBpZiAoIWtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY21kO1xuICAgIH1cbiAgICBjb25zdCB0b2NvbnZlcnQ6IGFueSA9IFtdO1xuICAgIGNvbnN0IGlkeHM6IHN0cmluZ1tdID0gW107XG4gICAga2V5cy5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBjbWRba2V5XSAhPT0gbnVsbCAmJlxuICAgICAgICBjbWRba2V5XSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIC9bXmEtejAtOS5cXC0gXS9pLnRlc3QoY21kW2tleV0pXG4gICAgICApIHtcbiAgICAgICAgdG9jb252ZXJ0LnB1c2goY21kW2tleV0pO1xuICAgICAgICBpZHhzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghdG9jb252ZXJ0Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNtZDtcbiAgICB9XG4gICAgY29uc3QgciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICBDT01NQU5EOiBcIkNvbnZlcnRJRE5cIixcbiAgICAgIERPTUFJTjogdG9jb252ZXJ0LFxuICAgIH0pO1xuICAgIGNvbnNvbGUuZGlyKHIuZ2V0UGxhaW4oKSk7XG4gICAgaWYgKHIuaXNTdWNjZXNzKCkpIHtcbiAgICAgIGNvbnN0IGNvbCA9IHIuZ2V0Q29sdW1uKFwiQUNFXCIpO1xuICAgICAgaWYgKGNvbCkge1xuICAgICAgICBjb2wuZ2V0RGF0YSgpLmZvckVhY2goKHBjOiBzdHJpbmcsIGlkeDogYW55KSA9PiB7XG4gICAgICAgICAgY21kW2lkeHNbaWR4XV0gPSBwYztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbWQ7XG4gIH1cbn1cbiJdfQ==