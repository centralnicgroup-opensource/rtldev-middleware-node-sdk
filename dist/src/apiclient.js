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
var package_json_1 = __importDefault(require("../package.json"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var logger_1 = require("./logger");
var response_1 = require("./response");
var responsetemplatemanager_1 = require("./responsetemplatemanager");
var socketconfig_1 = require("./socketconfig");
exports.ISPAPI_CONNECTION_URL_PROXY = "http://127.0.0.1/api/call.cgi";
exports.ISPAPI_CONNECTION_URL = "https://api.ispapi.net/api/call.cgi";
var rtm = responsetemplatemanager_1.ResponseTemplateManager.getInstance();
var APIClient = (function () {
    function APIClient() {
        this.ua = "";
        this.socketURL = "";
        this.debugMode = false;
        this.setURL(exports.ISPAPI_CONNECTION_URL);
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
        return (sessid === "") ? null : sessid;
    };
    APIClient.prototype.getURL = function () {
        return this.socketURL;
    };
    APIClient.prototype.setUserAgent = function (str, rv, modules) {
        if (modules === void 0) { modules = []; }
        var mods = modules.length ? " " + modules.join(" ") : "";
        this.ua = (str + " " +
            ("(" + process.platform + "; " + process.arch + "; rv:" + rv + ")") +
            mods +
            (" node-sdk/" + this.getVersion() + " ") +
            ("node/" + process.version));
        return this;
    };
    APIClient.prototype.getUserAgent = function () {
        if (!this.ua.length) {
            this.ua = ("NODE-SDK (" + process.platform + "; " + process.arch + "; rv:" + this.getVersion() + ") " +
                ("node/" + process.version));
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
        return this.setCredentials(role ? uid + "!" + role : uid, pw);
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
            var mycmd, cfg, reqCfg, proxy, referer;
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
                        return [2, node_fetch_1.default(cfg.CONNECTION_URL, reqCfg).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
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
                                            error = new Error(res.status + (res.statusText ? " " + res.statusText : ""));
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
                            }); })];
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
        this.setURL(exports.ISPAPI_CONNECTION_URL);
        return this;
    };
    APIClient.prototype.useOTESystem = function () {
        this.socketConfig.setSystemEntity("1234");
        return this;
    };
    APIClient.prototype.useLIVESystem = function () {
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
                    tmp += key + "=" + cmd[key].toString().replace(/\r|\n/g, "") + "\n";
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
        data += socketconfig_1.fixedURLEnc("s_command") + "=" + socketconfig_1.fixedURLEnc(tmp);
        return data;
    };
    APIClient.prototype.toUpperCaseKeys = function (cmd) {
        var newcmd = {};
        Object.keys(cmd).forEach(function (k) {
            newcmd[k.toUpperCase()] = cmd[k];
        });
        return newcmd;
    };
    APIClient.prototype.flattenCommand = function (cmd) {
        var mycmd = this.toUpperCaseKeys(cmd);
        var newcmd = {};
        Object.keys(mycmd).forEach(function (key) {
            var val = mycmd[key];
            if (val !== null && val !== undefined) {
                if (Array.isArray(val)) {
                    var index = 0;
                    for (var _i = 0, val_1 = val; _i < val_1.length; _i++) {
                        var row = val_1[_i];
                        newcmd["" + key + index] = (row + "").replace(/\r|\n/g, "");
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
    };
    APIClient.prototype.autoIDNConvert = function (cmd) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, toconvert, idxs, r, col;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof cmd === "string" || cmd instanceof String || /^CONVERTIDN$/i.test(cmd.COMMAND)) {
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
                            if (cmd[key] !== null && cmd[key] !== undefined && /[^a-z0-9.\- ]/i.test(cmd[key])) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUEwQztBQUMxQywwREFBK0I7QUFDL0IsbUNBQWtDO0FBQ2xDLHVDQUFzQztBQUN0QyxxRUFBb0U7QUFDcEUsK0NBQTJEO0FBRTlDLFFBQUEsMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDOUQsUUFBQSxxQkFBcUIsR0FBRyxxQ0FBcUMsQ0FBQztBQUUzRSxJQUFNLEdBQUcsR0FBRyxpREFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUtsRDtJQThCSTtRQUNJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBcUIsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSwyQkFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFPTSxtQ0FBZSxHQUF0QixVQUF1QixZQUFvQjtRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS00sb0NBQWdCLEdBQXZCO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLTSxt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LEVBQUUsQ0FBQyxDQUFDO3dCQUMxQixJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTs0QkFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDL0IsSUFBSSxHQUFHLEVBQUU7Z0NBQ0wsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQVUsRUFBRSxHQUFRO29DQUN2QyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dDQUN4QixDQUFDLENBQUMsQ0FBQzs2QkFDTjt5QkFDSjt3QkFDRCxXQUFPLEdBQUcsRUFBQzs7OztLQUNkO0lBamtCc0IsdUJBQWEsR0FBVyxNQUFNLENBQUM7SUFra0IxRCxnQkFBQztDQUFBLEFBdGtCRCxJQXNrQkM7QUF0a0JZLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhY2thZ2VJbmZvIGZyb20gXCIuLi9wYWNrYWdlLmpzb25cIjtcbmltcG9ydCBmZXRjaCBmcm9tIFwibm9kZS1mZXRjaFwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XG5pbXBvcnQgeyBSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5pbXBvcnQgeyBSZXNwb25zZVRlbXBsYXRlTWFuYWdlciB9IGZyb20gXCIuL3Jlc3BvbnNldGVtcGxhdGVtYW5hZ2VyXCI7XG5pbXBvcnQgeyBmaXhlZFVSTEVuYywgU29ja2V0Q29uZmlnIH0gZnJvbSBcIi4vc29ja2V0Y29uZmlnXCI7XG5cbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkxfUFJPWFkgPSBcImh0dHA6Ly8xMjcuMC4wLjEvYXBpL2NhbGwuY2dpXCI7XG5leHBvcnQgY29uc3QgSVNQQVBJX0NPTk5FQ1RJT05fVVJMID0gXCJodHRwczovL2FwaS5pc3BhcGkubmV0L2FwaS9jYWxsLmNnaVwiO1xuXG5jb25zdCBydG0gPSBSZXNwb25zZVRlbXBsYXRlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIEFQSUNsaWVudCBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgQVBJQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBBUEkgY29ubmVjdGlvbiB0aW1lb3V0IHNldHRpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHNvY2tldFRpbWVvdXQ6IG51bWJlciA9IDMwMDAwMDtcbiAgICAvKipcbiAgICAgKiBVc2VyIEFnZW50IHN0cmluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgdWE6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBBUEkgY29ubmVjdGlvbiB1cmxcbiAgICAgKi9cbiAgICBwcml2YXRlIHNvY2tldFVSTDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIE9iamVjdCBjb3ZlcmluZyBBUEkgY29ubmVjdGlvbiBkYXRhXG4gICAgICovXG4gICAgcHJpdmF0ZSBzb2NrZXRDb25maWc6IFNvY2tldENvbmZpZztcbiAgICAvKipcbiAgICAgKiBhY3Rpdml0eSBmbGFnIGZvciBkZWJ1ZyBtb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWJ1Z01vZGU6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogYWRkaXRpb25hbCBjb25uZWN0aW9uIHNldHRpbmdzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjdXJsb3B0czogYW55O1xuICAgIC8qKlxuICAgICAqIGxvZ2dlciBmdW5jdGlvbiBmb3IgZGVidWcgbW9kZVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIgfCBudWxsO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnVhID0gXCJcIjtcbiAgICAgICAgdGhpcy5zb2NrZXRVUkwgPSBcIlwiO1xuICAgICAgICB0aGlzLmRlYnVnTW9kZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkwpO1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZyA9IG5ldyBTb2NrZXRDb25maWcoKTtcbiAgICAgICAgdGhpcy51c2VMSVZFU3lzdGVtKCk7XG4gICAgICAgIHRoaXMuY3VybG9wdHMgPSB7fTtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnNldERlZmF1bHRMb2dnZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXQgY3VzdG9tIGxvZ2dlciB0byB1c2UgaW5zdGVhZCBvZiBkZWZhdWx0IG9uZVxuICAgICAqIEBwYXJhbSBjdXN0b21Mb2dnZXJcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldEN1c3RvbUxvZ2dlcihjdXN0b21Mb2dnZXI6IExvZ2dlcik6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMubG9nZ2VyID0gY3VzdG9tTG9nZ2VyO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogc2V0IGRlZmF1bHQgbG9nZ2VyIHRvIHVzZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RGVmYXVsdExvZ2dlcigpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVuYWJsZSBEZWJ1ZyBPdXRwdXQgdG8gU1RET1VUXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBlbmFibGVEZWJ1Z01vZGUoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5kZWJ1Z01vZGUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlIERlYnVnIE91dHB1dFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgZGlzYWJsZURlYnVnTW9kZSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmRlYnVnTW9kZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEFQSSBTZXNzaW9uIHRoYXQgaXMgY3VycmVudGx5IHNldFxuICAgICAqIEByZXR1cm5zIEFQSSBTZXNzaW9uIG9yIG51bGxcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2Vzc2lvbigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgY29uc3Qgc2Vzc2lkID0gdGhpcy5zb2NrZXRDb25maWcuZ2V0U2Vzc2lvbigpO1xuICAgICAgICByZXR1cm4gKHNlc3NpZCA9PT0gXCJcIikgPyBudWxsIDogc2Vzc2lkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgQVBJIGNvbm5lY3Rpb24gdXJsIHRoYXQgaXMgY3VycmVudGx5IHNldFxuICAgICAqIEByZXR1cm5zIEFQSSBjb25uZWN0aW9uIHVybCBjdXJyZW50bHkgaW4gdXNlXG4gICAgICovXG4gICAgcHVibGljIGdldFVSTCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5zb2NrZXRVUkw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUG9zc2liaWxpdHkgdG8gY3VzdG9taXplIGRlZmF1bHQgdXNlciBhZ2VudCB0byBmaXQgeW91ciBuZWVkc1xuICAgICAqIEBwYXJhbSBzdHIgdXNlciBhZ2VudCBsYWJlbFxuICAgICAqIEBwYXJhbSBydiByZXZpc2lvbiBvZiB1c2VyIGFnZW50XG4gICAgICogQHBhcmFtIG1vZHVsZXMgZnVydGhlciBtb2R1bGVzIHRvIGFkZCB0byB1c2VyIGFnZW50IHN0cmluZywgZm9ybWF0OiBbXCI8bW9kMT4vPHJldj5cIiwgXCI8bW9kMj4vPHJldj5cIiwgLi4uIF1cbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFVzZXJBZ2VudChzdHI6IHN0cmluZywgcnY6IHN0cmluZywgbW9kdWxlczogYW55ID0gW10pOiBBUElDbGllbnQge1xuICAgICAgICBjb25zdCBtb2RzID0gbW9kdWxlcy5sZW5ndGggPyBcIiBcIiArIG1vZHVsZXMuam9pbihcIiBcIikgOiBcIlwiO1xuICAgICAgICB0aGlzLnVhID0gKFxuICAgICAgICAgICAgYCR7c3RyfSBgICtcbiAgICAgICAgICAgIGAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgJHtwcm9jZXNzLmFyY2h9OyBydjoke3J2fSlgICtcbiAgICAgICAgICAgIG1vZHMgK1xuICAgICAgICAgICAgYCBub2RlLXNkay8ke3RoaXMuZ2V0VmVyc2lvbigpfSBgICtcbiAgICAgICAgICAgIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBVc2VyIEFnZW50XG4gICAgICogQHJldHVybnMgVXNlciBBZ2VudCBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy51YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMudWEgPSAoXG4gICAgICAgICAgICAgICAgYE5PREUtU0RLICgke3Byb2Nlc3MucGxhdGZvcm19OyAke3Byb2Nlc3MuYXJjaH07IHJ2OiR7dGhpcy5nZXRWZXJzaW9uKCl9KSBgICtcbiAgICAgICAgICAgICAgICBgbm9kZS8ke3Byb2Nlc3MudmVyc2lvbn1gXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnVhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgcHJveHkgc2VydmVyIHRvIHVzZSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gcHJveHkgcHJveHkgc2VydmVyIHRvIHVzZSBmb3IgY29tbXVuaWNhdGlvXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm94eShwcm94eTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5jdXJsb3B0cy5wcm94eSA9IHByb3h5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHByb3h5IHNlcnZlciBjb25maWd1cmF0aW9uXG4gICAgICogQHJldHVybnMgcHJveHkgc2VydmVyIGNvbmZpZ3VyYXRpb24gdmFsdWUgb3IgbnVsbCBpZiBub3Qgc2V0XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3h5KCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY3VybG9wdHMsIFwicHJveHlcIikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cmxvcHRzLnByb3h5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgcmVmZXJlciB0byB1c2UgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHJlZmVyZXIgUmVmZXJlclxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UmVmZXJlcihyZWZlcmVyOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmN1cmxvcHRzLnJlZmVyZXIgPSByZWZlcmVyO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHJlZmVyZXIgY29uZmlndXJhdGlvblxuICAgICAqIEByZXR1cm5zIHJlZmVyZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UmVmZXJlcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmN1cmxvcHRzLCBcInJlZmVyZXJcIikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cmxvcHRzLnJlZmVyZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IG1vZHVsZSB2ZXJzaW9uXG4gICAgICogQHJldHVybnMgbW9kdWxlIHZlcnNpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VmVyc2lvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcGFja2FnZUluZm8udmVyc2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBzZXNzaW9uIGRhdGEgKHNlc3Npb24gaWQgYW5kIHN5c3RlbSBlbnRpdHkpIHRvIGdpdmVuIGNsaWVudCByZXF1ZXN0IHNlc3Npb25cbiAgICAgKiBAcGFyYW0gc2Vzc2lvbiBDbGllbnRSZXF1ZXN0IHNlc3Npb24gaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNhdmVTZXNzaW9uKHNlc3Npb246IGFueSk6IEFQSUNsaWVudCB7XG4gICAgICAgIHNlc3Npb24uc29ja2V0Y2ZnID0ge1xuICAgICAgICAgICAgZW50aXR5OiB0aGlzLnNvY2tldENvbmZpZy5nZXRTeXN0ZW1FbnRpdHkoKSxcbiAgICAgICAgICAgIHNlc3Npb246IHRoaXMuc29ja2V0Q29uZmlnLmdldFNlc3Npb24oKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIGV4aXN0aW5nIGNvbmZpZ3VyYXRpb24gb3V0IG9mIENsaWVudFJlcXVlc3Qgc2Vzc2lvblxuICAgICAqIHRvIHJlYnVpbGQgYW5kIHJldXNlIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICAgKiBAcGFyYW0gc2Vzc2lvbiBDbGllbnRSZXF1ZXN0IHNlc3Npb24gaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHJldXNlU2Vzc2lvbihzZXNzaW9uOiBhbnkpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoc2Vzc2lvbi5zb2NrZXRjZmcuZW50aXR5KTtcbiAgICAgICAgdGhpcy5zZXRTZXNzaW9uKHNlc3Npb24uc29ja2V0Y2ZnLnNlc3Npb24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5vdGhlciBjb25uZWN0aW9uIHVybCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB2YWx1ZSBBUEkgY29ubmVjdGlvbiB1cmwgdG8gc2V0XG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRVUkwodmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0VVJMID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBvbmUgdGltZSBwYXNzd29yZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB2YWx1ZSBvbmUgdGltZSBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0T1RQKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRPVFAodmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW4gQVBJIHNlc3Npb24gaWQgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdmFsdWUgQVBJIHNlc3Npb24gaWRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFNlc3Npb24odmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFNlc3Npb24odmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW4gUmVtb3RlIElQIEFkZHJlc3MgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBUbyBiZSB1c2VkIGluIGNhc2UgeW91IGhhdmUgYW4gYWN0aXZlIGlwIGZpbHRlciBzZXR0aW5nLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBSZW1vdGUgSVAgQWRkcmVzc1xuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UmVtb3RlSVBBZGRyZXNzKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRSZW1vdGVBZGRyZXNzKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IENyZWRlbnRpYWxzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHVpZCBhY2NvdW50IG5hbWVcbiAgICAgKiBAcGFyYW0gcHcgYWNjb3VudCBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q3JlZGVudGlhbHModWlkOiBzdHJpbmcsIHB3OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRMb2dpbih1aWQpO1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRQYXNzd29yZChwdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB1aWQgYWNjb3VudCBuYW1lXG4gICAgICogQHBhcmFtIHJvbGUgcm9sZSB1c2VyIGlkXG4gICAgICogQHBhcmFtIHB3IHJvbGUgdXNlciBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Um9sZUNyZWRlbnRpYWxzKHVpZDogc3RyaW5nLCByb2xlOiBzdHJpbmcsIHB3OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRDcmVkZW50aWFscyhyb2xlID8gYCR7dWlkfSEke3JvbGV9YCA6IHVpZCwgcHcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gQVBJIGxvZ2luIHRvIHN0YXJ0IHNlc3Npb24tYmFzZWQgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSBvdHAgb3B0aW9uYWwgb25lIHRpbWUgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBsb2dpbihvdHAgPSBcIlwiKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICB0aGlzLnNldE9UUChvdHAgfHwgXCJcIik7XG4gICAgICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHsgQ09NTUFORDogXCJTdGFydFNlc3Npb25cIiB9KTtcbiAgICAgICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSByci5nZXRDb2x1bW4oXCJTRVNTSU9OXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTZXNzaW9uKGNvbCA/IGNvbC5nZXREYXRhKClbMF0gOiBcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBBUEkgbG9naW4gdG8gc3RhcnQgc2Vzc2lvbi1iYXNlZCBjb21tdW5pY2F0aW9uLlxuICAgICAqIFVzZSBnaXZlbiBzcGVjaWZpYyBjb21tYW5kIHBhcmFtZXRlcnMuXG4gICAgICogQHBhcmFtIHBhcmFtcyBnaXZlbiBzcGVjaWZpYyBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0gb3RwIG9wdGlvbmFsIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgbG9naW5FeHRlbmRlZChwYXJhbXM6IGFueSwgb3RwID0gXCJcIik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgdGhpcy5zZXRPVFAob3RwKTtcbiAgICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBDT01NQU5EOiBcIlN0YXJ0U2Vzc2lvblwiLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSByci5nZXRDb2x1bW4oXCJTRVNTSU9OXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTZXNzaW9uKGNvbCA/IGNvbC5nZXREYXRhKClbMF0gOiBcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBBUEkgbG9nb3V0IHRvIGNsb3NlIEFQSSBzZXNzaW9uIGluIHVzZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGxvZ291dCgpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHtcbiAgICAgICAgICAgIENPTU1BTkQ6IFwiRW5kU2Vzc2lvblwiLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFNlc3Npb24oXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gQVBJIHJlcXVlc3QgdXNpbmcgdGhlIGdpdmVuIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gY21kIEFQSSBjb21tYW5kIHRvIHJlcXVlc3RcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyByZXF1ZXN0KGNtZDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICAvLyBmbGF0dGVuIG5lc3RlZCBhcGkgY29tbWFuZCBidWxrIHBhcmFtZXRlcnNcbiAgICAgICAgbGV0IG15Y21kID0gdGhpcy5mbGF0dGVuQ29tbWFuZChjbWQpO1xuXG4gICAgICAgIC8vIGF1dG8gY29udmVydCB1bWxhdXQgbmFtZXMgdG8gcHVueWNvZGVcbiAgICAgICAgbXljbWQgPSBhd2FpdCB0aGlzLmF1dG9JRE5Db252ZXJ0KG15Y21kKTtcblxuICAgICAgICAvLyByZXF1ZXN0IGNvbW1hbmQgdG8gQVBJXG4gICAgICAgIGNvbnN0IGNmZzogYW55ID0ge1xuICAgICAgICAgICAgQ09OTkVDVElPTl9VUkw6IHRoaXMuc29ja2V0VVJMLFxuICAgICAgICB9O1xuICAgICAgICAvLyBUT0RPOiAzMDBzICh0byBiZSBzdXJlIHRvIGdldCBhbiBBUEkgcmVzcG9uc2UpXG4gICAgICAgIGNvbnN0IHJlcUNmZzogYW55ID0ge1xuICAgICAgICAgICAgLy9lbmNvZGluZzogXCJ1dGY4XCIsIC8vZGVmYXVsdCBmb3IgdHlwZSBzdHJpbmdcbiAgICAgICAgICAgIC8vZ3ppcDogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IHRoaXMuZ2V0UE9TVERhdGEobXljbWQpLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiVXNlci1BZ2VudFwiOiB0aGlzLmdldFVzZXJBZ2VudCgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB0aW1lb3V0OiBBUElDbGllbnQuc29ja2V0VGltZW91dCxcbiAgICAgICAgICAgIHVybDogY2ZnLkNPTk5FQ1RJT05fVVJMLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBwcm94eSA9IHRoaXMuZ2V0UHJveHkoKTtcbiAgICAgICAgaWYgKHByb3h5KSB7XG4gICAgICAgICAgICByZXFDZmcucHJveHkgPSBwcm94eTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWZlcmVyID0gdGhpcy5nZXRSZWZlcmVyKCk7XG4gICAgICAgIGlmIChyZWZlcmVyKSB7XG4gICAgICAgICAgICByZXFDZmcuaGVhZGVycy5SZWZlcmVyID0gcmVmZXJlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmV0Y2goY2ZnLkNPTk5FQ1RJT05fVVJMLCByZXFDZmcpLnRoZW4oYXN5bmMgKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGJvZHk7XG4gICAgICAgICAgICBpZiAocmVzLm9rKSB7IC8vIHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDBcbiAgICAgICAgICAgICAgICBib2R5ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IocmVzLnN0YXR1cyArIChyZXMuc3RhdHVzVGV4dCA/IFwiIFwiICsgcmVzLnN0YXR1c1RleHQgOiBcIlwiKSk7XG4gICAgICAgICAgICAgICAgYm9keSA9IHJ0bS5nZXRUZW1wbGF0ZShcImh0dHBlcnJvclwiKS5nZXRQbGFpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcnIgPSBuZXcgUmVzcG9uc2UoYm9keSwgbXljbWQsIGNmZyk7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWJ1Z01vZGUgJiYgdGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2codGhpcy5nZXRQT1NURGF0YShteWNtZCwgdHJ1ZSksIHJyLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgdGhlIG5leHQgcGFnZSBvZiBsaXN0IGVudHJpZXMgZm9yIHRoZSBjdXJyZW50IGxpc3QgcXVlcnlcbiAgICAgKiBVc2VmdWwgZm9yIHRhYmxlc1xuICAgICAqIEBwYXJhbSByciBBUEkgUmVzcG9uc2Ugb2YgY3VycmVudCBwYWdlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2Ugb3IgbnVsbCBpbiBjYXNlIHRoZXJlIGFyZSBubyBmdXJ0aGVyIGxpc3QgZW50cmllc1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyByZXF1ZXN0TmV4dFJlc3BvbnNlUGFnZShycjogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBteWNtZCA9IHJyLmdldENvbW1hbmQoKTtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChteWNtZCwgXCJMQVNUXCIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJhbWV0ZXIgTEFTVCBpbiB1c2UuIFBsZWFzZSByZW1vdmUgaXQgdG8gYXZvaWQgaXNzdWVzIGluIHJlcXVlc3ROZXh0UGFnZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpcnN0ID0gMDtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChteWNtZCwgXCJGSVJTVFwiKSkge1xuICAgICAgICAgICAgZmlyc3QgPSBteWNtZC5GSVJTVDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b3RhbCA9IHJyLmdldFJlY29yZHNUb3RhbENvdW50KCk7XG4gICAgICAgIGNvbnN0IGxpbWl0ID0gcnIuZ2V0UmVjb3Jkc0xpbWl0YXRpb24oKTtcbiAgICAgICAgZmlyc3QgKz0gbGltaXQ7XG4gICAgICAgIGlmIChmaXJzdCA8IHRvdGFsKSB7XG4gICAgICAgICAgICBteWNtZC5GSVJTVCA9IGZpcnN0O1xuICAgICAgICAgICAgbXljbWQuTElNSVQgPSBsaW1pdDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QobXljbWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGFsbCBwYWdlcy9lbnRyaWVzIGZvciB0aGUgZ2l2ZW4gcXVlcnkgY29tbWFuZFxuICAgICAqIEBwYXJhbSBjbWQgQVBJIGxpc3QgY29tbWFuZCB0byB1c2VcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFycmF5IG9mIEFQSSBSZXNwb25zZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVxdWVzdEFsbFJlc3BvbnNlUGFnZXMoY21kOiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlW10+IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VzOiBSZXNwb25zZVtdID0gW107XG4gICAgICAgIGNvbnN0IHJyOiBSZXNwb25zZSA9IGF3YWl0IHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKHt9LCBjbWQsIHsgRklSU1Q6IDAgfSkpO1xuICAgICAgICBsZXQgdG1wOiBSZXNwb25zZSB8IG51bGwgPSBycjtcbiAgICAgICAgbGV0IGlkeCA9IDA7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHJlc3BvbnNlc1tpZHgrK10gPSB0bXA7XG4gICAgICAgICAgICB0bXAgPSBhd2FpdCB0aGlzLnJlcXVlc3ROZXh0UmVzcG9uc2VQYWdlKHRtcCk7XG4gICAgICAgIH0gd2hpbGUgKHRtcCAhPT0gbnVsbCk7XG4gICAgICAgIHJldHVybiByZXNwb25zZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgZGF0YSB2aWV3IHRvIGEgZ2l2ZW4gc3VidXNlclxuICAgICAqIEBwYXJhbSB1aWQgc3VidXNlciBhY2NvdW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFVzZXJWaWV3KHVpZDogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcih1aWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBkYXRhIHZpZXcgYmFjayBmcm9tIHN1YnVzZXIgdG8gdXNlclxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXRVc2VyVmlldygpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRVc2VyKFwiXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY3RpdmF0ZSBIaWdoIFBlcmZvcm1hbmNlIENvbm5lY3Rpb24gU2V0dXBcbiAgICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9oZXhvbmV0L25vZGUtc2RrL2Jsb2IvbWFzdGVyL1JFQURNRS5tZFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlSGlnaFBlcmZvcm1hbmNlQ29ubmVjdGlvblNldHVwKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlIERlZmF1bHQgQ29ubmVjdGlvbiBTZXR1cCAodGhlIGRlZmF1bHQpXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyB1c2VEZWZhdWx0Q29ubmVjdGlvblNldHVwKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBPVCZFIFN5c3RlbSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZU9URVN5c3RlbSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoXCIxMjM0XCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgTElWRSBTeXN0ZW0gZm9yIEFQSSBjb21tdW5pY2F0aW9uICh0aGlzIGlzIHRoZSBkZWZhdWx0IHNldHRpbmcpXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyB1c2VMSVZFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShcIjU0Y2RcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlcmlhbGl6ZSBnaXZlbiBjb21tYW5kIGZvciBQT1NUIHJlcXVlc3QgaW5jbHVkaW5nIGNvbm5lY3Rpb24gY29uZmlndXJhdGlvbiBkYXRhXG4gICAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byBlbmNvZGVcbiAgICAgKiBAcmV0dXJucyBlbmNvZGVkIFBPU1QgZGF0YSBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UE9TVERhdGEoY21kOiBhbnksIHNlY3VyZWQgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5zb2NrZXRDb25maWcuZ2V0UE9TVERhdGEoKTtcbiAgICAgICAgaWYgKHNlY3VyZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoL3NfcHc9W14mXSsvLCBcInNfcHc9KioqXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRtcCA9IFwiXCI7XG4gICAgICAgIGlmICghKHR5cGVvZiBjbWQgPT09IFwic3RyaW5nXCIgfHwgY21kIGluc3RhbmNlb2YgU3RyaW5nKSkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoY21kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjbWRba2V5XSAhPT0gbnVsbCAmJiBjbWRba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCArPSBgJHtrZXl9PSR7Y21kW2tleV0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpfVxcbmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0bXAgPSBcIlwiICsgY21kO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWN1cmVkKSB7XG4gICAgICAgICAgICB0bXAgPSB0bXAucmVwbGFjZSgvUEFTU1dPUkQ9W15cXG5dKy8sIFwiUEFTU1dPUkQ9KioqXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9cXG4kLywgXCJcIik7XG4gICAgICAgIGRhdGEgKz0gYCR7Zml4ZWRVUkxFbmMoXCJzX2NvbW1hbmRcIil9PSR7Zml4ZWRVUkxFbmModG1wKX1gO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGUgYWxsIGNvbW1hbmQgcGFyYW1ldGVyIG5hbWVzIHRvIHVwcGVyY2FzZVxuICAgICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyBhcGkgY29tbWFuZCB3aXRoIHVwcGVyY2FzZSBwYXJhbWV0ZXIgbmFtZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIHRvVXBwZXJDYXNlS2V5cyhjbWQ6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IG5ld2NtZDogYW55ID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoazogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBuZXdjbWRbay50b1VwcGVyQ2FzZSgpXSA9IGNtZFtrXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdjbWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmxhdHRlbiBuZXN0ZWQgYXJyYXlzIGluIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gY21kIGFwaSBjb21tYW5kXG4gICAgICogQHJldHVybnMgYXBpIGNvbW1hbmQgd2l0aCBmbGF0dGVuZGVkIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGZsYXR0ZW5Db21tYW5kKGNtZDogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgbXljbWQgPSB0aGlzLnRvVXBwZXJDYXNlS2V5cyhjbWQpO1xuICAgICAgICBjb25zdCBuZXdjbWQ6IGFueSA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyhteWNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9IG15Y21kW2tleV07XG4gICAgICAgICAgICBpZiAodmFsICE9PSBudWxsICYmIHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld2NtZFtgJHtrZXl9JHtpbmRleH1gXSA9IChyb3cgKyBcIlwiKS5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW2tleV0gPSB2YWwucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld2NtZFtrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld2NtZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdXRvIGNvbnZlcnQgQVBJIGNvbW1hbmQgcGFyYW1ldGVycyB0byBwdW55Y29kZSwgaWYgbmVjZXNzYXJ5LlxuICAgICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFwaSBjb21tYW5kIHdpdGggSUROIHZhbHVlcyByZXBsYWNlZCB0byBwdW55Y29kZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgYXV0b0lETkNvbnZlcnQoY21kOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICAvLyBkb24ndCBjb252ZXJ0IGZvciBjb252ZXJ0aWRuIGNvbW1hbmQgdG8gYXZvaWQgZW5kbGVzcyBsb29wXG4gICAgICAgIC8vIGFuZCBpZ25vcmUgY29tbWFuZHMgaW4gc3RyaW5nIGZvcm1hdCAoZXZlbiBkZXByZWNhdGVkKVxuICAgICAgICBpZiAodHlwZW9mIGNtZCA9PT0gXCJzdHJpbmdcIiB8fCBjbWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgL15DT05WRVJUSUROJC9pLnRlc3QoY21kLkNPTU1BTkQpKSB7XG4gICAgICAgICAgICByZXR1cm4gY21kO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjbWQpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gL14oRE9NQUlOfE5BTUVTRVJWRVJ8RE5TWk9ORSkoWzAtOV0qKSQvaS50ZXN0KGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY21kO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvY29udmVydDogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGlkeHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjbWRba2V5XSAhPT0gbnVsbCAmJiBjbWRba2V5XSAhPT0gdW5kZWZpbmVkICYmIC9bXmEtejAtOS5cXC0gXS9pLnRlc3QoY21kW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgdG9jb252ZXJ0LnB1c2goY21kW2tleV0pO1xuICAgICAgICAgICAgICAgIGlkeHMucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXRvY29udmVydC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICAgICAgICBDT01NQU5EOiBcIkNvbnZlcnRJRE5cIixcbiAgICAgICAgICAgIERPTUFJTjogdG9jb252ZXJ0LFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5kaXIoci5nZXRQbGFpbigpKTtcbiAgICAgICAgaWYgKHIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHIuZ2V0Q29sdW1uKFwiQUNFXCIpO1xuICAgICAgICAgICAgaWYgKGNvbCkge1xuICAgICAgICAgICAgICAgIGNvbC5nZXREYXRhKCkuZm9yRWFjaCgocGM6IHN0cmluZywgaWR4OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY21kW2lkeHNbaWR4XV0gPSBwYztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY21kO1xuICAgIH1cbn1cbiJdfQ==