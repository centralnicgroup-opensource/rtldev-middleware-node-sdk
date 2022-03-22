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
            str + " " +
                ("(" + process.platform + "; " + process.arch + "; rv:" + rv + ")") +
                mods +
                (" node-sdk/" + this.getVersion() + " ") +
                ("node/" + process.version);
        return this;
    };
    APIClient.prototype.getUserAgent = function () {
        if (!this.ua.length) {
            this.ua =
                "NODE-SDK (" + process.platform + "; " + process.arch + "; rv:" + this.getVersion() + ") " + ("node/" + process.version);
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
        data += fixedURLEnc("s_command") + "=" + fixedURLEnc(tmp);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLFdBQVcsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsTUFBTSxDQUFDLElBQU0sMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDM0UsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcscUNBQXFDLENBQUM7QUFDaEYsTUFBTSxDQUFDLElBQU0seUJBQXlCLEdBQUcseUNBQXlDLENBQUM7QUFFbkYsSUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFLbEQ7SUE4QkU7UUFDRSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxn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QyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDL0I7Z0NBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs2QkFDaEI7d0JBQ0gsQ0FBQyxDQUFDLENBQUM7d0JBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7NEJBQ3JCLFdBQU8sR0FBRyxFQUFDO3lCQUNaO3dCQUNTLFdBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztnQ0FDM0IsT0FBTyxFQUFFLFlBQVk7Z0NBQ3JCLE1BQU0sRUFBRSxTQUFTOzZCQUNsQixDQUFDLEVBQUE7O3dCQUhJLENBQUMsR0FBRyxTQUdSO3dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzFCLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUMvQixJQUFJLEdBQUcsRUFBRTtnQ0FDUCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBVSxFQUFFLEdBQVE7b0NBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0NBQ3RCLENBQUMsQ0FBQyxDQUFDOzZCQUNKO3lCQUNGO3dCQUNELFdBQU8sR0FBRyxFQUFDOzs7O0tBQ1o7SUFobEJzQix1QkFBYSxHQUFXLE1BQU0sQ0FBQztJQWlsQnhELGdCQUFDO0NBQUEsQUFybEJELElBcWxCQztTQXJsQlksU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYWNrYWdlSW5mbyBmcm9tIFwiLi4vcGFja2FnZS5qc29uXCI7XG5pbXBvcnQgZmV0Y2ggZnJvbSBcIm5vZGUtZmV0Y2hcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xuaW1wb3J0IHsgUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZVwiO1xuaW1wb3J0IHsgUmVzcG9uc2VUZW1wbGF0ZU1hbmFnZXIgfSBmcm9tIFwiLi9yZXNwb25zZXRlbXBsYXRlbWFuYWdlclwiO1xuaW1wb3J0IHsgZml4ZWRVUkxFbmMsIFNvY2tldENvbmZpZyB9IGZyb20gXCIuL3NvY2tldGNvbmZpZ1wiO1xuXG5leHBvcnQgY29uc3QgSVNQQVBJX0NPTk5FQ1RJT05fVVJMX1BST1hZID0gXCJodHRwOi8vMTI3LjAuMC4xL2FwaS9jYWxsLmNnaVwiO1xuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9MSVZFID0gXCJodHRwczovL2FwaS5pc3BhcGkubmV0L2FwaS9jYWxsLmNnaVwiO1xuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9PVEUgPSBcImh0dHBzOi8vYXBpLW90ZS5pc3BhcGkubmV0L2FwaS9jYWxsLmNnaVwiO1xuXG5jb25zdCBydG0gPSBSZXNwb25zZVRlbXBsYXRlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIEFQSUNsaWVudCBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgQVBJQ2xpZW50IHtcbiAgLyoqXG4gICAqIEFQSSBjb25uZWN0aW9uIHRpbWVvdXQgc2V0dGluZ1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBzb2NrZXRUaW1lb3V0OiBudW1iZXIgPSAzMDAwMDA7XG4gIC8qKlxuICAgKiBVc2VyIEFnZW50IHN0cmluZ1xuICAgKi9cbiAgcHJpdmF0ZSB1YTogc3RyaW5nO1xuICAvKipcbiAgICogQVBJIGNvbm5lY3Rpb24gdXJsXG4gICAqL1xuICBwcml2YXRlIHNvY2tldFVSTDogc3RyaW5nO1xuICAvKipcbiAgICogT2JqZWN0IGNvdmVyaW5nIEFQSSBjb25uZWN0aW9uIGRhdGFcbiAgICovXG4gIHByaXZhdGUgc29ja2V0Q29uZmlnOiBTb2NrZXRDb25maWc7XG4gIC8qKlxuICAgKiBhY3Rpdml0eSBmbGFnIGZvciBkZWJ1ZyBtb2RlXG4gICAqL1xuICBwcml2YXRlIGRlYnVnTW9kZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIGFkZGl0aW9uYWwgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgKi9cbiAgcHJpdmF0ZSBjdXJsb3B0czogYW55O1xuICAvKipcbiAgICogbG9nZ2VyIGZ1bmN0aW9uIGZvciBkZWJ1ZyBtb2RlXG4gICAqL1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyIHwgbnVsbDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy51YSA9IFwiXCI7XG4gICAgdGhpcy5zb2NrZXRVUkwgPSBcIlwiO1xuICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX0xJVkUpO1xuICAgIHRoaXMuc29ja2V0Q29uZmlnID0gbmV3IFNvY2tldENvbmZpZygpO1xuICAgIHRoaXMudXNlTElWRVN5c3RlbSgpO1xuICAgIHRoaXMuY3VybG9wdHMgPSB7fTtcbiAgICB0aGlzLmxvZ2dlciA9IG51bGw7XG4gICAgdGhpcy5zZXREZWZhdWx0TG9nZ2VyKCk7XG4gIH1cblxuICAvKipcbiAgICogc2V0IGN1c3RvbSBsb2dnZXIgdG8gdXNlIGluc3RlYWQgb2YgZGVmYXVsdCBvbmVcbiAgICogQHBhcmFtIGN1c3RvbUxvZ2dlclxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0Q3VzdG9tTG9nZ2VyKGN1c3RvbUxvZ2dlcjogTG9nZ2VyKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmxvZ2dlciA9IGN1c3RvbUxvZ2dlcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogc2V0IGRlZmF1bHQgbG9nZ2VyIHRvIHVzZVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0RGVmYXVsdExvZ2dlcigpOiBBUElDbGllbnQge1xuICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBFbmFibGUgRGVidWcgT3V0cHV0IHRvIFNURE9VVFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgZW5hYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5kZWJ1Z01vZGUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2FibGUgRGVidWcgT3V0cHV0XG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBkaXNhYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5kZWJ1Z01vZGUgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIEFQSSBTZXNzaW9uIHRoYXQgaXMgY3VycmVudGx5IHNldFxuICAgKiBAcmV0dXJucyBBUEkgU2Vzc2lvbiBvciBudWxsXG4gICAqL1xuICBwdWJsaWMgZ2V0U2Vzc2lvbigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBzZXNzaWQgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCk7XG4gICAgcmV0dXJuIHNlc3NpZCA9PT0gXCJcIiA/IG51bGwgOiBzZXNzaWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBBUEkgY29ubmVjdGlvbiB1cmwgdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAqIEByZXR1cm5zIEFQSSBjb25uZWN0aW9uIHVybCBjdXJyZW50bHkgaW4gdXNlXG4gICAqL1xuICBwdWJsaWMgZ2V0VVJMKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0VVJMO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvc3NpYmlsaXR5IHRvIGN1c3RvbWl6ZSBkZWZhdWx0IHVzZXIgYWdlbnQgdG8gZml0IHlvdXIgbmVlZHNcbiAgICogQHBhcmFtIHN0ciB1c2VyIGFnZW50IGxhYmVsXG4gICAqIEBwYXJhbSBydiByZXZpc2lvbiBvZiB1c2VyIGFnZW50XG4gICAqIEBwYXJhbSBtb2R1bGVzIGZ1cnRoZXIgbW9kdWxlcyB0byBhZGQgdG8gdXNlciBhZ2VudCBzdHJpbmcsIGZvcm1hdDogW1wiPG1vZDE+LzxyZXY+XCIsIFwiPG1vZDI+LzxyZXY+XCIsIC4uLiBdXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRVc2VyQWdlbnQoc3RyOiBzdHJpbmcsIHJ2OiBzdHJpbmcsIG1vZHVsZXM6IGFueSA9IFtdKTogQVBJQ2xpZW50IHtcbiAgICBjb25zdCBtb2RzID0gbW9kdWxlcy5sZW5ndGggPyBcIiBcIiArIG1vZHVsZXMuam9pbihcIiBcIikgOiBcIlwiO1xuICAgIHRoaXMudWEgPVxuICAgICAgYCR7c3RyfSBgICtcbiAgICAgIGAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgJHtwcm9jZXNzLmFyY2h9OyBydjoke3J2fSlgICtcbiAgICAgIG1vZHMgK1xuICAgICAgYCBub2RlLXNkay8ke3RoaXMuZ2V0VmVyc2lvbigpfSBgICtcbiAgICAgIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWA7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBVc2VyIEFnZW50XG4gICAqIEByZXR1cm5zIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnVhLmxlbmd0aCkge1xuICAgICAgdGhpcy51YSA9XG4gICAgICAgIGBOT0RFLVNESyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgJHtcbiAgICAgICAgICBwcm9jZXNzLmFyY2hcbiAgICAgICAgfTsgcnY6JHt0aGlzLmdldFZlcnNpb24oKX0pIGAgKyBgbm9kZS8ke3Byb2Nlc3MudmVyc2lvbn1gO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHByb3h5IHNlcnZlciB0byB1c2UgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSBwcm94eSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBjb21tdW5pY2F0aW9cbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFByb3h5KHByb3h5OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuY3VybG9wdHMucHJveHkgPSBwcm94eTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHByb3h5IHNlcnZlciBjb25maWd1cmF0aW9uXG4gICAqIEByZXR1cm5zIHByb3h5IHNlcnZlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgKi9cbiAgcHVibGljIGdldFByb3h5KCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJwcm94eVwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucHJveHk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgcmVmZXJlciB0byB1c2UgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSByZWZlcmVyIFJlZmVyZXJcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFJlZmVyZXIocmVmZXJlcjogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmN1cmxvcHRzLnJlZmVyZXIgPSByZWZlcmVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcmVmZXJlciBjb25maWd1cmF0aW9uXG4gICAqIEByZXR1cm5zIHJlZmVyZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICovXG4gIHB1YmxpYyBnZXRSZWZlcmVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJyZWZlcmVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJsb3B0cy5yZWZlcmVyO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgbW9kdWxlIHZlcnNpb25cbiAgICogQHJldHVybnMgbW9kdWxlIHZlcnNpb25cbiAgICovXG4gIHB1YmxpYyBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhY2thZ2VJbmZvLnZlcnNpb247XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgc2Vzc2lvbiBkYXRhIChzZXNzaW9uIGlkIGFuZCBzeXN0ZW0gZW50aXR5KSB0byBnaXZlbiBjbGllbnQgcmVxdWVzdCBzZXNzaW9uXG4gICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2F2ZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICBzZXNzaW9uLnNvY2tldGNmZyA9IHtcbiAgICAgIGVudGl0eTogdGhpcy5zb2NrZXRDb25maWcuZ2V0U3lzdGVtRW50aXR5KCksXG4gICAgICBzZXNzaW9uOiB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCksXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgZXhpc3RpbmcgY29uZmlndXJhdGlvbiBvdXQgb2YgQ2xpZW50UmVxdWVzdCBzZXNzaW9uXG4gICAqIHRvIHJlYnVpbGQgYW5kIHJldXNlIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICogQHBhcmFtIHNlc3Npb24gQ2xpZW50UmVxdWVzdCBzZXNzaW9uIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyByZXVzZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoc2Vzc2lvbi5zb2NrZXRjZmcuZW50aXR5KTtcbiAgICB0aGlzLnNldFNlc3Npb24oc2Vzc2lvbi5zb2NrZXRjZmcuc2Vzc2lvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFub3RoZXIgY29ubmVjdGlvbiB1cmwgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHZhbHVlIEFQSSBjb25uZWN0aW9uIHVybCB0byBzZXRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFVSTCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldFVSTCA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBvbmUgdGltZSBwYXNzd29yZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdmFsdWUgb25lIHRpbWUgcGFzc3dvcmRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldE9UUCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRPVFAodmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbiBBUEkgc2Vzc2lvbiBpZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdmFsdWUgQVBJIHNlc3Npb24gaWRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFNlc3Npb24odmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U2Vzc2lvbih2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFuIFJlbW90ZSBJUCBBZGRyZXNzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIFRvIGJlIHVzZWQgaW4gY2FzZSB5b3UgaGF2ZSBhbiBhY3RpdmUgaXAgZmlsdGVyIHNldHRpbmcuXG4gICAqIEBwYXJhbSB2YWx1ZSBSZW1vdGUgSVAgQWRkcmVzc1xuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0UmVtb3RlSVBBZGRyZXNzKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFJlbW90ZUFkZHJlc3ModmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgKiBAcGFyYW0gcHcgYWNjb3VudCBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0Q3JlZGVudGlhbHModWlkOiBzdHJpbmcsIHB3OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldExvZ2luKHVpZCk7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UGFzc3dvcmQocHcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgKiBAcGFyYW0gcm9sZSByb2xlIHVzZXIgaWRcbiAgICogQHBhcmFtIHB3IHJvbGUgdXNlciBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0Um9sZUNyZWRlbnRpYWxzKHVpZDogc3RyaW5nLCByb2xlOiBzdHJpbmcsIHB3OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHJldHVybiB0aGlzLnNldENyZWRlbnRpYWxzKHJvbGUgPyBgJHt1aWR9ISR7cm9sZX1gIDogdWlkLCBwdyk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBBUEkgbG9naW4gdG8gc3RhcnQgc2Vzc2lvbi1iYXNlZCBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSBvdHAgb3B0aW9uYWwgb25lIHRpbWUgcGFzc3dvcmRcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBsb2dpbihvdHAgPSBcIlwiKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHRoaXMuc2V0T1RQKG90cCB8fCBcIlwiKTtcbiAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7IENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIgfSk7XG4gICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICBjb25zdCBjb2wgPSByci5nZXRDb2x1bW4oXCJTRVNTSU9OXCIpO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uKGNvbCA/IGNvbC5nZXREYXRhKClbMF0gOiBcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJyO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gQVBJIGxvZ2luIHRvIHN0YXJ0IHNlc3Npb24tYmFzZWQgY29tbXVuaWNhdGlvbi5cbiAgICogVXNlIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHBhcmFtcyBnaXZlbiBzcGVjaWZpYyBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGxvZ2luRXh0ZW5kZWQocGFyYW1zOiBhbnksIG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgdGhpcy5zZXRPVFAob3RwKTtcbiAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICBDT01NQU5EOiBcIlN0YXJ0U2Vzc2lvblwiLFxuICAgICAgICB9LFxuICAgICAgICBwYXJhbXNcbiAgICAgIClcbiAgICApO1xuICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgfVxuICAgIHJldHVybiBycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIEFQSSBsb2dvdXQgdG8gY2xvc2UgQVBJIHNlc3Npb24gaW4gdXNlXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgbG9nb3V0KCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICBDT01NQU5EOiBcIkVuZFNlc3Npb25cIixcbiAgICB9KTtcbiAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgIHRoaXMuc2V0U2Vzc2lvbihcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJyO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gQVBJIHJlcXVlc3QgdXNpbmcgdGhlIGdpdmVuIGNvbW1hbmRcbiAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byByZXF1ZXN0XG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcmVxdWVzdChjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAvLyBmbGF0dGVuIG5lc3RlZCBhcGkgY29tbWFuZCBidWxrIHBhcmFtZXRlcnNcbiAgICBsZXQgbXljbWQgPSB0aGlzLmZsYXR0ZW5Db21tYW5kKGNtZCk7XG5cbiAgICAvLyBhdXRvIGNvbnZlcnQgdW1sYXV0IG5hbWVzIHRvIHB1bnljb2RlXG4gICAgbXljbWQgPSBhd2FpdCB0aGlzLmF1dG9JRE5Db252ZXJ0KG15Y21kKTtcblxuICAgIC8vIHJlcXVlc3QgY29tbWFuZCB0byBBUElcbiAgICBjb25zdCBjZmc6IGFueSA9IHtcbiAgICAgIENPTk5FQ1RJT05fVVJMOiB0aGlzLnNvY2tldFVSTCxcbiAgICB9O1xuICAgIC8vIFRPRE86IDMwMHMgKHRvIGJlIHN1cmUgdG8gZ2V0IGFuIEFQSSByZXNwb25zZSlcbiAgICBjb25zdCByZXFDZmc6IGFueSA9IHtcbiAgICAgIC8vZW5jb2Rpbmc6IFwidXRmOFwiLCAvL2RlZmF1bHQgZm9yIHR5cGUgc3RyaW5nXG4gICAgICAvL2d6aXA6IHRydWUsXG4gICAgICBib2R5OiB0aGlzLmdldFBPU1REYXRhKG15Y21kKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJVc2VyLUFnZW50XCI6IHRoaXMuZ2V0VXNlckFnZW50KCksXG4gICAgICB9LFxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIHRpbWVvdXQ6IEFQSUNsaWVudC5zb2NrZXRUaW1lb3V0LFxuICAgICAgdXJsOiBjZmcuQ09OTkVDVElPTl9VUkwsXG4gICAgfTtcbiAgICBjb25zdCBwcm94eSA9IHRoaXMuZ2V0UHJveHkoKTtcbiAgICBpZiAocHJveHkpIHtcbiAgICAgIHJlcUNmZy5wcm94eSA9IHByb3h5O1xuICAgIH1cbiAgICBjb25zdCByZWZlcmVyID0gdGhpcy5nZXRSZWZlcmVyKCk7XG4gICAgaWYgKHJlZmVyZXIpIHtcbiAgICAgIHJlcUNmZy5oZWFkZXJzLlJlZmVyZXIgPSByZWZlcmVyO1xuICAgIH1cbiAgICByZXR1cm4gZmV0Y2goY2ZnLkNPTk5FQ1RJT05fVVJMLCByZXFDZmcpXG4gICAgICAudGhlbihhc3luYyAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGJvZHk7XG4gICAgICAgIGlmIChyZXMub2spIHtcbiAgICAgICAgICAvLyByZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwXG4gICAgICAgICAgYm9keSA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXJyb3IgPSByZXMuc3RhdHVzICsgKHJlcy5zdGF0dXNUZXh0ID8gXCIgXCIgKyByZXMuc3RhdHVzVGV4dCA6IFwiXCIpO1xuICAgICAgICAgIGJvZHkgPSBydG0uZ2V0VGVtcGxhdGUoXCJodHRwZXJyb3JcIikuZ2V0UGxhaW4oKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByciA9IG5ldyBSZXNwb25zZShib2R5LCBteWNtZCwgY2ZnKTtcbiAgICAgICAgaWYgKHRoaXMuZGVidWdNb2RlICYmIHRoaXMubG9nZ2VyKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIubG9nKHRoaXMuZ2V0UE9TVERhdGEobXljbWQsIHRydWUpLCByciwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zdCBib2R5ID0gcnRtLmdldFRlbXBsYXRlKFwiaHR0cGVycm9yXCIpLmdldFBsYWluKCk7XG4gICAgICAgIGNvbnN0IHJyID0gbmV3IFJlc3BvbnNlKGJvZHksIG15Y21kLCBjZmcpO1xuICAgICAgICBpZiAodGhpcy5kZWJ1Z01vZGUgJiYgdGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2codGhpcy5nZXRQT1NURGF0YShteWNtZCwgdHJ1ZSksIHJyLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgdGhlIG5leHQgcGFnZSBvZiBsaXN0IGVudHJpZXMgZm9yIHRoZSBjdXJyZW50IGxpc3QgcXVlcnlcbiAgICogVXNlZnVsIGZvciB0YWJsZXNcbiAgICogQHBhcmFtIHJyIEFQSSBSZXNwb25zZSBvZiBjdXJyZW50IHBhZ2VcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2Ugb3IgbnVsbCBpbiBjYXNlIHRoZXJlIGFyZSBubyBmdXJ0aGVyIGxpc3QgZW50cmllc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHJlcXVlc3ROZXh0UmVzcG9uc2VQYWdlKHJyOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2UgfCBudWxsPiB7XG4gICAgY29uc3QgbXljbWQgPSByci5nZXRDb21tYW5kKCk7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChteWNtZCwgXCJMQVNUXCIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiUGFyYW1ldGVyIExBU1QgaW4gdXNlLiBQbGVhc2UgcmVtb3ZlIGl0IHRvIGF2b2lkIGlzc3VlcyBpbiByZXF1ZXN0TmV4dFBhZ2UuXCJcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCBmaXJzdCA9IDA7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChteWNtZCwgXCJGSVJTVFwiKSkge1xuICAgICAgZmlyc3QgPSBteWNtZC5GSVJTVDtcbiAgICB9XG4gICAgY29uc3QgdG90YWwgPSByci5nZXRSZWNvcmRzVG90YWxDb3VudCgpO1xuICAgIGNvbnN0IGxpbWl0ID0gcnIuZ2V0UmVjb3Jkc0xpbWl0YXRpb24oKTtcbiAgICBmaXJzdCArPSBsaW1pdDtcbiAgICBpZiAoZmlyc3QgPCB0b3RhbCkge1xuICAgICAgbXljbWQuRklSU1QgPSBmaXJzdDtcbiAgICAgIG15Y21kLkxJTUlUID0gbGltaXQ7XG4gICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG15Y21kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgYWxsIHBhZ2VzL2VudHJpZXMgZm9yIHRoZSBnaXZlbiBxdWVyeSBjb21tYW5kXG4gICAqIEBwYXJhbSBjbWQgQVBJIGxpc3QgY29tbWFuZCB0byB1c2VcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBhcnJheSBvZiBBUEkgUmVzcG9uc2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcmVxdWVzdEFsbFJlc3BvbnNlUGFnZXMoY21kOiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlW10+IHtcbiAgICBjb25zdCByZXNwb25zZXM6IFJlc3BvbnNlW10gPSBbXTtcbiAgICBjb25zdCBycjogUmVzcG9uc2UgPSBhd2FpdCB0aGlzLnJlcXVlc3QoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCBjbWQsIHsgRklSU1Q6IDAgfSlcbiAgICApO1xuICAgIGxldCB0bXA6IFJlc3BvbnNlIHwgbnVsbCA9IHJyO1xuICAgIGxldCBpZHggPSAwO1xuICAgIGRvIHtcbiAgICAgIHJlc3BvbnNlc1tpZHgrK10gPSB0bXA7XG4gICAgICB0bXAgPSBhd2FpdCB0aGlzLnJlcXVlc3ROZXh0UmVzcG9uc2VQYWdlKHRtcCk7XG4gICAgfSB3aGlsZSAodG1wICE9PSBudWxsKTtcbiAgICByZXR1cm4gcmVzcG9uc2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIGRhdGEgdmlldyB0byBhIGdpdmVuIHN1YnVzZXJcbiAgICogQHBhcmFtIHVpZCBzdWJ1c2VyIGFjY291bnQgbmFtZVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0VXNlclZpZXcodWlkOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFVzZXIodWlkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBkYXRhIHZpZXcgYmFjayBmcm9tIHN1YnVzZXIgdG8gdXNlclxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgcmVzZXRVc2VyVmlldygpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFVzZXIoXCJcIik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgSGlnaCBQZXJmb3JtYW5jZSBDb25uZWN0aW9uIFNldHVwXG4gICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2hleG9uZXQvbm9kZS1zZGsvYmxvYi9tYXN0ZXIvUkVBRE1FLm1kXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyB1c2VIaWdoUGVyZm9ybWFuY2VDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfUFJPWFkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIERlZmF1bHQgQ29ubmVjdGlvbiBTZXR1cCAodGhlIGRlZmF1bHQpXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyB1c2VEZWZhdWx0Q29ubmVjdGlvblNldHVwKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX0xJVkUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBPVCZFIFN5c3RlbSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHVzZU9URVN5c3RlbSgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9PVEUpO1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShcIjEyMzRcIik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IExJVkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvbiAodGhpcyBpcyB0aGUgZGVmYXVsdCBzZXR0aW5nKVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgdXNlTElWRVN5c3RlbSgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9MSVZFKTtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoXCI1NGNkXCIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSBnaXZlbiBjb21tYW5kIGZvciBQT1NUIHJlcXVlc3QgaW5jbHVkaW5nIGNvbm5lY3Rpb24gY29uZmlndXJhdGlvbiBkYXRhXG4gICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdG8gZW5jb2RlXG4gICAqIEByZXR1cm5zIGVuY29kZWQgUE9TVCBkYXRhIHN0cmluZ1xuICAgKi9cbiAgcHVibGljIGdldFBPU1REYXRhKGNtZDogYW55LCBzZWN1cmVkID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGxldCBkYXRhID0gdGhpcy5zb2NrZXRDb25maWcuZ2V0UE9TVERhdGEoKTtcbiAgICBpZiAoc2VjdXJlZCkge1xuICAgICAgZGF0YSA9IGRhdGEucmVwbGFjZSgvc19wdz1bXiZdKy8sIFwic19wdz0qKipcIik7XG4gICAgfVxuXG4gICAgbGV0IHRtcCA9IFwiXCI7XG4gICAgaWYgKCEodHlwZW9mIGNtZCA9PT0gXCJzdHJpbmdcIiB8fCBjbWQgaW5zdGFuY2VvZiBTdHJpbmcpKSB7XG4gICAgICBPYmplY3Qua2V5cyhjbWQpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChjbWRba2V5XSAhPT0gbnVsbCAmJiBjbWRba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdG1wICs9IGAke2tleX09JHtjbWRba2V5XS50b1N0cmluZygpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIil9XFxuYDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCA9IFwiXCIgKyBjbWQ7XG4gICAgfVxuICAgIGlmIChzZWN1cmVkKSB7XG4gICAgICB0bXAgPSB0bXAucmVwbGFjZSgvUEFTU1dPUkQ9W15cXG5dKy8sIFwiUEFTU1dPUkQ9KioqXCIpO1xuICAgIH1cbiAgICB0bXAgPSB0bXAucmVwbGFjZSgvXFxuJC8sIFwiXCIpO1xuICAgIGRhdGEgKz0gYCR7Zml4ZWRVUkxFbmMoXCJzX2NvbW1hbmRcIil9PSR7Zml4ZWRVUkxFbmModG1wKX1gO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsYXR0ZW4gbmVzdGVkIGFycmF5cyBpbiBjb21tYW5kXG4gICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICogQHJldHVybnMgYXBpIGNvbW1hbmQgd2l0aCBmbGF0dGVuZGVkIHBhcmFtZXRlcnNcbiAgICovXG4gIHByaXZhdGUgZmxhdHRlbkNvbW1hbmQoY21kOiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IG5ld2NtZDogYW55ID0ge307XG4gICAgT2JqZWN0LmtleXMoY21kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgdmFsID0gY21kW2tleV07XG4gICAgICBjb25zdCBuZXdLZXkgPSBrZXkudG9VcHBlckNhc2UoKTtcbiAgICAgIGlmICh2YWwgIT09IG51bGwgJiYgdmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdmFsKSB7XG4gICAgICAgICAgICBuZXdjbWRbYCR7bmV3S2V5fSR7aW5kZXh9YF0gPSAocm93ICsgXCJcIikucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICAgICAgbmV3Y21kW25ld0tleV0gPSB2YWwucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3Y21kW25ld0tleV0gPSB2YWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ld2NtZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdXRvIGNvbnZlcnQgQVBJIGNvbW1hbmQgcGFyYW1ldGVycyB0byBwdW55Y29kZSwgaWYgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0gY21kIGFwaSBjb21tYW5kXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXBpIGNvbW1hbmQgd2l0aCBJRE4gdmFsdWVzIHJlcGxhY2VkIHRvIHB1bnljb2RlXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGF1dG9JRE5Db252ZXJ0KGNtZDogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBkb24ndCBjb252ZXJ0IGZvciBjb252ZXJ0aWRuIGNvbW1hbmQgdG8gYXZvaWQgZW5kbGVzcyBsb29wXG4gICAgLy8gYW5kIGlnbm9yZSBjb21tYW5kcyBpbiBzdHJpbmcgZm9ybWF0IChldmVuIGRlcHJlY2F0ZWQpXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGNtZCA9PT0gXCJzdHJpbmdcIiB8fFxuICAgICAgY21kIGluc3RhbmNlb2YgU3RyaW5nIHx8XG4gICAgICAvXkNPTlZFUlRJRE4kL2kudGVzdChjbWQuQ09NTUFORClcbiAgICApIHtcbiAgICAgIHJldHVybiBjbWQ7XG4gICAgfVxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjbWQpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICByZXR1cm4gL14oRE9NQUlOfE5BTUVTRVJWRVJ8RE5TWk9ORSkoWzAtOV0qKSQvaS50ZXN0KGtleSk7XG4gICAgfSk7XG4gICAgaWYgKCFrZXlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNtZDtcbiAgICB9XG4gICAgY29uc3QgdG9jb252ZXJ0OiBhbnkgPSBbXTtcbiAgICBjb25zdCBpZHhzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGtleXMuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgY21kW2tleV0gIT09IG51bGwgJiZcbiAgICAgICAgY21kW2tleV0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAvW15hLXowLTkuXFwtIF0vaS50ZXN0KGNtZFtrZXldKVxuICAgICAgKSB7XG4gICAgICAgIHRvY29udmVydC5wdXNoKGNtZFtrZXldKTtcbiAgICAgICAgaWR4cy5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXRvY29udmVydC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjbWQ7XG4gICAgfVxuICAgIGNvbnN0IHIgPSBhd2FpdCB0aGlzLnJlcXVlc3Qoe1xuICAgICAgQ09NTUFORDogXCJDb252ZXJ0SUROXCIsXG4gICAgICBET01BSU46IHRvY29udmVydCxcbiAgICB9KTtcbiAgICBjb25zb2xlLmRpcihyLmdldFBsYWluKCkpO1xuICAgIGlmIChyLmlzU3VjY2VzcygpKSB7XG4gICAgICBjb25zdCBjb2wgPSByLmdldENvbHVtbihcIkFDRVwiKTtcbiAgICAgIGlmIChjb2wpIHtcbiAgICAgICAgY29sLmdldERhdGEoKS5mb3JFYWNoKChwYzogc3RyaW5nLCBpZHg6IGFueSkgPT4ge1xuICAgICAgICAgIGNtZFtpZHhzW2lkeF1dID0gcGM7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY21kO1xuICB9XG59XG4iXX0=