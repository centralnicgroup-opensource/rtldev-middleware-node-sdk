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
import packageInfo from "../package.json";
import fetch from "node-fetch";
import { Logger } from "./logger";
import { Response } from "./response";
import { ResponseTemplateManager } from "./responsetemplatemanager";
import { fixedURLEnc, SocketConfig } from "./socketconfig";
export var ISPAPI_CONNECTION_URL_PROXY = "http://127.0.0.1/api/call.cgi";
export var ISPAPI_CONNECTION_URL_LIVE = "https://api.ispapi.net/api/call.cgi";
export var ISPAPI_CONNECTION_URL_OTE = "https://api-ote.ispapi.net/api/call.cgi";
var rtm = ResponseTemplateManager.getInstance();
var APIClient = (function () {
    function APIClient() {
        this.ua = "";
        this.socketURL = "";
        this.debugMode = false;
        this.setURL(ISPAPI_CONNECTION_URL_LIVE);
        this.socketConfig = new SocketConfig();
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
        this.logger = new Logger();
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
        return packageInfo.version;
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
                                            rr = new Response(body, mycmd, cfg);
                                            if (this.debugMode && this.logger) {
                                                this.logger.log(this.getPOSTData(mycmd, true), rr, error);
                                            }
                                            return [2, rr];
                                    }
                                });
                            }); })
                                .catch(function (err) {
                                var body = rtm.getTemplate("httperror").getPlain();
                                var rr = new Response(body, mycmd, cfg);
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
        this.setURL(ISPAPI_CONNECTION_URL_PROXY);
        return this;
    };
    APIClient.prototype.useDefaultConnectionSetup = function () {
        this.setURL(ISPAPI_CONNECTION_URL_LIVE);
        return this;
    };
    APIClient.prototype.useOTESystem = function () {
        this.setURL(ISPAPI_CONNECTION_URL_OTE);
        this.socketConfig.setSystemEntity("1234");
        return this;
    };
    APIClient.prototype.useLIVESystem = function () {
        this.setURL(ISPAPI_CONNECTION_URL_LIVE);
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
        data += "".concat(fixedURLEnc("s_command"), "=").concat(fixedURLEnc(tmp));
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
export { APIClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLFdBQVcsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsTUFBTSxDQUFDLElBQU0sMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDM0UsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcscUNBQXFDLENBQUM7QUFDaEYsTUFBTSxDQUFDLElBQU0seUJBQXlCLEdBQUcseUNBQXlDLENBQUM7QUFFbkYsSUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFLbEQ7SUE4QkU7UUFDRSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxn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UztnQ0FDdEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMvQjtnQ0FDQSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzZCQUNoQjt3QkFDSCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTs0QkFDckIsV0FBTyxHQUFHLEVBQUM7eUJBQ1o7d0JBQ1MsV0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDO2dDQUMzQixPQUFPLEVBQUUsWUFBWTtnQ0FDckIsTUFBTSxFQUFFLFNBQVM7NkJBQ2xCLENBQUMsRUFBQTs7d0JBSEksQ0FBQyxHQUFHLFNBR1I7d0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7NEJBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQy9CLElBQUksR0FBRyxFQUFFO2dDQUNQLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFVLEVBQUUsR0FBUTtvQ0FDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQ0FDdEIsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7eUJBQ0Y7d0JBQ0QsV0FBTyxHQUFHLEVBQUM7Ozs7S0FDWjtJQWhsQnNCLHVCQUFhLEdBQVcsTUFBTSxDQUFDO0lBaWxCeEQsZ0JBQUM7Q0FBQSxBQXJsQkQsSUFxbEJDO1NBcmxCWSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhY2thZ2VJbmZvIGZyb20gXCIuLi9wYWNrYWdlLmpzb25cIjtcbmltcG9ydCBmZXRjaCBmcm9tIFwibm9kZS1mZXRjaFwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XG5pbXBvcnQgeyBSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5pbXBvcnQgeyBSZXNwb25zZVRlbXBsYXRlTWFuYWdlciB9IGZyb20gXCIuL3Jlc3BvbnNldGVtcGxhdGVtYW5hZ2VyXCI7XG5pbXBvcnQgeyBmaXhlZFVSTEVuYywgU29ja2V0Q29uZmlnIH0gZnJvbSBcIi4vc29ja2V0Y29uZmlnXCI7XG5cbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkxfUFJPWFkgPSBcImh0dHA6Ly8xMjcuMC4wLjEvYXBpL2NhbGwuY2dpXCI7XG5leHBvcnQgY29uc3QgSVNQQVBJX0NPTk5FQ1RJT05fVVJMX0xJVkUgPSBcImh0dHBzOi8vYXBpLmlzcGFwaS5uZXQvYXBpL2NhbGwuY2dpXCI7XG5leHBvcnQgY29uc3QgSVNQQVBJX0NPTk5FQ1RJT05fVVJMX09URSA9IFwiaHR0cHM6Ly9hcGktb3RlLmlzcGFwaS5uZXQvYXBpL2NhbGwuY2dpXCI7XG5cbmNvbnN0IHJ0bSA9IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQVBJQ2xpZW50IGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBBUElDbGllbnQge1xuICAvKipcbiAgICogQVBJIGNvbm5lY3Rpb24gdGltZW91dCBzZXR0aW5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHNvY2tldFRpbWVvdXQ6IG51bWJlciA9IDMwMDAwMDtcbiAgLyoqXG4gICAqIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAqL1xuICBwcml2YXRlIHVhOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBUEkgY29ubmVjdGlvbiB1cmxcbiAgICovXG4gIHByaXZhdGUgc29ja2V0VVJMOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBPYmplY3QgY292ZXJpbmcgQVBJIGNvbm5lY3Rpb24gZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBzb2NrZXRDb25maWc6IFNvY2tldENvbmZpZztcbiAgLyoqXG4gICAqIGFjdGl2aXR5IGZsYWcgZm9yIGRlYnVnIG1vZGVcbiAgICovXG4gIHByaXZhdGUgZGVidWdNb2RlOiBib29sZWFuO1xuICAvKipcbiAgICogYWRkaXRpb25hbCBjb25uZWN0aW9uIHNldHRpbmdzXG4gICAqL1xuICBwcml2YXRlIGN1cmxvcHRzOiBhbnk7XG4gIC8qKlxuICAgKiBsb2dnZXIgZnVuY3Rpb24gZm9yIGRlYnVnIG1vZGVcbiAgICovXG4gIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnVhID0gXCJcIjtcbiAgICB0aGlzLnNvY2tldFVSTCA9IFwiXCI7XG4gICAgdGhpcy5kZWJ1Z01vZGUgPSBmYWxzZTtcbiAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfTElWRSk7XG4gICAgdGhpcy5zb2NrZXRDb25maWcgPSBuZXcgU29ja2V0Q29uZmlnKCk7XG4gICAgdGhpcy51c2VMSVZFU3lzdGVtKCk7XG4gICAgdGhpcy5jdXJsb3B0cyA9IHt9O1xuICAgIHRoaXMubG9nZ2VyID0gbnVsbDtcbiAgICB0aGlzLnNldERlZmF1bHRMb2dnZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZXQgY3VzdG9tIGxvZ2dlciB0byB1c2UgaW5zdGVhZCBvZiBkZWZhdWx0IG9uZVxuICAgKiBAcGFyYW0gY3VzdG9tTG9nZ2VyXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRDdXN0b21Mb2dnZXIoY3VzdG9tTG9nZ2VyOiBMb2dnZXIpOiBBUElDbGllbnQge1xuICAgIHRoaXMubG9nZ2VyID0gY3VzdG9tTG9nZ2VyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBzZXQgZGVmYXVsdCBsb2dnZXIgdG8gdXNlXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXREZWZhdWx0TG9nZ2VyKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5sb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEVuYWJsZSBEZWJ1ZyBPdXRwdXQgdG8gU1RET1VUXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBlbmFibGVEZWJ1Z01vZGUoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmRlYnVnTW9kZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzYWJsZSBEZWJ1ZyBPdXRwdXRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIGRpc2FibGVEZWJ1Z01vZGUoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmRlYnVnTW9kZSA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgQVBJIFNlc3Npb24gdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAqIEByZXR1cm5zIEFQSSBTZXNzaW9uIG9yIG51bGxcbiAgICovXG4gIHB1YmxpYyBnZXRTZXNzaW9uKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlc3NpZCA9IHRoaXMuc29ja2V0Q29uZmlnLmdldFNlc3Npb24oKTtcbiAgICByZXR1cm4gc2Vzc2lkID09PSBcIlwiID8gbnVsbCA6IHNlc3NpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIEFQSSBjb25uZWN0aW9uIHVybCB0aGF0IGlzIGN1cnJlbnRseSBzZXRcbiAgICogQHJldHVybnMgQVBJIGNvbm5lY3Rpb24gdXJsIGN1cnJlbnRseSBpbiB1c2VcbiAgICovXG4gIHB1YmxpYyBnZXRVUkwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXRVUkw7XG4gIH1cblxuICAvKipcbiAgICogUG9zc2liaWxpdHkgdG8gY3VzdG9taXplIGRlZmF1bHQgdXNlciBhZ2VudCB0byBmaXQgeW91ciBuZWVkc1xuICAgKiBAcGFyYW0gc3RyIHVzZXIgYWdlbnQgbGFiZWxcbiAgICogQHBhcmFtIHJ2IHJldmlzaW9uIG9mIHVzZXIgYWdlbnRcbiAgICogQHBhcmFtIG1vZHVsZXMgZnVydGhlciBtb2R1bGVzIHRvIGFkZCB0byB1c2VyIGFnZW50IHN0cmluZywgZm9ybWF0OiBbXCI8bW9kMT4vPHJldj5cIiwgXCI8bW9kMj4vPHJldj5cIiwgLi4uIF1cbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFVzZXJBZ2VudChzdHI6IHN0cmluZywgcnY6IHN0cmluZywgbW9kdWxlczogYW55ID0gW10pOiBBUElDbGllbnQge1xuICAgIGNvbnN0IG1vZHMgPSBtb2R1bGVzLmxlbmd0aCA/IFwiIFwiICsgbW9kdWxlcy5qb2luKFwiIFwiKSA6IFwiXCI7XG4gICAgdGhpcy51YSA9XG4gICAgICBgJHtzdHJ9IGAgK1xuICAgICAgYCgke3Byb2Nlc3MucGxhdGZvcm19OyAke3Byb2Nlc3MuYXJjaH07IHJ2OiR7cnZ9KWAgK1xuICAgICAgbW9kcyArXG4gICAgICBgIG5vZGUtc2RrLyR7dGhpcy5nZXRWZXJzaW9uKCl9IGAgK1xuICAgICAgYG5vZGUvJHtwcm9jZXNzLnZlcnNpb259YDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIFVzZXIgQWdlbnRcbiAgICogQHJldHVybnMgVXNlciBBZ2VudCBzdHJpbmdcbiAgICovXG4gIHB1YmxpYyBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMudWEubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVhID1cbiAgICAgICAgYE5PREUtU0RLICgke3Byb2Nlc3MucGxhdGZvcm19OyAke1xuICAgICAgICAgIHByb2Nlc3MuYXJjaFxuICAgICAgICB9OyBydjoke3RoaXMuZ2V0VmVyc2lvbigpfSkgYCArIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVhO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgcHJveHkgc2VydmVyIHRvIHVzZSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHByb3h5IHByb3h5IHNlcnZlciB0byB1c2UgZm9yIGNvbW11bmljYXRpb1xuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0UHJveHkocHJveHk6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5jdXJsb3B0cy5wcm94eSA9IHByb3h5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJveHkgc2VydmVyIGNvbmZpZ3VyYXRpb25cbiAgICogQHJldHVybnMgcHJveHkgc2VydmVyIGNvbmZpZ3VyYXRpb24gdmFsdWUgb3IgbnVsbCBpZiBub3Qgc2V0XG4gICAqL1xuICBwdWJsaWMgZ2V0UHJveHkoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmN1cmxvcHRzLCBcInByb3h5XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJsb3B0cy5wcm94eTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSByZWZlcmVyIHRvIHVzZSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHJlZmVyZXIgUmVmZXJlclxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0UmVmZXJlcihyZWZlcmVyOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuY3VybG9wdHMucmVmZXJlciA9IHJlZmVyZXI7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSByZWZlcmVyIGNvbmZpZ3VyYXRpb25cbiAgICogQHJldHVybnMgcmVmZXJlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgKi9cbiAgcHVibGljIGdldFJlZmVyZXIoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmN1cmxvcHRzLCBcInJlZmVyZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cmxvcHRzLnJlZmVyZXI7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBtb2R1bGUgdmVyc2lvblxuICAgKiBAcmV0dXJucyBtb2R1bGUgdmVyc2lvblxuICAgKi9cbiAgcHVibGljIGdldFZlcnNpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGFja2FnZUluZm8udmVyc2lvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBzZXNzaW9uIGRhdGEgKHNlc3Npb24gaWQgYW5kIHN5c3RlbSBlbnRpdHkpIHRvIGdpdmVuIGNsaWVudCByZXF1ZXN0IHNlc3Npb25cbiAgICogQHBhcmFtIHNlc3Npb24gQ2xpZW50UmVxdWVzdCBzZXNzaW9uIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzYXZlU2Vzc2lvbihzZXNzaW9uOiBhbnkpOiBBUElDbGllbnQge1xuICAgIHNlc3Npb24uc29ja2V0Y2ZnID0ge1xuICAgICAgZW50aXR5OiB0aGlzLnNvY2tldENvbmZpZy5nZXRTeXN0ZW1FbnRpdHkoKSxcbiAgICAgIHNlc3Npb246IHRoaXMuc29ja2V0Q29uZmlnLmdldFNlc3Npb24oKSxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSBleGlzdGluZyBjb25maWd1cmF0aW9uIG91dCBvZiBDbGllbnRSZXF1ZXN0IHNlc3Npb25cbiAgICogdG8gcmVidWlsZCBhbmQgcmV1c2UgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgKiBAcGFyYW0gc2Vzc2lvbiBDbGllbnRSZXF1ZXN0IHNlc3Npb24gaW5zdGFuY2VcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHJldXNlU2Vzc2lvbihzZXNzaW9uOiBhbnkpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShzZXNzaW9uLnNvY2tldGNmZy5lbnRpdHkpO1xuICAgIHRoaXMuc2V0U2Vzc2lvbihzZXNzaW9uLnNvY2tldGNmZy5zZXNzaW9uKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYW5vdGhlciBjb25uZWN0aW9uIHVybCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdmFsdWUgQVBJIGNvbm5lY3Rpb24gdXJsIHRvIHNldFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0VVJMKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0VVJMID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IG9uZSB0aW1lIHBhc3N3b3JkIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSB2YWx1ZSBvbmUgdGltZSBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0T1RQKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldE9UUCh2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFuIEFQSSBzZXNzaW9uIGlkIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSB2YWx1ZSBBUEkgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0U2Vzc2lvbih2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTZXNzaW9uKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYW4gUmVtb3RlIElQIEFkZHJlc3MgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogVG8gYmUgdXNlZCBpbiBjYXNlIHlvdSBoYXZlIGFuIGFjdGl2ZSBpcCBmaWx0ZXIgc2V0dGluZy5cbiAgICogQHBhcmFtIHZhbHVlIFJlbW90ZSBJUCBBZGRyZXNzXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRSZW1vdGVJUEFkZHJlc3ModmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UmVtb3RlQWRkcmVzcyh2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IENyZWRlbnRpYWxzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSB1aWQgYWNjb3VudCBuYW1lXG4gICAqIEBwYXJhbSBwdyBhY2NvdW50IHBhc3N3b3JkXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRDcmVkZW50aWFscyh1aWQ6IHN0cmluZywgcHc6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0TG9naW4odWlkKTtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRQYXNzd29yZChwdyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IENyZWRlbnRpYWxzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSB1aWQgYWNjb3VudCBuYW1lXG4gICAqIEBwYXJhbSByb2xlIHJvbGUgdXNlciBpZFxuICAgKiBAcGFyYW0gcHcgcm9sZSB1c2VyIHBhc3N3b3JkXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRSb2xlQ3JlZGVudGlhbHModWlkOiBzdHJpbmcsIHJvbGU6IHN0cmluZywgcHc6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0Q3JlZGVudGlhbHMocm9sZSA/IGAke3VpZH0hJHtyb2xlfWAgOiB1aWQsIHB3KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIEFQSSBsb2dpbiB0byBzdGFydCBzZXNzaW9uLWJhc2VkIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGxvZ2luKG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgdGhpcy5zZXRPVFAob3RwIHx8IFwiXCIpO1xuICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHsgQ09NTUFORDogXCJTdGFydFNlc3Npb25cIiB9KTtcbiAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgIGNvbnN0IGNvbCA9IHJyLmdldENvbHVtbihcIlNFU1NJT05cIik7XG4gICAgICB0aGlzLnNldFNlc3Npb24oY29sID8gY29sLmdldERhdGEoKVswXSA6IFwiXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcnI7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBBUEkgbG9naW4gdG8gc3RhcnQgc2Vzc2lvbi1iYXNlZCBjb21tdW5pY2F0aW9uLlxuICAgKiBVc2UgZ2l2ZW4gc3BlY2lmaWMgY29tbWFuZCBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gcGFyYW1zIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0gb3RwIG9wdGlvbmFsIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgbG9naW5FeHRlbmRlZChwYXJhbXM6IGFueSwgb3RwID0gXCJcIik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICB0aGlzLnNldE9UUChvdHApO1xuICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KFxuICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAge1xuICAgICAgICAgIENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHBhcmFtc1xuICAgICAgKVxuICAgICk7XG4gICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICBjb25zdCBjb2wgPSByci5nZXRDb2x1bW4oXCJTRVNTSU9OXCIpO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uKGNvbCA/IGNvbC5nZXREYXRhKClbMF0gOiBcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJyO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gQVBJIGxvZ291dCB0byBjbG9zZSBBUEkgc2Vzc2lvbiBpbiB1c2VcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBsb2dvdXQoKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHtcbiAgICAgIENPTU1BTkQ6IFwiRW5kU2Vzc2lvblwiLFxuICAgIH0pO1xuICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgdGhpcy5zZXRTZXNzaW9uKFwiXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcnI7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBBUEkgcmVxdWVzdCB1c2luZyB0aGUgZ2l2ZW4gY29tbWFuZFxuICAgKiBAcGFyYW0gY21kIEFQSSBjb21tYW5kIHRvIHJlcXVlc3RcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0KGNtZDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIC8vIGZsYXR0ZW4gbmVzdGVkIGFwaSBjb21tYW5kIGJ1bGsgcGFyYW1ldGVyc1xuICAgIGxldCBteWNtZCA9IHRoaXMuZmxhdHRlbkNvbW1hbmQoY21kKTtcblxuICAgIC8vIGF1dG8gY29udmVydCB1bWxhdXQgbmFtZXMgdG8gcHVueWNvZGVcbiAgICBteWNtZCA9IGF3YWl0IHRoaXMuYXV0b0lETkNvbnZlcnQobXljbWQpO1xuXG4gICAgLy8gcmVxdWVzdCBjb21tYW5kIHRvIEFQSVxuICAgIGNvbnN0IGNmZzogYW55ID0ge1xuICAgICAgQ09OTkVDVElPTl9VUkw6IHRoaXMuc29ja2V0VVJMLFxuICAgIH07XG4gICAgLy8gVE9ETzogMzAwcyAodG8gYmUgc3VyZSB0byBnZXQgYW4gQVBJIHJlc3BvbnNlKVxuICAgIGNvbnN0IHJlcUNmZzogYW55ID0ge1xuICAgICAgLy9lbmNvZGluZzogXCJ1dGY4XCIsIC8vZGVmYXVsdCBmb3IgdHlwZSBzdHJpbmdcbiAgICAgIC8vZ3ppcDogdHJ1ZSxcbiAgICAgIGJvZHk6IHRoaXMuZ2V0UE9TVERhdGEobXljbWQpLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIlVzZXItQWdlbnRcIjogdGhpcy5nZXRVc2VyQWdlbnQoKSxcbiAgICAgIH0sXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgdGltZW91dDogQVBJQ2xpZW50LnNvY2tldFRpbWVvdXQsXG4gICAgICB1cmw6IGNmZy5DT05ORUNUSU9OX1VSTCxcbiAgICB9O1xuICAgIGNvbnN0IHByb3h5ID0gdGhpcy5nZXRQcm94eSgpO1xuICAgIGlmIChwcm94eSkge1xuICAgICAgcmVxQ2ZnLnByb3h5ID0gcHJveHk7XG4gICAgfVxuICAgIGNvbnN0IHJlZmVyZXIgPSB0aGlzLmdldFJlZmVyZXIoKTtcbiAgICBpZiAocmVmZXJlcikge1xuICAgICAgcmVxQ2ZnLmhlYWRlcnMuUmVmZXJlciA9IHJlZmVyZXI7XG4gICAgfVxuICAgIHJldHVybiBmZXRjaChjZmcuQ09OTkVDVElPTl9VUkwsIHJlcUNmZylcbiAgICAgIC50aGVuKGFzeW5jIChyZXM6IGFueSkgPT4ge1xuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBsZXQgYm9keTtcbiAgICAgICAgaWYgKHJlcy5vaykge1xuICAgICAgICAgIC8vIHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDBcbiAgICAgICAgICBib2R5ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlcnJvciA9IHJlcy5zdGF0dXMgKyAocmVzLnN0YXR1c1RleHQgPyBcIiBcIiArIHJlcy5zdGF0dXNUZXh0IDogXCJcIik7XG4gICAgICAgICAgYm9keSA9IHJ0bS5nZXRUZW1wbGF0ZShcImh0dHBlcnJvclwiKS5nZXRQbGFpbigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJyID0gbmV3IFJlc3BvbnNlKGJvZHksIG15Y21kLCBjZmcpO1xuICAgICAgICBpZiAodGhpcy5kZWJ1Z01vZGUgJiYgdGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2codGhpcy5nZXRQT1NURGF0YShteWNtZCwgdHJ1ZSksIHJyLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBydG0uZ2V0VGVtcGxhdGUoXCJodHRwZXJyb3JcIikuZ2V0UGxhaW4oKTtcbiAgICAgICAgY29uc3QgcnIgPSBuZXcgUmVzcG9uc2UoYm9keSwgbXljbWQsIGNmZyk7XG4gICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0aGUgbmV4dCBwYWdlIG9mIGxpc3QgZW50cmllcyBmb3IgdGhlIGN1cnJlbnQgbGlzdCBxdWVyeVxuICAgKiBVc2VmdWwgZm9yIHRhYmxlc1xuICAgKiBAcGFyYW0gcnIgQVBJIFJlc3BvbnNlIG9mIGN1cnJlbnQgcGFnZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZSBvciBudWxsIGluIGNhc2UgdGhlcmUgYXJlIG5vIGZ1cnRoZXIgbGlzdCBlbnRyaWVzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcmVxdWVzdE5leHRSZXNwb25zZVBhZ2UocnI6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZSB8IG51bGw+IHtcbiAgICBjb25zdCBteWNtZCA9IHJyLmdldENvbW1hbmQoKTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkxBU1RcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJQYXJhbWV0ZXIgTEFTVCBpbiB1c2UuIFBsZWFzZSByZW1vdmUgaXQgdG8gYXZvaWQgaXNzdWVzIGluIHJlcXVlc3ROZXh0UGFnZS5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgbGV0IGZpcnN0ID0gMDtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkZJUlNUXCIpKSB7XG4gICAgICBmaXJzdCA9IG15Y21kLkZJUlNUO1xuICAgIH1cbiAgICBjb25zdCB0b3RhbCA9IHJyLmdldFJlY29yZHNUb3RhbENvdW50KCk7XG4gICAgY29uc3QgbGltaXQgPSByci5nZXRSZWNvcmRzTGltaXRhdGlvbigpO1xuICAgIGZpcnN0ICs9IGxpbWl0O1xuICAgIGlmIChmaXJzdCA8IHRvdGFsKSB7XG4gICAgICBteWNtZC5GSVJTVCA9IGZpcnN0O1xuICAgICAgbXljbWQuTElNSVQgPSBsaW1pdDtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QobXljbWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCBhbGwgcGFnZXMvZW50cmllcyBmb3IgdGhlIGdpdmVuIHF1ZXJ5IGNvbW1hbmRcbiAgICogQHBhcmFtIGNtZCBBUEkgbGlzdCBjb21tYW5kIHRvIHVzZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFycmF5IG9mIEFQSSBSZXNwb25zZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0QWxsUmVzcG9uc2VQYWdlcyhjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2VbXT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlczogUmVzcG9uc2VbXSA9IFtdO1xuICAgIGNvbnN0IHJyOiBSZXNwb25zZSA9IGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIGNtZCwgeyBGSVJTVDogMCB9KVxuICAgICk7XG4gICAgbGV0IHRtcDogUmVzcG9uc2UgfCBudWxsID0gcnI7XG4gICAgbGV0IGlkeCA9IDA7XG4gICAgZG8ge1xuICAgICAgcmVzcG9uc2VzW2lkeCsrXSA9IHRtcDtcbiAgICAgIHRtcCA9IGF3YWl0IHRoaXMucmVxdWVzdE5leHRSZXNwb25zZVBhZ2UodG1wKTtcbiAgICB9IHdoaWxlICh0bXAgIT09IG51bGwpO1xuICAgIHJldHVybiByZXNwb25zZXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgZGF0YSB2aWV3IHRvIGEgZ2l2ZW4gc3VidXNlclxuICAgKiBAcGFyYW0gdWlkIHN1YnVzZXIgYWNjb3VudCBuYW1lXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRVc2VyVmlldyh1aWQ6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcih1aWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGRhdGEgdmlldyBiYWNrIGZyb20gc3VidXNlciB0byB1c2VyXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyByZXNldFVzZXJWaWV3KCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcihcIlwiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBIaWdoIFBlcmZvcm1hbmNlIENvbm5lY3Rpb24gU2V0dXBcbiAgICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vaGV4b25ldC9ub2RlLXNkay9ibG9iL21hc3Rlci9SRUFETUUubWRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHVzZUhpZ2hQZXJmb3JtYW5jZUNvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgRGVmYXVsdCBDb25uZWN0aW9uIFNldHVwICh0aGUgZGVmYXVsdClcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHVzZURlZmF1bHRDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfTElWRSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE9UJkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgdXNlT1RFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX09URSk7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiMTIzNFwiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgTElWRSBTeXN0ZW0gZm9yIEFQSSBjb21tdW5pY2F0aW9uICh0aGlzIGlzIHRoZSBkZWZhdWx0IHNldHRpbmcpXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyB1c2VMSVZFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX0xJVkUpO1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShcIjU0Y2RcIik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIGdpdmVuIGNvbW1hbmQgZm9yIFBPU1QgcmVxdWVzdCBpbmNsdWRpbmcgY29ubmVjdGlvbiBjb25maWd1cmF0aW9uIGRhdGFcbiAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byBlbmNvZGVcbiAgICogQHJldHVybnMgZW5jb2RlZCBQT1NUIGRhdGEgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgZ2V0UE9TVERhdGEoY21kOiBhbnksIHNlY3VyZWQgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgbGV0IGRhdGEgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRQT1NURGF0YSgpO1xuICAgIGlmIChzZWN1cmVkKSB7XG4gICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9zX3B3PVteJl0rLywgXCJzX3B3PSoqKlwiKTtcbiAgICB9XG5cbiAgICBsZXQgdG1wID0gXCJcIjtcbiAgICBpZiAoISh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0bXAgKz0gYCR7a2V5fT0ke2NtZFtrZXldLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKX1cXG5gO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wID0gXCJcIiArIGNtZDtcbiAgICB9XG4gICAgaWYgKHNlY3VyZWQpIHtcbiAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9QQVNTV09SRD1bXlxcbl0rLywgXCJQQVNTV09SRD0qKipcIik7XG4gICAgfVxuICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9cXG4kLywgXCJcIik7XG4gICAgZGF0YSArPSBgJHtmaXhlZFVSTEVuYyhcInNfY29tbWFuZFwiKX09JHtmaXhlZFVSTEVuYyh0bXApfWA7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbiBuZXN0ZWQgYXJyYXlzIGluIGNvbW1hbmRcbiAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgKiBAcmV0dXJucyBhcGkgY29tbWFuZCB3aXRoIGZsYXR0ZW5kZWQgcGFyYW1ldGVyc1xuICAgKi9cbiAgcHJpdmF0ZSBmbGF0dGVuQ29tbWFuZChjbWQ6IGFueSk6IGFueSB7XG4gICAgY29uc3QgbmV3Y21kOiBhbnkgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjbWQpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCB2YWwgPSBjbWRba2V5XTtcbiAgICAgIGNvbnN0IG5ld0tleSA9IGtleS50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB2YWwpIHtcbiAgICAgICAgICAgIG5ld2NtZFtgJHtuZXdLZXl9JHtpbmRleH1gXSA9IChyb3cgKyBcIlwiKS5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgICAgICBuZXdjbWRbbmV3S2V5XSA9IHZhbC5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdjbWRbbmV3S2V5XSA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3Y21kO1xuICB9XG5cbiAgLyoqXG4gICAqIEF1dG8gY29udmVydCBBUEkgY29tbWFuZCBwYXJhbWV0ZXJzIHRvIHB1bnljb2RlLCBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBhcGkgY29tbWFuZCB3aXRoIElETiB2YWx1ZXMgcmVwbGFjZWQgdG8gcHVueWNvZGVcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgYXV0b0lETkNvbnZlcnQoY21kOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIGRvbid0IGNvbnZlcnQgZm9yIGNvbnZlcnRpZG4gY29tbWFuZCB0byBhdm9pZCBlbmRsZXNzIGxvb3BcbiAgICAvLyBhbmQgaWdub3JlIGNvbW1hbmRzIGluIHN0cmluZyBmb3JtYXQgKGV2ZW4gZGVwcmVjYXRlZClcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8XG4gICAgICBjbWQgaW5zdGFuY2VvZiBTdHJpbmcgfHxcbiAgICAgIC9eQ09OVkVSVElETiQvaS50ZXN0KGNtZC5DT01NQU5EKVxuICAgICkge1xuICAgICAgcmV0dXJuIGNtZDtcbiAgICB9XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNtZCkuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgIHJldHVybiAvXihET01BSU58TkFNRVNFUlZFUnxETlNaT05FKShbMC05XSopJC9pLnRlc3Qoa2V5KTtcbiAgICB9KTtcbiAgICBpZiAoIWtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY21kO1xuICAgIH1cbiAgICBjb25zdCB0b2NvbnZlcnQ6IGFueSA9IFtdO1xuICAgIGNvbnN0IGlkeHM6IHN0cmluZ1tdID0gW107XG4gICAga2V5cy5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBjbWRba2V5XSAhPT0gbnVsbCAmJlxuICAgICAgICBjbWRba2V5XSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIC9bXmEtejAtOS5cXC0gXS9pLnRlc3QoY21kW2tleV0pXG4gICAgICApIHtcbiAgICAgICAgdG9jb252ZXJ0LnB1c2goY21kW2tleV0pO1xuICAgICAgICBpZHhzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghdG9jb252ZXJ0Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNtZDtcbiAgICB9XG4gICAgY29uc3QgciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICBDT01NQU5EOiBcIkNvbnZlcnRJRE5cIixcbiAgICAgIERPTUFJTjogdG9jb252ZXJ0LFxuICAgIH0pO1xuICAgIGNvbnNvbGUuZGlyKHIuZ2V0UGxhaW4oKSk7XG4gICAgaWYgKHIuaXNTdWNjZXNzKCkpIHtcbiAgICAgIGNvbnN0IGNvbCA9IHIuZ2V0Q29sdW1uKFwiQUNFXCIpO1xuICAgICAgaWYgKGNvbCkge1xuICAgICAgICBjb2wuZ2V0RGF0YSgpLmZvckVhY2goKHBjOiBzdHJpbmcsIGlkeDogYW55KSA9PiB7XG4gICAgICAgICAgY21kW2lkeHNbaWR4XV0gPSBwYztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbWQ7XG4gIH1cbn1cbiJdfQ==