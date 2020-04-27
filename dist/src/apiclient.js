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
                        newcmd["" + newKey + index] = (row + "").replace(/\r|\n/g, "");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUEwQztBQUMxQywwREFBK0I7QUFDL0IsbUNBQWtDO0FBQ2xDLHVDQUFzQztBQUN0QyxxRUFBb0U7QUFDcEUsK0NBQTJEO0FBRTlDLFFBQUEsMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDOUQsUUFBQSxxQkFBcUIsR0FBRyxxQ0FBcUMsQ0FBQztBQUUzRSxJQUFNLEdBQUcsR0FBRyxpREFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUtsRDtJQThCSTtRQUNJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBcUIsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSwyQkFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFPTSxtQ0FBZSxHQUF0QixVQUF1QixZQUFvQjtRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS00sb0NBQWdCLEdBQXZCO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLTSxt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QUUsWUFBWTtnQ0FDckIsTUFBTSxFQUFFLFNBQVM7NkJBQ3BCLENBQUMsRUFBQTs7d0JBSEksQ0FBQyxHQUFHLFNBR1I7d0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7NEJBQ1QsR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQy9CLElBQUksR0FBRyxFQUFFO2dDQUNMLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFVLEVBQUUsR0FBUTtvQ0FDdkMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQ0FDeEIsQ0FBQyxDQUFDLENBQUM7NkJBQ047eUJBQ0o7d0JBQ0QsV0FBTyxHQUFHLEVBQUM7Ozs7S0FDZDtJQTNqQnNCLHVCQUFhLEdBQVcsTUFBTSxDQUFDO0lBNGpCMUQsZ0JBQUM7Q0FBQSxBQWhrQkQsSUFna0JDO0FBaGtCWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYWNrYWdlSW5mbyBmcm9tIFwiLi4vcGFja2FnZS5qc29uXCI7XG5pbXBvcnQgZmV0Y2ggZnJvbSBcIm5vZGUtZmV0Y2hcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xuaW1wb3J0IHsgUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZVwiO1xuaW1wb3J0IHsgUmVzcG9uc2VUZW1wbGF0ZU1hbmFnZXIgfSBmcm9tIFwiLi9yZXNwb25zZXRlbXBsYXRlbWFuYWdlclwiO1xuaW1wb3J0IHsgZml4ZWRVUkxFbmMsIFNvY2tldENvbmZpZyB9IGZyb20gXCIuL3NvY2tldGNvbmZpZ1wiO1xuXG5leHBvcnQgY29uc3QgSVNQQVBJX0NPTk5FQ1RJT05fVVJMX1BST1hZID0gXCJodHRwOi8vMTI3LjAuMC4xL2FwaS9jYWxsLmNnaVwiO1xuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTCA9IFwiaHR0cHM6Ly9hcGkuaXNwYXBpLm5ldC9hcGkvY2FsbC5jZ2lcIjtcblxuY29uc3QgcnRtID0gUmVzcG9uc2VUZW1wbGF0ZU1hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcblxuLyoqXG4gKiBBUElDbGllbnQgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEFQSUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogQVBJIGNvbm5lY3Rpb24gdGltZW91dCBzZXR0aW5nXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBzb2NrZXRUaW1lb3V0OiBudW1iZXIgPSAzMDAwMDA7XG4gICAgLyoqXG4gICAgICogVXNlciBBZ2VudCBzdHJpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIHVhOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogQVBJIGNvbm5lY3Rpb24gdXJsXG4gICAgICovXG4gICAgcHJpdmF0ZSBzb2NrZXRVUkw6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBPYmplY3QgY292ZXJpbmcgQVBJIGNvbm5lY3Rpb24gZGF0YVxuICAgICAqL1xuICAgIHByaXZhdGUgc29ja2V0Q29uZmlnOiBTb2NrZXRDb25maWc7XG4gICAgLyoqXG4gICAgICogYWN0aXZpdHkgZmxhZyBmb3IgZGVidWcgbW9kZVxuICAgICAqL1xuICAgIHByaXZhdGUgZGVidWdNb2RlOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIGFkZGl0aW9uYWwgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgICAqL1xuICAgIHByaXZhdGUgY3VybG9wdHM6IGFueTtcbiAgICAvKipcbiAgICAgKiBsb2dnZXIgZnVuY3Rpb24gZm9yIGRlYnVnIG1vZGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyIHwgbnVsbDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy51YSA9IFwiXCI7XG4gICAgICAgIHRoaXMuc29ja2V0VVJMID0gXCJcIjtcbiAgICAgICAgdGhpcy5kZWJ1Z01vZGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMKTtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcgPSBuZXcgU29ja2V0Q29uZmlnKCk7XG4gICAgICAgIHRoaXMudXNlTElWRVN5c3RlbSgpO1xuICAgICAgICB0aGlzLmN1cmxvcHRzID0ge307XG4gICAgICAgIHRoaXMubG9nZ2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zZXREZWZhdWx0TG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2V0IGN1c3RvbSBsb2dnZXIgdG8gdXNlIGluc3RlYWQgb2YgZGVmYXVsdCBvbmVcbiAgICAgKiBAcGFyYW0gY3VzdG9tTG9nZ2VyXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDdXN0b21Mb2dnZXIoY3VzdG9tTG9nZ2VyOiBMb2dnZXIpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmxvZ2dlciA9IGN1c3RvbUxvZ2dlcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHNldCBkZWZhdWx0IGxvZ2dlciB0byB1c2VcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldERlZmF1bHRMb2dnZXIoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFbmFibGUgRGVidWcgT3V0cHV0IHRvIFNURE9VVFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgZW5hYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZSBEZWJ1ZyBPdXRwdXRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGRpc2FibGVEZWJ1Z01vZGUoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5kZWJ1Z01vZGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBBUEkgU2Vzc2lvbiB0aGF0IGlzIGN1cnJlbnRseSBzZXRcbiAgICAgKiBAcmV0dXJucyBBUEkgU2Vzc2lvbiBvciBudWxsXG4gICAgICovXG4gICAgcHVibGljIGdldFNlc3Npb24oKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHNlc3NpZCA9IHRoaXMuc29ja2V0Q29uZmlnLmdldFNlc3Npb24oKTtcbiAgICAgICAgcmV0dXJuIChzZXNzaWQgPT09IFwiXCIpID8gbnVsbCA6IHNlc3NpZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEFQSSBjb25uZWN0aW9uIHVybCB0aGF0IGlzIGN1cnJlbnRseSBzZXRcbiAgICAgKiBAcmV0dXJucyBBUEkgY29ubmVjdGlvbiB1cmwgY3VycmVudGx5IGluIHVzZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVUkwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc29ja2V0VVJMO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBvc3NpYmlsaXR5IHRvIGN1c3RvbWl6ZSBkZWZhdWx0IHVzZXIgYWdlbnQgdG8gZml0IHlvdXIgbmVlZHNcbiAgICAgKiBAcGFyYW0gc3RyIHVzZXIgYWdlbnQgbGFiZWxcbiAgICAgKiBAcGFyYW0gcnYgcmV2aXNpb24gb2YgdXNlciBhZ2VudFxuICAgICAqIEBwYXJhbSBtb2R1bGVzIGZ1cnRoZXIgbW9kdWxlcyB0byBhZGQgdG8gdXNlciBhZ2VudCBzdHJpbmcsIGZvcm1hdDogW1wiPG1vZDE+LzxyZXY+XCIsIFwiPG1vZDI+LzxyZXY+XCIsIC4uLiBdXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRVc2VyQWdlbnQoc3RyOiBzdHJpbmcsIHJ2OiBzdHJpbmcsIG1vZHVsZXM6IGFueSA9IFtdKTogQVBJQ2xpZW50IHtcbiAgICAgICAgY29uc3QgbW9kcyA9IG1vZHVsZXMubGVuZ3RoID8gXCIgXCIgKyBtb2R1bGVzLmpvaW4oXCIgXCIpIDogXCJcIjtcbiAgICAgICAgdGhpcy51YSA9IChcbiAgICAgICAgICAgIGAke3N0cn0gYCArXG4gICAgICAgICAgICBgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07ICR7cHJvY2Vzcy5hcmNofTsgcnY6JHtydn0pYCArXG4gICAgICAgICAgICBtb2RzICtcbiAgICAgICAgICAgIGAgbm9kZS1zZGsvJHt0aGlzLmdldFZlcnNpb24oKX0gYCArXG4gICAgICAgICAgICBgbm9kZS8ke3Byb2Nlc3MudmVyc2lvbn1gXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgVXNlciBBZ2VudFxuICAgICAqIEByZXR1cm5zIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMudWEubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnVhID0gKFxuICAgICAgICAgICAgICAgIGBOT0RFLVNESyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgJHtwcm9jZXNzLmFyY2h9OyBydjoke3RoaXMuZ2V0VmVyc2lvbigpfSkgYCArXG4gICAgICAgICAgICAgICAgYG5vZGUvJHtwcm9jZXNzLnZlcnNpb259YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy51YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHByb3h5IHNlcnZlciB0byB1c2UgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHByb3h5IHByb3h5IHNlcnZlciB0byB1c2UgZm9yIGNvbW11bmljYXRpb1xuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJveHkocHJveHk6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuY3VybG9wdHMucHJveHkgPSBwcm94eTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBwcm94eSBzZXJ2ZXIgY29uZmlndXJhdGlvblxuICAgICAqIEByZXR1cm5zIHByb3h5IHNlcnZlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm94eSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmN1cmxvcHRzLCBcInByb3h5XCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJsb3B0cy5wcm94eTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHJlZmVyZXIgdG8gdXNlIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSByZWZlcmVyIFJlZmVyZXJcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFJlZmVyZXIocmVmZXJlcjogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5jdXJsb3B0cy5yZWZlcmVyID0gcmVmZXJlcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZWZlcmVyIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcmV0dXJucyByZWZlcmVyIGNvbmZpZ3VyYXRpb24gdmFsdWUgb3IgbnVsbCBpZiBub3Qgc2V0XG4gICAgICovXG4gICAgcHVibGljIGdldFJlZmVyZXIoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJyZWZlcmVyXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJsb3B0cy5yZWZlcmVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBtb2R1bGUgdmVyc2lvblxuICAgICAqIEByZXR1cm5zIG1vZHVsZSB2ZXJzaW9uXG4gICAgICovXG4gICAgcHVibGljIGdldFZlcnNpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHBhY2thZ2VJbmZvLnZlcnNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgc2Vzc2lvbiBkYXRhIChzZXNzaW9uIGlkIGFuZCBzeXN0ZW0gZW50aXR5KSB0byBnaXZlbiBjbGllbnQgcmVxdWVzdCBzZXNzaW9uXG4gICAgICogQHBhcmFtIHNlc3Npb24gQ2xpZW50UmVxdWVzdCBzZXNzaW9uIGluc3RhbmNlXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzYXZlU2Vzc2lvbihzZXNzaW9uOiBhbnkpOiBBUElDbGllbnQge1xuICAgICAgICBzZXNzaW9uLnNvY2tldGNmZyA9IHtcbiAgICAgICAgICAgIGVudGl0eTogdGhpcy5zb2NrZXRDb25maWcuZ2V0U3lzdGVtRW50aXR5KCksXG4gICAgICAgICAgICBzZXNzaW9uOiB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZSBleGlzdGluZyBjb25maWd1cmF0aW9uIG91dCBvZiBDbGllbnRSZXF1ZXN0IHNlc3Npb25cbiAgICAgKiB0byByZWJ1aWxkIGFuZCByZXVzZSBjb25uZWN0aW9uIHNldHRpbmdzXG4gICAgICogQHBhcmFtIHNlc3Npb24gQ2xpZW50UmVxdWVzdCBzZXNzaW9uIGluc3RhbmNlXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyByZXVzZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KHNlc3Npb24uc29ja2V0Y2ZnLmVudGl0eSk7XG4gICAgICAgIHRoaXMuc2V0U2Vzc2lvbihzZXNzaW9uLnNvY2tldGNmZy5zZXNzaW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFub3RoZXIgY29ubmVjdGlvbiB1cmwgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdmFsdWUgQVBJIGNvbm5lY3Rpb24gdXJsIHRvIHNldFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VVJMKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldFVSTCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb25lIHRpbWUgcGFzc3dvcmQgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdmFsdWUgb25lIHRpbWUgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldE9UUCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0T1RQKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFuIEFQSSBzZXNzaW9uIGlkIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHZhbHVlIEFQSSBzZXNzaW9uIGlkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRTZXNzaW9uKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTZXNzaW9uKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFuIFJlbW90ZSBJUCBBZGRyZXNzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogVG8gYmUgdXNlZCBpbiBjYXNlIHlvdSBoYXZlIGFuIGFjdGl2ZSBpcCBmaWx0ZXIgc2V0dGluZy5cbiAgICAgKiBAcGFyYW0gdmFsdWUgUmVtb3RlIElQIEFkZHJlc3NcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFJlbW90ZUlQQWRkcmVzcyh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UmVtb3RlQWRkcmVzcyh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB1aWQgYWNjb3VudCBuYW1lXG4gICAgICogQHBhcmFtIHB3IGFjY291bnQgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldENyZWRlbnRpYWxzKHVpZDogc3RyaW5nLCBwdzogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0TG9naW4odWlkKTtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UGFzc3dvcmQocHcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgQ3JlZGVudGlhbHMgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgICAqIEBwYXJhbSByb2xlIHJvbGUgdXNlciBpZFxuICAgICAqIEBwYXJhbSBwdyByb2xlIHVzZXIgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFJvbGVDcmVkZW50aWFscyh1aWQ6IHN0cmluZywgcm9sZTogc3RyaW5nLCBwdzogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0Q3JlZGVudGlhbHMocm9sZSA/IGAke3VpZH0hJHtyb2xlfWAgOiB1aWQsIHB3KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSBsb2dpbiB0byBzdGFydCBzZXNzaW9uLWJhc2VkIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gb3RwIG9wdGlvbmFsIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgbG9naW4ob3RwID0gXCJcIik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgdGhpcy5zZXRPVFAob3RwIHx8IFwiXCIpO1xuICAgICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7IENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIgfSk7XG4gICAgICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gQVBJIGxvZ2luIHRvIHN0YXJ0IHNlc3Npb24tYmFzZWQgY29tbXVuaWNhdGlvbi5cbiAgICAgKiBVc2UgZ2l2ZW4gc3BlY2lmaWMgY29tbWFuZCBwYXJhbWV0ZXJzLlxuICAgICAqIEBwYXJhbSBwYXJhbXMgZ2l2ZW4gc3BlY2lmaWMgY29tbWFuZCBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGxvZ2luRXh0ZW5kZWQocGFyYW1zOiBhbnksIG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIHRoaXMuc2V0T1RQKG90cCk7XG4gICAgICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgQ09NTUFORDogXCJTdGFydFNlc3Npb25cIixcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gQVBJIGxvZ291dCB0byBjbG9zZSBBUEkgc2Vzc2lvbiBpbiB1c2VcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBsb2dvdXQoKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICAgICAgICBDT01NQU5EOiBcIkVuZFNlc3Npb25cIixcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTZXNzaW9uKFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSByZXF1ZXN0IHVzaW5nIHRoZSBnaXZlbiBjb21tYW5kXG4gICAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byByZXF1ZXN0XG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVxdWVzdChjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZmxhdHRlbiBuZXN0ZWQgYXBpIGNvbW1hbmQgYnVsayBwYXJhbWV0ZXJzXG4gICAgICAgIGxldCBteWNtZCA9IHRoaXMuZmxhdHRlbkNvbW1hbmQoY21kKTtcblxuICAgICAgICAvLyBhdXRvIGNvbnZlcnQgdW1sYXV0IG5hbWVzIHRvIHB1bnljb2RlXG4gICAgICAgIG15Y21kID0gYXdhaXQgdGhpcy5hdXRvSUROQ29udmVydChteWNtZCk7XG5cbiAgICAgICAgLy8gcmVxdWVzdCBjb21tYW5kIHRvIEFQSVxuICAgICAgICBjb25zdCBjZmc6IGFueSA9IHtcbiAgICAgICAgICAgIENPTk5FQ1RJT05fVVJMOiB0aGlzLnNvY2tldFVSTCxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVE9ETzogMzAwcyAodG8gYmUgc3VyZSB0byBnZXQgYW4gQVBJIHJlc3BvbnNlKVxuICAgICAgICBjb25zdCByZXFDZmc6IGFueSA9IHtcbiAgICAgICAgICAgIC8vZW5jb2Rpbmc6IFwidXRmOFwiLCAvL2RlZmF1bHQgZm9yIHR5cGUgc3RyaW5nXG4gICAgICAgICAgICAvL2d6aXA6IHRydWUsXG4gICAgICAgICAgICBib2R5OiB0aGlzLmdldFBPU1REYXRhKG15Y21kKSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIlVzZXItQWdlbnRcIjogdGhpcy5nZXRVc2VyQWdlbnQoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdGltZW91dDogQVBJQ2xpZW50LnNvY2tldFRpbWVvdXQsXG4gICAgICAgICAgICB1cmw6IGNmZy5DT05ORUNUSU9OX1VSTCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcHJveHkgPSB0aGlzLmdldFByb3h5KCk7XG4gICAgICAgIGlmIChwcm94eSkge1xuICAgICAgICAgICAgcmVxQ2ZnLnByb3h5ID0gcHJveHk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVmZXJlciA9IHRoaXMuZ2V0UmVmZXJlcigpO1xuICAgICAgICBpZiAocmVmZXJlcikge1xuICAgICAgICAgICAgcmVxQ2ZnLmhlYWRlcnMuUmVmZXJlciA9IHJlZmVyZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZldGNoKGNmZy5DT05ORUNUSU9OX1VSTCwgcmVxQ2ZnKS50aGVuKGFzeW5jIChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBib2R5O1xuICAgICAgICAgICAgaWYgKHJlcy5vaykgeyAvLyByZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwXG4gICAgICAgICAgICAgICAgYm9keSA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yID0gcmVzLnN0YXR1cyArIChyZXMuc3RhdHVzVGV4dCA/IFwiIFwiICsgcmVzLnN0YXR1c1RleHQgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICBib2R5ID0gcnRtLmdldFRlbXBsYXRlKFwiaHR0cGVycm9yXCIpLmdldFBsYWluKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByciA9IG5ldyBSZXNwb25zZShib2R5LCBteWNtZCwgY2ZnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBycjtcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBydG0uZ2V0VGVtcGxhdGUoXCJodHRwZXJyb3JcIikuZ2V0UGxhaW4oKTtcbiAgICAgICAgICAgIGNvbnN0IHJyID0gbmV3IFJlc3BvbnNlKGJvZHksIG15Y21kLCBjZmcpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVidWdNb2RlICYmIHRoaXMubG9nZ2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKHRoaXMuZ2V0UE9TVERhdGEobXljbWQsIHRydWUpLCByciwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVyclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRoZSBuZXh0IHBhZ2Ugb2YgbGlzdCBlbnRyaWVzIGZvciB0aGUgY3VycmVudCBsaXN0IHF1ZXJ5XG4gICAgICogVXNlZnVsIGZvciB0YWJsZXNcbiAgICAgKiBAcGFyYW0gcnIgQVBJIFJlc3BvbnNlIG9mIGN1cnJlbnQgcGFnZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlIG9yIG51bGwgaW4gY2FzZSB0aGVyZSBhcmUgbm8gZnVydGhlciBsaXN0IGVudHJpZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVxdWVzdE5leHRSZXNwb25zZVBhZ2UocnI6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZSB8IG51bGw+IHtcbiAgICAgICAgY29uc3QgbXljbWQgPSByci5nZXRDb21tYW5kKCk7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobXljbWQsIFwiTEFTVFwiKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW1ldGVyIExBU1QgaW4gdXNlLiBQbGVhc2UgcmVtb3ZlIGl0IHRvIGF2b2lkIGlzc3VlcyBpbiByZXF1ZXN0TmV4dFBhZ2UuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmaXJzdCA9IDA7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobXljbWQsIFwiRklSU1RcIikpIHtcbiAgICAgICAgICAgIGZpcnN0ID0gbXljbWQuRklSU1Q7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG90YWwgPSByci5nZXRSZWNvcmRzVG90YWxDb3VudCgpO1xuICAgICAgICBjb25zdCBsaW1pdCA9IHJyLmdldFJlY29yZHNMaW1pdGF0aW9uKCk7XG4gICAgICAgIGZpcnN0ICs9IGxpbWl0O1xuICAgICAgICBpZiAoZmlyc3QgPCB0b3RhbCkge1xuICAgICAgICAgICAgbXljbWQuRklSU1QgPSBmaXJzdDtcbiAgICAgICAgICAgIG15Y21kLkxJTUlUID0gbGltaXQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG15Y21kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBhbGwgcGFnZXMvZW50cmllcyBmb3IgdGhlIGdpdmVuIHF1ZXJ5IGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gY21kIEFQSSBsaXN0IGNvbW1hbmQgdG8gdXNlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBhcnJheSBvZiBBUEkgUmVzcG9uc2VzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlcXVlc3RBbGxSZXNwb25zZVBhZ2VzKGNtZDogYW55KTogUHJvbWlzZTxSZXNwb25zZVtdPiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlczogUmVzcG9uc2VbXSA9IFtdO1xuICAgICAgICBjb25zdCBycjogUmVzcG9uc2UgPSBhd2FpdCB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbih7fSwgY21kLCB7IEZJUlNUOiAwIH0pKTtcbiAgICAgICAgbGV0IHRtcDogUmVzcG9uc2UgfCBudWxsID0gcnI7XG4gICAgICAgIGxldCBpZHggPSAwO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICByZXNwb25zZXNbaWR4KytdID0gdG1wO1xuICAgICAgICAgICAgdG1wID0gYXdhaXQgdGhpcy5yZXF1ZXN0TmV4dFJlc3BvbnNlUGFnZSh0bXApO1xuICAgICAgICB9IHdoaWxlICh0bXAgIT09IG51bGwpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2VzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGRhdGEgdmlldyB0byBhIGdpdmVuIHN1YnVzZXJcbiAgICAgKiBAcGFyYW0gdWlkIHN1YnVzZXIgYWNjb3VudCBuYW1lXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRVc2VyVmlldyh1aWQ6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFVzZXIodWlkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZGF0YSB2aWV3IGJhY2sgZnJvbSBzdWJ1c2VyIHRvIHVzZXJcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHJlc2V0VXNlclZpZXcoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcihcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGUgSGlnaCBQZXJmb3JtYW5jZSBDb25uZWN0aW9uIFNldHVwXG4gICAgICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vaGV4b25ldC9ub2RlLXNkay9ibG9iL21hc3Rlci9SRUFETUUubWRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZUhpZ2hQZXJmb3JtYW5jZUNvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfUFJPWFkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY3RpdmF0ZSBEZWZhdWx0IENvbm5lY3Rpb24gU2V0dXAgKHRoZSBkZWZhdWx0KVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlRGVmYXVsdENvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkwpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgT1QmRSBTeXN0ZW0gZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyB1c2VPVEVTeXN0ZW0oKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiMTIzNFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IExJVkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvbiAodGhpcyBpcyB0aGUgZGVmYXVsdCBzZXR0aW5nKVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlTElWRVN5c3RlbSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoXCI1NGNkXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXJpYWxpemUgZ2l2ZW4gY29tbWFuZCBmb3IgUE9TVCByZXF1ZXN0IGluY2x1ZGluZyBjb25uZWN0aW9uIGNvbmZpZ3VyYXRpb24gZGF0YVxuICAgICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdG8gZW5jb2RlXG4gICAgICogQHJldHVybnMgZW5jb2RlZCBQT1NUIGRhdGEgc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIGdldFBPU1REYXRhKGNtZDogYW55LCBzZWN1cmVkID0gZmFsc2UpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuc29ja2V0Q29uZmlnLmdldFBPU1REYXRhKCk7XG4gICAgICAgIGlmIChzZWN1cmVkKSB7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9zX3B3PVteJl0rLywgXCJzX3B3PSoqKlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0bXAgPSBcIlwiO1xuICAgICAgICBpZiAoISh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY21kW2tleV0gIT09IG51bGwgJiYgY21kW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gYCR7a2V5fT0ke2NtZFtrZXldLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKX1cXG5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG1wID0gXCJcIiArIGNtZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VjdXJlZCkge1xuICAgICAgICAgICAgdG1wID0gdG1wLnJlcGxhY2UoL1BBU1NXT1JEPVteXFxuXSsvLCBcIlBBU1NXT1JEPSoqKlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0bXAgPSB0bXAucmVwbGFjZSgvXFxuJC8sIFwiXCIpO1xuICAgICAgICBkYXRhICs9IGAke2ZpeGVkVVJMRW5jKFwic19jb21tYW5kXCIpfT0ke2ZpeGVkVVJMRW5jKHRtcCl9YDtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmxhdHRlbiBuZXN0ZWQgYXJyYXlzIGluIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gY21kIGFwaSBjb21tYW5kXG4gICAgICogQHJldHVybnMgYXBpIGNvbW1hbmQgd2l0aCBmbGF0dGVuZGVkIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGZsYXR0ZW5Db21tYW5kKGNtZDogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgbmV3Y21kOiBhbnkgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMoY21kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsID0gY21kW2tleV07XG4gICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIGlmICh2YWwgIT09IG51bGwgJiYgdmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW2Ake25ld0tleX0ke2luZGV4fWBdID0gKHJvdyArIFwiXCIpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdjbWRbbmV3S2V5XSA9IHZhbC5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW25ld0tleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3Y21kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF1dG8gY29udmVydCBBUEkgY29tbWFuZCBwYXJhbWV0ZXJzIHRvIHB1bnljb2RlLCBpZiBuZWNlc3NhcnkuXG4gICAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXBpIGNvbW1hbmQgd2l0aCBJRE4gdmFsdWVzIHJlcGxhY2VkIHRvIHB1bnljb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBhdXRvSUROQ29udmVydChjbWQ6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIC8vIGRvbid0IGNvbnZlcnQgZm9yIGNvbnZlcnRpZG4gY29tbWFuZCB0byBhdm9pZCBlbmRsZXNzIGxvb3BcbiAgICAgICAgLy8gYW5kIGlnbm9yZSBjb21tYW5kcyBpbiBzdHJpbmcgZm9ybWF0IChldmVuIGRlcHJlY2F0ZWQpXG4gICAgICAgIGlmICh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZyB8fCAvXkNPTlZFUlRJRE4kL2kudGVzdChjbWQuQ09NTUFORCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNtZCkuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAvXihET01BSU58TkFNRVNFUlZFUnxETlNaT05FKShbMC05XSopJC9pLnRlc3Qoa2V5KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9jb252ZXJ0OiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgaWR4czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQgJiYgL1teYS16MC05LlxcLSBdL2kudGVzdChjbWRba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0b2NvbnZlcnQucHVzaChjbWRba2V5XSk7XG4gICAgICAgICAgICAgICAgaWR4cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdG9jb252ZXJ0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNtZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHtcbiAgICAgICAgICAgIENPTU1BTkQ6IFwiQ29udmVydElETlwiLFxuICAgICAgICAgICAgRE9NQUlOOiB0b2NvbnZlcnQsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmRpcihyLmdldFBsYWluKCkpO1xuICAgICAgICBpZiAoci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gci5nZXRDb2x1bW4oXCJBQ0VcIik7XG4gICAgICAgICAgICBpZiAoY29sKSB7XG4gICAgICAgICAgICAgICAgY29sLmdldERhdGEoKS5mb3JFYWNoKChwYzogc3RyaW5nLCBpZHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbWRbaWR4c1tpZHhdXSA9IHBjO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbWQ7XG4gICAgfVxufVxuIl19