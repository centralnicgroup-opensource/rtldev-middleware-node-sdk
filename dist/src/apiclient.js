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
                            }); }).catch(function (err) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUEwQztBQUMxQywwREFBK0I7QUFDL0IsbUNBQWtDO0FBQ2xDLHVDQUFzQztBQUN0QyxxRUFBb0U7QUFDcEUsK0NBQTJEO0FBRTlDLFFBQUEsMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDOUQsUUFBQSxxQkFBcUIsR0FBRyxxQ0FBcUMsQ0FBQztBQUUzRSxJQUFNLEdBQUcsR0FBRyxpREFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUtsRDtJQThCSTtRQUNJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBcUIsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSwyQkFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFPTSxtQ0FBZSxHQUF0QixVQUF1QixZQUFvQjtRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS00sb0NBQWdCLEdBQXZCO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLTSxt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RyxDQUFDLENBQUMsRUFBRTtnQ0FDaEYsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs2QkFDbEI7d0JBQ0wsQ0FBQyxDQUFDLENBQUM7d0JBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7NEJBQ25CLFdBQU8sR0FBRyxFQUFDO3lCQUNkO3dCQUNTLFdBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztnQ0FDekIsT0FBTyxFQUFFLFlBQVk7Z0NBQ3JCLE1BQU0sRUFBRSxTQUFTOzZCQUNwQixDQUFDLEVBQUE7O3dCQUhJLENBQUMsR0FBRyxTQUdSO3dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzFCLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNULEdBQUcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUMvQixJQUFJLEdBQUcsRUFBRTtnQ0FDTCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBVSxFQUFFLEdBQVE7b0NBQ3ZDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0NBQ3hCLENBQUMsQ0FBQyxDQUFDOzZCQUNOO3lCQUNKO3dCQUNELFdBQU8sR0FBRyxFQUFDOzs7O0tBQ2Q7SUF4a0JzQix1QkFBYSxHQUFXLE1BQU0sQ0FBQztJQXlrQjFELGdCQUFDO0NBQUEsQUE3a0JELElBNmtCQztBQTdrQlksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFja2FnZUluZm8gZnJvbSBcIi4uL3BhY2thZ2UuanNvblwiO1xuaW1wb3J0IGZldGNoIGZyb20gXCJub2RlLWZldGNoXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcbmltcG9ydCB7IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyIH0gZnJvbSBcIi4vcmVzcG9uc2V0ZW1wbGF0ZW1hbmFnZXJcIjtcbmltcG9ydCB7IGZpeGVkVVJMRW5jLCBTb2NrZXRDb25maWcgfSBmcm9tIFwiLi9zb2NrZXRjb25maWdcIjtcblxuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSA9IFwiaHR0cDovLzEyNy4wLjAuMS9hcGkvY2FsbC5jZ2lcIjtcbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkwgPSBcImh0dHBzOi8vYXBpLmlzcGFwaS5uZXQvYXBpL2NhbGwuY2dpXCI7XG5cbmNvbnN0IHJ0bSA9IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQVBJQ2xpZW50IGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBBUElDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEFQSSBjb25uZWN0aW9uIHRpbWVvdXQgc2V0dGluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgc29ja2V0VGltZW91dDogbnVtYmVyID0gMzAwMDAwO1xuICAgIC8qKlxuICAgICAqIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSB1YTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEFQSSBjb25uZWN0aW9uIHVybFxuICAgICAqL1xuICAgIHByaXZhdGUgc29ja2V0VVJMOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogT2JqZWN0IGNvdmVyaW5nIEFQSSBjb25uZWN0aW9uIGRhdGFcbiAgICAgKi9cbiAgICBwcml2YXRlIHNvY2tldENvbmZpZzogU29ja2V0Q29uZmlnO1xuICAgIC8qKlxuICAgICAqIGFjdGl2aXR5IGZsYWcgZm9yIGRlYnVnIG1vZGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlYnVnTW9kZTogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBhZGRpdGlvbmFsIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICAgKi9cbiAgICBwcml2YXRlIGN1cmxvcHRzOiBhbnk7XG4gICAgLyoqXG4gICAgICogbG9nZ2VyIGZ1bmN0aW9uIGZvciBkZWJ1ZyBtb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciB8IG51bGw7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudWEgPSBcIlwiO1xuICAgICAgICB0aGlzLnNvY2tldFVSTCA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTCk7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnID0gbmV3IFNvY2tldENvbmZpZygpO1xuICAgICAgICB0aGlzLnVzZUxJVkVTeXN0ZW0oKTtcbiAgICAgICAgdGhpcy5jdXJsb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdExvZ2dlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldCBjdXN0b20gbG9nZ2VyIHRvIHVzZSBpbnN0ZWFkIG9mIGRlZmF1bHQgb25lXG4gICAgICogQHBhcmFtIGN1c3RvbUxvZ2dlclxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q3VzdG9tTG9nZ2VyKGN1c3RvbUxvZ2dlcjogTG9nZ2VyKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBjdXN0b21Mb2dnZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzZXQgZGVmYXVsdCBsb2dnZXIgdG8gdXNlXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXREZWZhdWx0TG9nZ2VyKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRW5hYmxlIERlYnVnIE91dHB1dCB0byBTVERPVVRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGVuYWJsZURlYnVnTW9kZSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmRlYnVnTW9kZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgRGVidWcgT3V0cHV0XG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBkaXNhYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgQVBJIFNlc3Npb24gdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAgICogQHJldHVybnMgQVBJIFNlc3Npb24gb3IgbnVsbFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZXNzaW9uKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBjb25zdCBzZXNzaWQgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCk7XG4gICAgICAgIHJldHVybiAoc2Vzc2lkID09PSBcIlwiKSA/IG51bGwgOiBzZXNzaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBBUEkgY29ubmVjdGlvbiB1cmwgdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAgICogQHJldHVybnMgQVBJIGNvbm5lY3Rpb24gdXJsIGN1cnJlbnRseSBpbiB1c2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VVJMKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvY2tldFVSTDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQb3NzaWJpbGl0eSB0byBjdXN0b21pemUgZGVmYXVsdCB1c2VyIGFnZW50IHRvIGZpdCB5b3VyIG5lZWRzXG4gICAgICogQHBhcmFtIHN0ciB1c2VyIGFnZW50IGxhYmVsXG4gICAgICogQHBhcmFtIHJ2IHJldmlzaW9uIG9mIHVzZXIgYWdlbnRcbiAgICAgKiBAcGFyYW0gbW9kdWxlcyBmdXJ0aGVyIG1vZHVsZXMgdG8gYWRkIHRvIHVzZXIgYWdlbnQgc3RyaW5nLCBmb3JtYXQ6IFtcIjxtb2QxPi88cmV2PlwiLCBcIjxtb2QyPi88cmV2PlwiLCAuLi4gXVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXNlckFnZW50KHN0cjogc3RyaW5nLCBydjogc3RyaW5nLCBtb2R1bGVzOiBhbnkgPSBbXSk6IEFQSUNsaWVudCB7XG4gICAgICAgIGNvbnN0IG1vZHMgPSBtb2R1bGVzLmxlbmd0aCA/IFwiIFwiICsgbW9kdWxlcy5qb2luKFwiIFwiKSA6IFwiXCI7XG4gICAgICAgIHRoaXMudWEgPSAoXG4gICAgICAgICAgICBgJHtzdHJ9IGAgK1xuICAgICAgICAgICAgYCgke3Byb2Nlc3MucGxhdGZvcm19OyAke3Byb2Nlc3MuYXJjaH07IHJ2OiR7cnZ9KWAgK1xuICAgICAgICAgICAgbW9kcyArXG4gICAgICAgICAgICBgIG5vZGUtc2RrLyR7dGhpcy5nZXRWZXJzaW9uKCl9IGAgK1xuICAgICAgICAgICAgYG5vZGUvJHtwcm9jZXNzLnZlcnNpb259YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIFVzZXIgQWdlbnRcbiAgICAgKiBAcmV0dXJucyBVc2VyIEFnZW50IHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLnVhLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy51YSA9IChcbiAgICAgICAgICAgICAgICBgTk9ERS1TREsgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07ICR7cHJvY2Vzcy5hcmNofTsgcnY6JHt0aGlzLmdldFZlcnNpb24oKX0pIGAgK1xuICAgICAgICAgICAgICAgIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudWE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSBwcm94eSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBjb21tdW5pY2F0aW9cbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3h5KHByb3h5OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmN1cmxvcHRzLnByb3h5ID0gcHJveHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcHJveHkgc2VydmVyIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcmV0dXJucyBwcm94eSBzZXJ2ZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJveHkoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJwcm94eVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucHJveHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSByZWZlcmVyIHRvIHVzZSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gcmVmZXJlciBSZWZlcmVyXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZWZlcmVyKHJlZmVyZXI6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuY3VybG9wdHMucmVmZXJlciA9IHJlZmVyZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVmZXJlciBjb25maWd1cmF0aW9uXG4gICAgICogQHJldHVybnMgcmVmZXJlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWZlcmVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY3VybG9wdHMsIFwicmVmZXJlclwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucmVmZXJlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgbW9kdWxlIHZlcnNpb25cbiAgICAgKiBAcmV0dXJucyBtb2R1bGUgdmVyc2lvblxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwYWNrYWdlSW5mby52ZXJzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGx5IHNlc3Npb24gZGF0YSAoc2Vzc2lvbiBpZCBhbmQgc3lzdGVtIGVudGl0eSkgdG8gZ2l2ZW4gY2xpZW50IHJlcXVlc3Qgc2Vzc2lvblxuICAgICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2F2ZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICAgICAgc2Vzc2lvbi5zb2NrZXRjZmcgPSB7XG4gICAgICAgICAgICBlbnRpdHk6IHRoaXMuc29ja2V0Q29uZmlnLmdldFN5c3RlbUVudGl0eSgpLFxuICAgICAgICAgICAgc2Vzc2lvbjogdGhpcy5zb2NrZXRDb25maWcuZ2V0U2Vzc2lvbigpLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgZXhpc3RpbmcgY29uZmlndXJhdGlvbiBvdXQgb2YgQ2xpZW50UmVxdWVzdCBzZXNzaW9uXG4gICAgICogdG8gcmVidWlsZCBhbmQgcmV1c2UgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgcmV1c2VTZXNzaW9uKHNlc3Npb246IGFueSk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShzZXNzaW9uLnNvY2tldGNmZy5lbnRpdHkpO1xuICAgICAgICB0aGlzLnNldFNlc3Npb24oc2Vzc2lvbi5zb2NrZXRjZmcuc2Vzc2lvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhbm90aGVyIGNvbm5lY3Rpb24gdXJsIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHZhbHVlIEFQSSBjb25uZWN0aW9uIHVybCB0byBzZXRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFVSTCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRVUkwgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IG9uZSB0aW1lIHBhc3N3b3JkIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHZhbHVlIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRPVFAodmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldE9UUCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhbiBBUEkgc2Vzc2lvbiBpZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB2YWx1ZSBBUEkgc2Vzc2lvbiBpZFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0U2Vzc2lvbih2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U2Vzc2lvbih2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhbiBSZW1vdGUgSVAgQWRkcmVzcyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIFRvIGJlIHVzZWQgaW4gY2FzZSB5b3UgaGF2ZSBhbiBhY3RpdmUgaXAgZmlsdGVyIHNldHRpbmcuXG4gICAgICogQHBhcmFtIHZhbHVlIFJlbW90ZSBJUCBBZGRyZXNzXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZW1vdGVJUEFkZHJlc3ModmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFJlbW90ZUFkZHJlc3ModmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgQ3JlZGVudGlhbHMgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgICAqIEBwYXJhbSBwdyBhY2NvdW50IHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDcmVkZW50aWFscyh1aWQ6IHN0cmluZywgcHc6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldExvZ2luKHVpZCk7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFBhc3N3b3JkKHB3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IENyZWRlbnRpYWxzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHVpZCBhY2NvdW50IG5hbWVcbiAgICAgKiBAcGFyYW0gcm9sZSByb2xlIHVzZXIgaWRcbiAgICAgKiBAcGFyYW0gcHcgcm9sZSB1c2VyIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSb2xlQ3JlZGVudGlhbHModWlkOiBzdHJpbmcsIHJvbGU6IHN0cmluZywgcHc6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldENyZWRlbnRpYWxzKHJvbGUgPyBgJHt1aWR9ISR7cm9sZX1gIDogdWlkLCBwdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBBUEkgbG9naW4gdG8gc3RhcnQgc2Vzc2lvbi1iYXNlZCBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGxvZ2luKG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIHRoaXMuc2V0T1RQKG90cCB8fCBcIlwiKTtcbiAgICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3QoeyBDT01NQU5EOiBcIlN0YXJ0U2Vzc2lvblwiIH0pO1xuICAgICAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHJyLmdldENvbHVtbihcIlNFU1NJT05cIik7XG4gICAgICAgICAgICB0aGlzLnNldFNlc3Npb24oY29sID8gY29sLmdldERhdGEoKVswXSA6IFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSBsb2dpbiB0byBzdGFydCBzZXNzaW9uLWJhc2VkIGNvbW11bmljYXRpb24uXG4gICAgICogVXNlIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAgICAgKiBAcGFyYW0gcGFyYW1zIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSBvdHAgb3B0aW9uYWwgb25lIHRpbWUgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBsb2dpbkV4dGVuZGVkKHBhcmFtczogYW55LCBvdHAgPSBcIlwiKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICB0aGlzLnNldE9UUChvdHApO1xuICAgICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHJyLmdldENvbHVtbihcIlNFU1NJT05cIik7XG4gICAgICAgICAgICB0aGlzLnNldFNlc3Npb24oY29sID8gY29sLmdldERhdGEoKVswXSA6IFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSBsb2dvdXQgdG8gY2xvc2UgQVBJIHNlc3Npb24gaW4gdXNlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgbG9nb3V0KCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3Qoe1xuICAgICAgICAgICAgQ09NTUFORDogXCJFbmRTZXNzaW9uXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vzc2lvbihcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBBUEkgcmVxdWVzdCB1c2luZyB0aGUgZ2l2ZW4gY29tbWFuZFxuICAgICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdG8gcmVxdWVzdFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlcXVlc3QoY21kOiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGZsYXR0ZW4gbmVzdGVkIGFwaSBjb21tYW5kIGJ1bGsgcGFyYW1ldGVyc1xuICAgICAgICBsZXQgbXljbWQgPSB0aGlzLmZsYXR0ZW5Db21tYW5kKGNtZCk7XG5cbiAgICAgICAgLy8gYXV0byBjb252ZXJ0IHVtbGF1dCBuYW1lcyB0byBwdW55Y29kZVxuICAgICAgICBteWNtZCA9IGF3YWl0IHRoaXMuYXV0b0lETkNvbnZlcnQobXljbWQpO1xuXG4gICAgICAgIC8vIHJlcXVlc3QgY29tbWFuZCB0byBBUElcbiAgICAgICAgY29uc3QgY2ZnOiBhbnkgPSB7XG4gICAgICAgICAgICBDT05ORUNUSU9OX1VSTDogdGhpcy5zb2NrZXRVUkwsXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IDMwMHMgKHRvIGJlIHN1cmUgdG8gZ2V0IGFuIEFQSSByZXNwb25zZSlcbiAgICAgICAgY29uc3QgcmVxQ2ZnOiBhbnkgPSB7XG4gICAgICAgICAgICAvL2VuY29kaW5nOiBcInV0ZjhcIiwgLy9kZWZhdWx0IGZvciB0eXBlIHN0cmluZ1xuICAgICAgICAgICAgLy9nemlwOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogdGhpcy5nZXRQT1NURGF0YShteWNtZCksXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJVc2VyLUFnZW50XCI6IHRoaXMuZ2V0VXNlckFnZW50KCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHRpbWVvdXQ6IEFQSUNsaWVudC5zb2NrZXRUaW1lb3V0LFxuICAgICAgICAgICAgdXJsOiBjZmcuQ09OTkVDVElPTl9VUkwsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHByb3h5ID0gdGhpcy5nZXRQcm94eSgpO1xuICAgICAgICBpZiAocHJveHkpIHtcbiAgICAgICAgICAgIHJlcUNmZy5wcm94eSA9IHByb3h5O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlZmVyZXIgPSB0aGlzLmdldFJlZmVyZXIoKTtcbiAgICAgICAgaWYgKHJlZmVyZXIpIHtcbiAgICAgICAgICAgIHJlcUNmZy5oZWFkZXJzLlJlZmVyZXIgPSByZWZlcmVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmZXRjaChjZmcuQ09OTkVDVElPTl9VUkwsIHJlcUNmZykudGhlbihhc3luYyAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICBsZXQgYm9keTtcbiAgICAgICAgICAgIGlmIChyZXMub2spIHsgLy8gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMFxuICAgICAgICAgICAgICAgIGJvZHkgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHJlcy5zdGF0dXMgKyAocmVzLnN0YXR1c1RleHQgPyBcIiBcIiArIHJlcy5zdGF0dXNUZXh0IDogXCJcIik7XG4gICAgICAgICAgICAgICAgYm9keSA9IHJ0bS5nZXRUZW1wbGF0ZShcImh0dHBlcnJvclwiKS5nZXRQbGFpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcnIgPSBuZXcgUmVzcG9uc2UoYm9keSwgbXljbWQsIGNmZyk7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWJ1Z01vZGUgJiYgdGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2codGhpcy5nZXRQT1NURGF0YShteWNtZCwgdHJ1ZSksIHJyLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnI7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gcnRtLmdldFRlbXBsYXRlKFwiaHR0cGVycm9yXCIpLmdldFBsYWluKCk7XG4gICAgICAgICAgICBjb25zdCByciA9IG5ldyBSZXNwb25zZShib2R5LCBteWNtZCwgY2ZnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlcnJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0aGUgbmV4dCBwYWdlIG9mIGxpc3QgZW50cmllcyBmb3IgdGhlIGN1cnJlbnQgbGlzdCBxdWVyeVxuICAgICAqIFVzZWZ1bCBmb3IgdGFibGVzXG4gICAgICogQHBhcmFtIHJyIEFQSSBSZXNwb25zZSBvZiBjdXJyZW50IHBhZ2VcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZSBvciBudWxsIGluIGNhc2UgdGhlcmUgYXJlIG5vIGZ1cnRoZXIgbGlzdCBlbnRyaWVzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlcXVlc3ROZXh0UmVzcG9uc2VQYWdlKHJyOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2UgfCBudWxsPiB7XG4gICAgICAgIGNvbnN0IG15Y21kID0gcnIuZ2V0Q29tbWFuZCgpO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkxBU1RcIikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmFtZXRlciBMQVNUIGluIHVzZS4gUGxlYXNlIHJlbW92ZSBpdCB0byBhdm9pZCBpc3N1ZXMgaW4gcmVxdWVzdE5leHRQYWdlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZmlyc3QgPSAwO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkZJUlNUXCIpKSB7XG4gICAgICAgICAgICBmaXJzdCA9IG15Y21kLkZJUlNUO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsID0gcnIuZ2V0UmVjb3Jkc1RvdGFsQ291bnQoKTtcbiAgICAgICAgY29uc3QgbGltaXQgPSByci5nZXRSZWNvcmRzTGltaXRhdGlvbigpO1xuICAgICAgICBmaXJzdCArPSBsaW1pdDtcbiAgICAgICAgaWYgKGZpcnN0IDwgdG90YWwpIHtcbiAgICAgICAgICAgIG15Y21kLkZJUlNUID0gZmlyc3Q7XG4gICAgICAgICAgICBteWNtZC5MSU1JVCA9IGxpbWl0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChteWNtZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYWxsIHBhZ2VzL2VudHJpZXMgZm9yIHRoZSBnaXZlbiBxdWVyeSBjb21tYW5kXG4gICAgICogQHBhcmFtIGNtZCBBUEkgbGlzdCBjb21tYW5kIHRvIHVzZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXJyYXkgb2YgQVBJIFJlc3BvbnNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyByZXF1ZXN0QWxsUmVzcG9uc2VQYWdlcyhjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2VbXT4ge1xuICAgICAgICBjb25zdCByZXNwb25zZXM6IFJlc3BvbnNlW10gPSBbXTtcbiAgICAgICAgY29uc3QgcnI6IFJlc3BvbnNlID0gYXdhaXQgdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24oe30sIGNtZCwgeyBGSVJTVDogMCB9KSk7XG4gICAgICAgIGxldCB0bXA6IFJlc3BvbnNlIHwgbnVsbCA9IHJyO1xuICAgICAgICBsZXQgaWR4ID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgcmVzcG9uc2VzW2lkeCsrXSA9IHRtcDtcbiAgICAgICAgICAgIHRtcCA9IGF3YWl0IHRoaXMucmVxdWVzdE5leHRSZXNwb25zZVBhZ2UodG1wKTtcbiAgICAgICAgfSB3aGlsZSAodG1wICE9PSBudWxsKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBkYXRhIHZpZXcgdG8gYSBnaXZlbiBzdWJ1c2VyXG4gICAgICogQHBhcmFtIHVpZCBzdWJ1c2VyIGFjY291bnQgbmFtZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXNlclZpZXcodWlkOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRVc2VyKHVpZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGRhdGEgdmlldyBiYWNrIGZyb20gc3VidXNlciB0byB1c2VyXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyByZXNldFVzZXJWaWV3KCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFVzZXIoXCJcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlIEhpZ2ggUGVyZm9ybWFuY2UgQ29ubmVjdGlvbiBTZXR1cFxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2hleG9uZXQvbm9kZS1zZGsvYmxvYi9tYXN0ZXIvUkVBRE1FLm1kXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyB1c2VIaWdoUGVyZm9ybWFuY2VDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX1BST1hZKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGUgRGVmYXVsdCBDb25uZWN0aW9uIFNldHVwICh0aGUgZGVmYXVsdClcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZURlZmF1bHRDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IE9UJkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlT1RFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShcIjEyMzRcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBMSVZFIFN5c3RlbSBmb3IgQVBJIGNvbW11bmljYXRpb24gKHRoaXMgaXMgdGhlIGRlZmF1bHQgc2V0dGluZylcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZUxJVkVTeXN0ZW0oKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiNTRjZFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplIGdpdmVuIGNvbW1hbmQgZm9yIFBPU1QgcmVxdWVzdCBpbmNsdWRpbmcgY29ubmVjdGlvbiBjb25maWd1cmF0aW9uIGRhdGFcbiAgICAgKiBAcGFyYW0gY21kIEFQSSBjb21tYW5kIHRvIGVuY29kZVxuICAgICAqIEByZXR1cm5zIGVuY29kZWQgUE9TVCBkYXRhIHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQT1NURGF0YShjbWQ6IGFueSwgc2VjdXJlZCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRQT1NURGF0YSgpO1xuICAgICAgICBpZiAoc2VjdXJlZCkge1xuICAgICAgICAgICAgZGF0YSA9IGRhdGEucmVwbGFjZSgvc19wdz1bXiZdKy8sIFwic19wdz0qKipcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdG1wID0gXCJcIjtcbiAgICAgICAgaWYgKCEodHlwZW9mIGNtZCA9PT0gXCJzdHJpbmdcIiB8fCBjbWQgaW5zdGFuY2VvZiBTdHJpbmcpKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbWQpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wICs9IGAke2tleX09JHtjbWRba2V5XS50b1N0cmluZygpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIil9XFxuYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRtcCA9IFwiXCIgKyBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlY3VyZWQpIHtcbiAgICAgICAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9QQVNTV09SRD1bXlxcbl0rLywgXCJQQVNTV09SRD0qKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgdG1wID0gdG1wLnJlcGxhY2UoL1xcbiQvLCBcIlwiKTtcbiAgICAgICAgZGF0YSArPSBgJHtmaXhlZFVSTEVuYyhcInNfY29tbWFuZFwiKX09JHtmaXhlZFVSTEVuYyh0bXApfWA7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zbGF0ZSBhbGwgY29tbWFuZCBwYXJhbWV0ZXIgbmFtZXMgdG8gdXBwZXJjYXNlXG4gICAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIGFwaSBjb21tYW5kIHdpdGggdXBwZXJjYXNlIHBhcmFtZXRlciBuYW1lc1xuICAgICAqL1xuICAgIHByaXZhdGUgdG9VcHBlckNhc2VLZXlzKGNtZDogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgbmV3Y21kOiBhbnkgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMoY21kKS5mb3JFYWNoKChrOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIG5ld2NtZFtrLnRvVXBwZXJDYXNlKCldID0gY21kW2tdO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld2NtZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGbGF0dGVuIG5lc3RlZCBhcnJheXMgaW4gY29tbWFuZFxuICAgICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyBhcGkgY29tbWFuZCB3aXRoIGZsYXR0ZW5kZWQgcGFyYW1ldGVyc1xuICAgICAqL1xuICAgIHByaXZhdGUgZmxhdHRlbkNvbW1hbmQoY21kOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBteWNtZCA9IHRoaXMudG9VcHBlckNhc2VLZXlzKGNtZCk7XG4gICAgICAgIGNvbnN0IG5ld2NtZDogYW55ID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKG15Y21kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsID0gbXljbWRba2V5XTtcbiAgICAgICAgICAgIGlmICh2YWwgIT09IG51bGwgJiYgdmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW2Ake2tleX0ke2luZGV4fWBdID0gKHJvdyArIFwiXCIpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdjbWRba2V5XSA9IHZhbC5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW2tleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3Y21kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF1dG8gY29udmVydCBBUEkgY29tbWFuZCBwYXJhbWV0ZXJzIHRvIHB1bnljb2RlLCBpZiBuZWNlc3NhcnkuXG4gICAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXBpIGNvbW1hbmQgd2l0aCBJRE4gdmFsdWVzIHJlcGxhY2VkIHRvIHB1bnljb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBhdXRvSUROQ29udmVydChjbWQ6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIC8vIGRvbid0IGNvbnZlcnQgZm9yIGNvbnZlcnRpZG4gY29tbWFuZCB0byBhdm9pZCBlbmRsZXNzIGxvb3BcbiAgICAgICAgLy8gYW5kIGlnbm9yZSBjb21tYW5kcyBpbiBzdHJpbmcgZm9ybWF0IChldmVuIGRlcHJlY2F0ZWQpXG4gICAgICAgIGlmICh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZyB8fCAvXkNPTlZFUlRJRE4kL2kudGVzdChjbWQuQ09NTUFORCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNtZCkuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAvXihET01BSU58TkFNRVNFUlZFUnxETlNaT05FKShbMC05XSopJC9pLnRlc3Qoa2V5KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9jb252ZXJ0OiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgaWR4czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQgJiYgL1teYS16MC05LlxcLSBdL2kudGVzdChjbWRba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0b2NvbnZlcnQucHVzaChjbWRba2V5XSk7XG4gICAgICAgICAgICAgICAgaWR4cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdG9jb252ZXJ0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNtZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHtcbiAgICAgICAgICAgIENPTU1BTkQ6IFwiQ29udmVydElETlwiLFxuICAgICAgICAgICAgRE9NQUlOOiB0b2NvbnZlcnQsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmRpcihyLmdldFBsYWluKCkpO1xuICAgICAgICBpZiAoci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gci5nZXRDb2x1bW4oXCJBQ0VcIik7XG4gICAgICAgICAgICBpZiAoY29sKSB7XG4gICAgICAgICAgICAgICAgY29sLmdldERhdGEoKS5mb3JFYWNoKChwYzogc3RyaW5nLCBpZHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbWRbaWR4c1tpZHhdXSA9IHBjO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbWQ7XG4gICAgfVxufVxuIl19