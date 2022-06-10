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
import packageInfo from "../package.json" assert { type: "json" };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLFdBQVcsTUFBTSxpQkFBaUIsQ0FBQyxTQUFTLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNsRSxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsTUFBTSxDQUFDLElBQU0sMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7QUFDM0UsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcscUNBQXFDLENBQUM7QUFDaEYsTUFBTSxDQUFDLElBQU0seUJBQXlCLEdBQUcseUNBQXlDLENBQUM7QUFFbkYsSUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFLbEQ7SUE4QkU7UUFDRSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFPTSxtQ0FBZSxHQUF0QixVQUF1QixZQUFvQjtRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFLTSxvQ0FBZ0IsR0FBdkI7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBS00sbUNBQWUsR0FBdEI7UUFDRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFNTSxvQ0FBZ0IsR0FBdkI7UUFDRSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFNTSw4QkFBVSxHQUFqQjtRQUNFLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDOUMsT0FBTyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN2QyxDQUFDO0lBTU0sMEJBQU0sR0FBYjtRQUNFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBU00sZ0NBQVksR0FBbkIsVUFBb0IsR0FBVyxFQUFFLEVBQVUsRUFBRSxPQUFpQjtRQUFqQix3QkFBQSxFQUFBLFlBQWlCO1FBQzVELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDM0QsSUFBSSxDQUFDLEVBQUU7WUFDTCxVQUFHLEdBQUcsTUFBRztnQkFDVCxXQUFJLE9BQU8sQ0FBQyxRQUFRLGVBQUssT0FBTyxDQUFDLElBQUksa0JBQVEsRUFBRSxNQUFHO2dCQUNsRCxJQUFJO2dCQUNKLG9CQUFhLElBQUksQ0FBQyxVQUFVLEVBQUUsTUFBRztnQkFDakMsZUFBUSxPQUFPLENBQUMsT0FBTyxDQUFFLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBTU0sZ0NBQVksR0FBbkI7UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsb0JBQWEsT0FBTyxDQUFDLFFBQVEsZUFDM0IsT0FBTyxDQUFDLElBQUksa0JBQ04sSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFJLEdBQUcsZUFBUSxPQUFPLENBQUMsT0FBTyxDQUFFLENBQUM7U0FDN0Q7UUFDRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQU9NLDRCQUFRLEdBQWYsVUFBZ0IsS0FBYTtRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBTU0sNEJBQVEsR0FBZjtRQUNFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDaEUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUM1QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU9NLDhCQUFVLEdBQWpCLFVBQWtCLE9BQWU7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU1NLDhCQUFVLEdBQWpCO1FBQ0UsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNsRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBTU0sOEJBQVUsR0FBakI7UUFDRSxPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUM7SUFDN0IsQ0FBQztJQU9NLCtCQUFXLEdBQWxCLFVBQW1CLE9BQVk7UUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRztZQUNsQixNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUU7WUFDM0MsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO1NBQ3hDLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFRTSxnQ0FBWSxHQUFuQixVQUFvQixPQUFZO1FBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU9NLDBCQUFNLEdBQWIsVUFBYyxLQUFhO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU9NLDBCQUFNLEdBQWIsVUFBYyxLQUFhO1FBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU9NLDhCQUFVLEdBQWpCLFVBQWtCLEtBQWE7UUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBUU0sc0NBQWtCLEdBQXpCLFVBQTBCLEtBQWE7UUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFRTSxrQ0FBYyxHQUFyQixVQUFzQixHQUFXLEVBQUUsRUFBVTtRQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFTTSxzQ0FBa0IsR0FBekIsVUFBMEIsR0FBVyxFQUFFLElBQVksRUFBRSxFQUFVO1FBQzdELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQUcsR0FBRyxjQUFJLElBQUksQ0FBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQU9ZLHlCQUFLLEdBQWxCLFVBQW1CLEdBQVE7UUFBUixvQkFBQSxFQUFBLFFBQVE7Ozs7Ozt3QkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQ1osV0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUE7O3dCQUFwRCxFQUFFLEdBQUcsU0FBK0M7d0JBQzFELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNaLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDOUM7d0JBQ0QsV0FBTyxFQUFFLEVBQUM7Ozs7S0FDWDtJQVNZLGlDQUFhLEdBQTFCLFVBQTJCLE1BQVcsRUFBRSxHQUFRO1FBQVIsb0JBQUEsRUFBQSxRQUFROzs7Ozs7d0JBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ04sV0FBTSxJQUFJLENBQUMsT0FBTyxDQUMzQixNQUFNLENBQUMsTUFBTSxDQUNYO2dDQUNFLE9BQU8sRUFBRSxjQUFjOzZCQUN4QixFQUNELE1BQU0sQ0FDUCxDQUNGLEVBQUE7O3dCQVBLLEVBQUUsR0FBRyxTQU9WO3dCQUNELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNaLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDOUM7d0JBQ0QsV0FBTyxFQUFFLEVBQUM7Ozs7S0FDWDtJQU1ZLDBCQUFNLEdBQW5COzs7Ozs0QkFDYSxXQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7NEJBQzVCLE9BQU8sRUFBRSxZQUFZO3lCQUN0QixDQUFDLEVBQUE7O3dCQUZJLEVBQUUsR0FBRyxTQUVUO3dCQUNGLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUNyQjt3QkFDRCxXQUFPLEVBQUUsRUFBQzs7OztLQUNYO0lBT1ksMkJBQU8sR0FBcEIsVUFBcUIsR0FBUTs7Ozs7Ozt3QkFFdkIsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBRzdCLFdBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBQXhDLEtBQUssR0FBRyxTQUFnQyxDQUFDO3dCQUduQyxHQUFHLEdBQVE7NEJBQ2YsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTO3lCQUMvQixDQUFDO3dCQUVJLE1BQU0sR0FBUTs0QkFHbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDOzRCQUM3QixPQUFPLEVBQUU7Z0NBQ1AsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUU7NkJBQ2xDOzRCQUNELE1BQU0sRUFBRSxNQUFNOzRCQUNkLE9BQU8sRUFBRSxTQUFTLENBQUMsYUFBYTs0QkFDaEMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxjQUFjO3lCQUN4QixDQUFDO3dCQUNJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQzlCLElBQUksS0FBSyxFQUFFOzRCQUNULE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO3lCQUN0Qjt3QkFDSyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNsQyxJQUFJLE9BQU8sRUFBRTs0QkFDWCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7eUJBQ2xDO3dCQUNELFdBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO2lDQUNyQyxJQUFJLENBQUMsVUFBTyxHQUFROzs7Ozs0Q0FDZixLQUFLLEdBQUcsSUFBSSxDQUFDO2lEQUViLEdBQUcsQ0FBQyxFQUFFLEVBQU4sY0FBTTs0Q0FFRCxXQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7NENBQXZCLElBQUksR0FBRyxTQUFnQixDQUFDOzs7NENBRXhCLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRDQUNsRSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7OzRDQUUzQyxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzs0Q0FDMUMsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0RBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzs2Q0FDM0Q7NENBQ0QsV0FBTyxFQUFFLEVBQUM7OztpQ0FDWCxDQUFDO2lDQUNELEtBQUssQ0FBQyxVQUFDLEdBQUc7Z0NBQ1QsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQ0FDckQsSUFBTSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztnQ0FDMUMsSUFBSSxLQUFJLENBQUMsU0FBUyxJQUFJLEtBQUksQ0FBQyxNQUFNLEVBQUU7b0NBQ2pDLEtBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7aUNBQ2pFO2dDQUNELE9BQU8sR0FBRyxDQUFDOzRCQUNiLENBQUMsQ0FBQyxFQUFDOzs7O0tBQ047SUFRWSwyQ0FBdUIsR0FBcEMsVUFBcUMsRUFBWTs7OztnQkFDekMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFO29CQUN2RCxNQUFNLElBQUksS0FBSyxDQUNiLDZFQUE2RSxDQUM5RSxDQUFDO2lCQUNIO2dCQUNHLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFO29CQUN4RCxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztpQkFDckI7Z0JBQ0ssS0FBSyxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUNsQyxLQUFLLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3hDLEtBQUssSUFBSSxLQUFLLENBQUM7Z0JBQ2YsSUFBSSxLQUFLLEdBQUcsS0FBSyxFQUFFO29CQUNqQixLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDcEIsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBQ3BCLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBQztpQkFDNUI7cUJBQU07b0JBQ0wsV0FBTyxJQUFJLEVBQUM7aUJBQ2I7Ozs7S0FDRjtJQU9ZLDJDQUF1QixHQUFwQyxVQUFxQyxHQUFROzs7Ozs7d0JBQ3JDLFNBQVMsR0FBZSxFQUFFLENBQUM7d0JBQ1osV0FBTSxJQUFJLENBQUMsT0FBTyxDQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FDckMsRUFBQTs7d0JBRkssRUFBRSxHQUFhLFNBRXBCO3dCQUNHLEdBQUcsR0FBb0IsRUFBRSxDQUFDO3dCQUMxQixHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7d0JBRVYsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO3dCQUNqQixXQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0JBQTdDLEdBQUcsR0FBRyxTQUF1QyxDQUFDOzs7NEJBQ3ZDLEdBQUcsS0FBSyxJQUFJOzs0QkFDckIsV0FBTyxTQUFTLEVBQUM7Ozs7S0FDbEI7SUFPTSwrQkFBVyxHQUFsQixVQUFtQixHQUFXO1FBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU1NLGlDQUFhLEdBQXBCO1FBQ0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBT00scURBQWlDLEdBQXhDO1FBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU1NLDZDQUF5QixHQUFoQztRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFNTSxnQ0FBWSxHQUFuQjtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFNTSxpQ0FBYSxHQUFwQjtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFPTSwrQkFBVyxHQUFsQixVQUFtQixHQUFRLEVBQUUsT0FBZTtRQUFmLHdCQUFBLEVBQUEsZUFBZTtRQUMxQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsWUFBWSxNQUFNLENBQUMsRUFBRTtZQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQVc7Z0JBQ25DLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUMvQyxHQUFHLElBQUksVUFBRyxHQUFHLGNBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQUksQ0FBQztpQkFDaEU7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztTQUNoQjtRQUNELElBQUksT0FBTyxFQUFFO1lBQ1gsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0IsSUFBSSxJQUFJLFVBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDO1FBQzFELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQU9PLGtDQUFjLEdBQXRCLFVBQXVCLEdBQVE7UUFDN0IsSUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBVztZQUNuQyxJQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pDLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUNyQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3RCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztvQkFDZCxLQUFrQixVQUFHLEVBQUgsV0FBRyxFQUFILGlCQUFHLEVBQUgsSUFBRyxFQUFFO3dCQUFsQixJQUFNLEdBQUcsWUFBQTt3QkFDWixNQUFNLENBQUMsVUFBRyxNQUFNLFNBQUcsS0FBSyxDQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUMvRCxLQUFLLEVBQUUsQ0FBQztxQkFDVDtpQkFDRjtxQkFBTTtvQkFDTCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLFlBQVksTUFBTSxFQUFFO3dCQUNwRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQzVDO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7cUJBQ3RCO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFPYSxrQ0FBYyxHQUE1QixVQUE2QixHQUFROzs7Ozs7d0JBR25DLElBQ0UsT0FBTyxHQUFHLEtBQUssUUFBUTs0QkFDdkIsR0FBRyxZQUFZLE1BQU07NEJBQ3JCLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUNqQzs0QkFDQSxXQUFPLEdBQUcsRUFBQzt5QkFDWjt3QkFDSyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHOzRCQUN2QyxPQUFPLHdDQUF3QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDNUQsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ2hCLFdBQU8sR0FBRyxFQUFDO3lCQUNaO3dCQUNLLFNBQVMsR0FBUSxFQUFFLENBQUM7d0JBQ3BCLElBQUksR0FBYSxFQUFFLENBQUM7d0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFXOzRCQUN2QixJQUNFLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJO2dDQUNqQixHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUztnQ0FDdEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMvQjtnQ0FDQSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzZCQUNoQjt3QkFDSCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTs0QkFDckIsV0FBTyxHQUFHLEVBQUM7eUJBQ1o7d0JBQ1MsV0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDO2dDQUMzQixPQUFPLEVBQUUsWUFBWTtnQ0FDckIsTUFBTSxFQUFFLFNBQVM7NkJBQ2xCLENBQUMsRUFBQTs7d0JBSEksQ0FBQyxHQUFHLFNBR1I7d0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7NEJBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQy9CLElBQUksR0FBRyxFQUFFO2dDQUNQLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFVLEVBQUUsR0FBUTtvQ0FDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQ0FDdEIsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7eUJBQ0Y7d0JBQ0QsV0FBTyxHQUFHLEVBQUM7Ozs7S0FDWjtJQWhsQnNCLHVCQUFhLEdBQVcsTUFBTSxDQUFDO0lBaWxCeEQsZ0JBQUM7Q0FBQSxBQXJsQkQsSUFxbEJDO1NBcmxCWSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhY2thZ2VJbmZvIGZyb20gXCIuLi9wYWNrYWdlLmpzb25cIiBhc3NlcnQgeyB0eXBlOiBcImpzb25cIiB9O1xuaW1wb3J0IGZldGNoIGZyb20gXCJub2RlLWZldGNoXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcbmltcG9ydCB7IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyIH0gZnJvbSBcIi4vcmVzcG9uc2V0ZW1wbGF0ZW1hbmFnZXJcIjtcbmltcG9ydCB7IGZpeGVkVVJMRW5jLCBTb2NrZXRDb25maWcgfSBmcm9tIFwiLi9zb2NrZXRjb25maWdcIjtcblxuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSA9IFwiaHR0cDovLzEyNy4wLjAuMS9hcGkvY2FsbC5jZ2lcIjtcbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkxfTElWRSA9IFwiaHR0cHM6Ly9hcGkuaXNwYXBpLm5ldC9hcGkvY2FsbC5jZ2lcIjtcbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkxfT1RFID0gXCJodHRwczovL2FwaS1vdGUuaXNwYXBpLm5ldC9hcGkvY2FsbC5jZ2lcIjtcblxuY29uc3QgcnRtID0gUmVzcG9uc2VUZW1wbGF0ZU1hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcblxuLyoqXG4gKiBBUElDbGllbnQgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEFQSUNsaWVudCB7XG4gIC8qKlxuICAgKiBBUEkgY29ubmVjdGlvbiB0aW1lb3V0IHNldHRpbmdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgc29ja2V0VGltZW91dDogbnVtYmVyID0gMzAwMDAwO1xuICAvKipcbiAgICogVXNlciBBZ2VudCBzdHJpbmdcbiAgICovXG4gIHByaXZhdGUgdWE6IHN0cmluZztcbiAgLyoqXG4gICAqIEFQSSBjb25uZWN0aW9uIHVybFxuICAgKi9cbiAgcHJpdmF0ZSBzb2NrZXRVUkw6IHN0cmluZztcbiAgLyoqXG4gICAqIE9iamVjdCBjb3ZlcmluZyBBUEkgY29ubmVjdGlvbiBkYXRhXG4gICAqL1xuICBwcml2YXRlIHNvY2tldENvbmZpZzogU29ja2V0Q29uZmlnO1xuICAvKipcbiAgICogYWN0aXZpdHkgZmxhZyBmb3IgZGVidWcgbW9kZVxuICAgKi9cbiAgcHJpdmF0ZSBkZWJ1Z01vZGU6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBhZGRpdGlvbmFsIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICovXG4gIHByaXZhdGUgY3VybG9wdHM6IGFueTtcbiAgLyoqXG4gICAqIGxvZ2dlciBmdW5jdGlvbiBmb3IgZGVidWcgbW9kZVxuICAgKi9cbiAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciB8IG51bGw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudWEgPSBcIlwiO1xuICAgIHRoaXMuc29ja2V0VVJMID0gXCJcIjtcbiAgICB0aGlzLmRlYnVnTW9kZSA9IGZhbHNlO1xuICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9MSVZFKTtcbiAgICB0aGlzLnNvY2tldENvbmZpZyA9IG5ldyBTb2NrZXRDb25maWcoKTtcbiAgICB0aGlzLnVzZUxJVkVTeXN0ZW0oKTtcbiAgICB0aGlzLmN1cmxvcHRzID0ge307XG4gICAgdGhpcy5sb2dnZXIgPSBudWxsO1xuICAgIHRoaXMuc2V0RGVmYXVsdExvZ2dlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNldCBjdXN0b20gbG9nZ2VyIHRvIHVzZSBpbnN0ZWFkIG9mIGRlZmF1bHQgb25lXG4gICAqIEBwYXJhbSBjdXN0b21Mb2dnZXJcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldEN1c3RvbUxvZ2dlcihjdXN0b21Mb2dnZXI6IExvZ2dlcik6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5sb2dnZXIgPSBjdXN0b21Mb2dnZXI7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIHNldCBkZWZhdWx0IGxvZ2dlciB0byB1c2VcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldERlZmF1bHRMb2dnZXIoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogRW5hYmxlIERlYnVnIE91dHB1dCB0byBTVERPVVRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIGVuYWJsZURlYnVnTW9kZSgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuZGVidWdNb2RlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNhYmxlIERlYnVnIE91dHB1dFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgZGlzYWJsZURlYnVnTW9kZSgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBBUEkgU2Vzc2lvbiB0aGF0IGlzIGN1cnJlbnRseSBzZXRcbiAgICogQHJldHVybnMgQVBJIFNlc3Npb24gb3IgbnVsbFxuICAgKi9cbiAgcHVibGljIGdldFNlc3Npb24oKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3Qgc2Vzc2lkID0gdGhpcy5zb2NrZXRDb25maWcuZ2V0U2Vzc2lvbigpO1xuICAgIHJldHVybiBzZXNzaWQgPT09IFwiXCIgPyBudWxsIDogc2Vzc2lkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgQVBJIGNvbm5lY3Rpb24gdXJsIHRoYXQgaXMgY3VycmVudGx5IHNldFxuICAgKiBAcmV0dXJucyBBUEkgY29ubmVjdGlvbiB1cmwgY3VycmVudGx5IGluIHVzZVxuICAgKi9cbiAgcHVibGljIGdldFVSTCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNvY2tldFVSTDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3NzaWJpbGl0eSB0byBjdXN0b21pemUgZGVmYXVsdCB1c2VyIGFnZW50IHRvIGZpdCB5b3VyIG5lZWRzXG4gICAqIEBwYXJhbSBzdHIgdXNlciBhZ2VudCBsYWJlbFxuICAgKiBAcGFyYW0gcnYgcmV2aXNpb24gb2YgdXNlciBhZ2VudFxuICAgKiBAcGFyYW0gbW9kdWxlcyBmdXJ0aGVyIG1vZHVsZXMgdG8gYWRkIHRvIHVzZXIgYWdlbnQgc3RyaW5nLCBmb3JtYXQ6IFtcIjxtb2QxPi88cmV2PlwiLCBcIjxtb2QyPi88cmV2PlwiLCAuLi4gXVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0VXNlckFnZW50KHN0cjogc3RyaW5nLCBydjogc3RyaW5nLCBtb2R1bGVzOiBhbnkgPSBbXSk6IEFQSUNsaWVudCB7XG4gICAgY29uc3QgbW9kcyA9IG1vZHVsZXMubGVuZ3RoID8gXCIgXCIgKyBtb2R1bGVzLmpvaW4oXCIgXCIpIDogXCJcIjtcbiAgICB0aGlzLnVhID1cbiAgICAgIGAke3N0cn0gYCArXG4gICAgICBgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07ICR7cHJvY2Vzcy5hcmNofTsgcnY6JHtydn0pYCArXG4gICAgICBtb2RzICtcbiAgICAgIGAgbm9kZS1zZGsvJHt0aGlzLmdldFZlcnNpb24oKX0gYCArXG4gICAgICBgbm9kZS8ke3Byb2Nlc3MudmVyc2lvbn1gO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgVXNlciBBZ2VudFxuICAgKiBAcmV0dXJucyBVc2VyIEFnZW50IHN0cmluZ1xuICAgKi9cbiAgcHVibGljIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy51YS5sZW5ndGgpIHtcbiAgICAgIHRoaXMudWEgPVxuICAgICAgICBgTk9ERS1TREsgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07ICR7XG4gICAgICAgICAgcHJvY2Vzcy5hcmNoXG4gICAgICAgIH07IHJ2OiR7dGhpcy5nZXRWZXJzaW9uKCl9KSBgICsgYG5vZGUvJHtwcm9jZXNzLnZlcnNpb259YDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudWE7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gcHJveHkgcHJveHkgc2VydmVyIHRvIHVzZSBmb3IgY29tbXVuaWNhdGlvXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRQcm94eShwcm94eTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLmN1cmxvcHRzLnByb3h5ID0gcHJveHk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwcm94eSBzZXJ2ZXIgY29uZmlndXJhdGlvblxuICAgKiBAcmV0dXJucyBwcm94eSBzZXJ2ZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICovXG4gIHB1YmxpYyBnZXRQcm94eSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY3VybG9wdHMsIFwicHJveHlcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cmxvcHRzLnByb3h5O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHJlZmVyZXIgdG8gdXNlIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gcmVmZXJlciBSZWZlcmVyXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRSZWZlcmVyKHJlZmVyZXI6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5jdXJsb3B0cy5yZWZlcmVyID0gcmVmZXJlcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJlZmVyZXIgY29uZmlndXJhdGlvblxuICAgKiBAcmV0dXJucyByZWZlcmVyIGNvbmZpZ3VyYXRpb24gdmFsdWUgb3IgbnVsbCBpZiBub3Qgc2V0XG4gICAqL1xuICBwdWJsaWMgZ2V0UmVmZXJlcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY3VybG9wdHMsIFwicmVmZXJlclwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucmVmZXJlcjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IG1vZHVsZSB2ZXJzaW9uXG4gICAqIEByZXR1cm5zIG1vZHVsZSB2ZXJzaW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0VmVyc2lvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYWNrYWdlSW5mby52ZXJzaW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IHNlc3Npb24gZGF0YSAoc2Vzc2lvbiBpZCBhbmQgc3lzdGVtIGVudGl0eSkgdG8gZ2l2ZW4gY2xpZW50IHJlcXVlc3Qgc2Vzc2lvblxuICAgKiBAcGFyYW0gc2Vzc2lvbiBDbGllbnRSZXF1ZXN0IHNlc3Npb24gaW5zdGFuY2VcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNhdmVTZXNzaW9uKHNlc3Npb246IGFueSk6IEFQSUNsaWVudCB7XG4gICAgc2Vzc2lvbi5zb2NrZXRjZmcgPSB7XG4gICAgICBlbnRpdHk6IHRoaXMuc29ja2V0Q29uZmlnLmdldFN5c3RlbUVudGl0eSgpLFxuICAgICAgc2Vzc2lvbjogdGhpcy5zb2NrZXRDb25maWcuZ2V0U2Vzc2lvbigpLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIGV4aXN0aW5nIGNvbmZpZ3VyYXRpb24gb3V0IG9mIENsaWVudFJlcXVlc3Qgc2Vzc2lvblxuICAgKiB0byByZWJ1aWxkIGFuZCByZXVzZSBjb25uZWN0aW9uIHNldHRpbmdzXG4gICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgcmV1c2VTZXNzaW9uKHNlc3Npb246IGFueSk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KHNlc3Npb24uc29ja2V0Y2ZnLmVudGl0eSk7XG4gICAgdGhpcy5zZXRTZXNzaW9uKHNlc3Npb24uc29ja2V0Y2ZnLnNlc3Npb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbm90aGVyIGNvbm5lY3Rpb24gdXJsIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEBwYXJhbSB2YWx1ZSBBUEkgY29ubmVjdGlvbiB1cmwgdG8gc2V0XG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRVUkwodmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRVUkwgPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgb25lIHRpbWUgcGFzc3dvcmQgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHZhbHVlIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRPVFAodmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0T1RQKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYW4gQVBJIHNlc3Npb24gaWQgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHZhbHVlIEFQSSBzZXNzaW9uIGlkXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBzZXRTZXNzaW9uKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFNlc3Npb24odmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbiBSZW1vdGUgSVAgQWRkcmVzcyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgKiBUbyBiZSB1c2VkIGluIGNhc2UgeW91IGhhdmUgYW4gYWN0aXZlIGlwIGZpbHRlciBzZXR0aW5nLlxuICAgKiBAcGFyYW0gdmFsdWUgUmVtb3RlIElQIEFkZHJlc3NcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFJlbW90ZUlQQWRkcmVzcyh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRSZW1vdGVBZGRyZXNzKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgQ3JlZGVudGlhbHMgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHVpZCBhY2NvdW50IG5hbWVcbiAgICogQHBhcmFtIHB3IGFjY291bnQgcGFzc3dvcmRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldENyZWRlbnRpYWxzKHVpZDogc3RyaW5nLCBwdzogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRMb2dpbih1aWQpO1xuICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFBhc3N3b3JkKHB3KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgQ3JlZGVudGlhbHMgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICogQHBhcmFtIHVpZCBhY2NvdW50IG5hbWVcbiAgICogQHBhcmFtIHJvbGUgcm9sZSB1c2VyIGlkXG4gICAqIEBwYXJhbSBwdyByb2xlIHVzZXIgcGFzc3dvcmRcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFJvbGVDcmVkZW50aWFscyh1aWQ6IHN0cmluZywgcm9sZTogc3RyaW5nLCBwdzogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICByZXR1cm4gdGhpcy5zZXRDcmVkZW50aWFscyhyb2xlID8gYCR7dWlkfSEke3JvbGV9YCA6IHVpZCwgcHcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gQVBJIGxvZ2luIHRvIHN0YXJ0IHNlc3Npb24tYmFzZWQgY29tbXVuaWNhdGlvblxuICAgKiBAcGFyYW0gb3RwIG9wdGlvbmFsIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgbG9naW4ob3RwID0gXCJcIik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICB0aGlzLnNldE9UUChvdHAgfHwgXCJcIik7XG4gICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3QoeyBDT01NQU5EOiBcIlN0YXJ0U2Vzc2lvblwiIH0pO1xuICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgfVxuICAgIHJldHVybiBycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIEFQSSBsb2dpbiB0byBzdGFydCBzZXNzaW9uLWJhc2VkIGNvbW11bmljYXRpb24uXG4gICAqIFVzZSBnaXZlbiBzcGVjaWZpYyBjb21tYW5kIHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBwYXJhbXMgZ2l2ZW4gc3BlY2lmaWMgY29tbWFuZCBwYXJhbWV0ZXJzXG4gICAqIEBwYXJhbSBvdHAgb3B0aW9uYWwgb25lIHRpbWUgcGFzc3dvcmRcbiAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBsb2dpbkV4dGVuZGVkKHBhcmFtczogYW55LCBvdHAgPSBcIlwiKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHRoaXMuc2V0T1RQKG90cCk7XG4gICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3QoXG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgQ09NTUFORDogXCJTdGFydFNlc3Npb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgcGFyYW1zXG4gICAgICApXG4gICAgKTtcbiAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgIGNvbnN0IGNvbCA9IHJyLmdldENvbHVtbihcIlNFU1NJT05cIik7XG4gICAgICB0aGlzLnNldFNlc3Npb24oY29sID8gY29sLmdldERhdGEoKVswXSA6IFwiXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcnI7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBBUEkgbG9nb3V0IHRvIGNsb3NlIEFQSSBzZXNzaW9uIGluIHVzZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGxvZ291dCgpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3Qoe1xuICAgICAgQ09NTUFORDogXCJFbmRTZXNzaW9uXCIsXG4gICAgfSk7XG4gICAgaWYgKHJyLmlzU3VjY2VzcygpKSB7XG4gICAgICB0aGlzLnNldFNlc3Npb24oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiBycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIEFQSSByZXF1ZXN0IHVzaW5nIHRoZSBnaXZlbiBjb21tYW5kXG4gICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdG8gcmVxdWVzdFxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJlcXVlc3QoY21kOiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgLy8gZmxhdHRlbiBuZXN0ZWQgYXBpIGNvbW1hbmQgYnVsayBwYXJhbWV0ZXJzXG4gICAgbGV0IG15Y21kID0gdGhpcy5mbGF0dGVuQ29tbWFuZChjbWQpO1xuXG4gICAgLy8gYXV0byBjb252ZXJ0IHVtbGF1dCBuYW1lcyB0byBwdW55Y29kZVxuICAgIG15Y21kID0gYXdhaXQgdGhpcy5hdXRvSUROQ29udmVydChteWNtZCk7XG5cbiAgICAvLyByZXF1ZXN0IGNvbW1hbmQgdG8gQVBJXG4gICAgY29uc3QgY2ZnOiBhbnkgPSB7XG4gICAgICBDT05ORUNUSU9OX1VSTDogdGhpcy5zb2NrZXRVUkwsXG4gICAgfTtcbiAgICAvLyBUT0RPOiAzMDBzICh0byBiZSBzdXJlIHRvIGdldCBhbiBBUEkgcmVzcG9uc2UpXG4gICAgY29uc3QgcmVxQ2ZnOiBhbnkgPSB7XG4gICAgICAvL2VuY29kaW5nOiBcInV0ZjhcIiwgLy9kZWZhdWx0IGZvciB0eXBlIHN0cmluZ1xuICAgICAgLy9nemlwOiB0cnVlLFxuICAgICAgYm9keTogdGhpcy5nZXRQT1NURGF0YShteWNtZCksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiVXNlci1BZ2VudFwiOiB0aGlzLmdldFVzZXJBZ2VudCgpLFxuICAgICAgfSxcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICB0aW1lb3V0OiBBUElDbGllbnQuc29ja2V0VGltZW91dCxcbiAgICAgIHVybDogY2ZnLkNPTk5FQ1RJT05fVVJMLFxuICAgIH07XG4gICAgY29uc3QgcHJveHkgPSB0aGlzLmdldFByb3h5KCk7XG4gICAgaWYgKHByb3h5KSB7XG4gICAgICByZXFDZmcucHJveHkgPSBwcm94eTtcbiAgICB9XG4gICAgY29uc3QgcmVmZXJlciA9IHRoaXMuZ2V0UmVmZXJlcigpO1xuICAgIGlmIChyZWZlcmVyKSB7XG4gICAgICByZXFDZmcuaGVhZGVycy5SZWZlcmVyID0gcmVmZXJlcjtcbiAgICB9XG4gICAgcmV0dXJuIGZldGNoKGNmZy5DT05ORUNUSU9OX1VSTCwgcmVxQ2ZnKVxuICAgICAgLnRoZW4oYXN5bmMgKHJlczogYW55KSA9PiB7XG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGxldCBib2R5O1xuICAgICAgICBpZiAocmVzLm9rKSB7XG4gICAgICAgICAgLy8gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMFxuICAgICAgICAgIGJvZHkgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVycm9yID0gcmVzLnN0YXR1cyArIChyZXMuc3RhdHVzVGV4dCA/IFwiIFwiICsgcmVzLnN0YXR1c1RleHQgOiBcIlwiKTtcbiAgICAgICAgICBib2R5ID0gcnRtLmdldFRlbXBsYXRlKFwiaHR0cGVycm9yXCIpLmdldFBsYWluKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcnIgPSBuZXcgUmVzcG9uc2UoYm9keSwgbXljbWQsIGNmZyk7XG4gICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnI7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc3QgYm9keSA9IHJ0bS5nZXRUZW1wbGF0ZShcImh0dHBlcnJvclwiKS5nZXRQbGFpbigpO1xuICAgICAgICBjb25zdCByciA9IG5ldyBSZXNwb25zZShib2R5LCBteWNtZCwgY2ZnKTtcbiAgICAgICAgaWYgKHRoaXMuZGVidWdNb2RlICYmIHRoaXMubG9nZ2VyKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIubG9nKHRoaXMuZ2V0UE9TVERhdGEobXljbWQsIHRydWUpLCByciwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlcnI7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRoZSBuZXh0IHBhZ2Ugb2YgbGlzdCBlbnRyaWVzIGZvciB0aGUgY3VycmVudCBsaXN0IHF1ZXJ5XG4gICAqIFVzZWZ1bCBmb3IgdGFibGVzXG4gICAqIEBwYXJhbSByciBBUEkgUmVzcG9uc2Ugb2YgY3VycmVudCBwYWdlXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlIG9yIG51bGwgaW4gY2FzZSB0aGVyZSBhcmUgbm8gZnVydGhlciBsaXN0IGVudHJpZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0TmV4dFJlc3BvbnNlUGFnZShycjogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlIHwgbnVsbD4ge1xuICAgIGNvbnN0IG15Y21kID0gcnIuZ2V0Q29tbWFuZCgpO1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobXljbWQsIFwiTEFTVFwiKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIlBhcmFtZXRlciBMQVNUIGluIHVzZS4gUGxlYXNlIHJlbW92ZSBpdCB0byBhdm9pZCBpc3N1ZXMgaW4gcmVxdWVzdE5leHRQYWdlLlwiXG4gICAgICApO1xuICAgIH1cbiAgICBsZXQgZmlyc3QgPSAwO1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobXljbWQsIFwiRklSU1RcIikpIHtcbiAgICAgIGZpcnN0ID0gbXljbWQuRklSU1Q7XG4gICAgfVxuICAgIGNvbnN0IHRvdGFsID0gcnIuZ2V0UmVjb3Jkc1RvdGFsQ291bnQoKTtcbiAgICBjb25zdCBsaW1pdCA9IHJyLmdldFJlY29yZHNMaW1pdGF0aW9uKCk7XG4gICAgZmlyc3QgKz0gbGltaXQ7XG4gICAgaWYgKGZpcnN0IDwgdG90YWwpIHtcbiAgICAgIG15Y21kLkZJUlNUID0gZmlyc3Q7XG4gICAgICBteWNtZC5MSU1JVCA9IGxpbWl0O1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChteWNtZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IGFsbCBwYWdlcy9lbnRyaWVzIGZvciB0aGUgZ2l2ZW4gcXVlcnkgY29tbWFuZFxuICAgKiBAcGFyYW0gY21kIEFQSSBsaXN0IGNvbW1hbmQgdG8gdXNlXG4gICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXJyYXkgb2YgQVBJIFJlc3BvbnNlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHJlcXVlc3RBbGxSZXNwb25zZVBhZ2VzKGNtZDogYW55KTogUHJvbWlzZTxSZXNwb25zZVtdPiB7XG4gICAgY29uc3QgcmVzcG9uc2VzOiBSZXNwb25zZVtdID0gW107XG4gICAgY29uc3QgcnI6IFJlc3BvbnNlID0gYXdhaXQgdGhpcy5yZXF1ZXN0KFxuICAgICAgT2JqZWN0LmFzc2lnbih7fSwgY21kLCB7IEZJUlNUOiAwIH0pXG4gICAgKTtcbiAgICBsZXQgdG1wOiBSZXNwb25zZSB8IG51bGwgPSBycjtcbiAgICBsZXQgaWR4ID0gMDtcbiAgICBkbyB7XG4gICAgICByZXNwb25zZXNbaWR4KytdID0gdG1wO1xuICAgICAgdG1wID0gYXdhaXQgdGhpcy5yZXF1ZXN0TmV4dFJlc3BvbnNlUGFnZSh0bXApO1xuICAgIH0gd2hpbGUgKHRtcCAhPT0gbnVsbCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBkYXRhIHZpZXcgdG8gYSBnaXZlbiBzdWJ1c2VyXG4gICAqIEBwYXJhbSB1aWQgc3VidXNlciBhY2NvdW50IG5hbWVcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHNldFVzZXJWaWV3KHVpZDogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRVc2VyKHVpZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgZGF0YSB2aWV3IGJhY2sgZnJvbSBzdWJ1c2VyIHRvIHVzZXJcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHJlc2V0VXNlclZpZXcoKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRVc2VyKFwiXCIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIEhpZ2ggUGVyZm9ybWFuY2UgQ29ubmVjdGlvbiBTZXR1cFxuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9oZXhvbmV0L25vZGUtc2RrL2Jsb2IvbWFzdGVyL1JFQURNRS5tZFxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgdXNlSGlnaFBlcmZvcm1hbmNlQ29ubmVjdGlvblNldHVwKCk6IEFQSUNsaWVudCB7XG4gICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX1BST1hZKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBEZWZhdWx0IENvbm5lY3Rpb24gU2V0dXAgKHRoZSBkZWZhdWx0KVxuICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgdXNlRGVmYXVsdENvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTF9MSVZFKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgT1QmRSBTeXN0ZW0gZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyB1c2VPVEVTeXN0ZW0oKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfT1RFKTtcbiAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoXCIxMjM0XCIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBMSVZFIFN5c3RlbSBmb3IgQVBJIGNvbW11bmljYXRpb24gKHRoaXMgaXMgdGhlIGRlZmF1bHQgc2V0dGluZylcbiAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHVzZUxJVkVTeXN0ZW0oKTogQVBJQ2xpZW50IHtcbiAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfTElWRSk7XG4gICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiNTRjZFwiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgZ2l2ZW4gY29tbWFuZCBmb3IgUE9TVCByZXF1ZXN0IGluY2x1ZGluZyBjb25uZWN0aW9uIGNvbmZpZ3VyYXRpb24gZGF0YVxuICAgKiBAcGFyYW0gY21kIEFQSSBjb21tYW5kIHRvIGVuY29kZVxuICAgKiBAcmV0dXJucyBlbmNvZGVkIFBPU1QgZGF0YSBzdHJpbmdcbiAgICovXG4gIHB1YmxpYyBnZXRQT1NURGF0YShjbWQ6IGFueSwgc2VjdXJlZCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICBsZXQgZGF0YSA9IHRoaXMuc29ja2V0Q29uZmlnLmdldFBPU1REYXRhKCk7XG4gICAgaWYgKHNlY3VyZWQpIHtcbiAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoL3NfcHc9W14mXSsvLCBcInNfcHc9KioqXCIpO1xuICAgIH1cblxuICAgIGxldCB0bXAgPSBcIlwiO1xuICAgIGlmICghKHR5cGVvZiBjbWQgPT09IFwic3RyaW5nXCIgfHwgY21kIGluc3RhbmNlb2YgU3RyaW5nKSkge1xuICAgICAgT2JqZWN0LmtleXMoY21kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoY21kW2tleV0gIT09IG51bGwgJiYgY21kW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRtcCArPSBgJHtrZXl9PSR7Y21kW2tleV0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpfVxcbmA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgPSBcIlwiICsgY21kO1xuICAgIH1cbiAgICBpZiAoc2VjdXJlZCkge1xuICAgICAgdG1wID0gdG1wLnJlcGxhY2UoL1BBU1NXT1JEPVteXFxuXSsvLCBcIlBBU1NXT1JEPSoqKlwiKTtcbiAgICB9XG4gICAgdG1wID0gdG1wLnJlcGxhY2UoL1xcbiQvLCBcIlwiKTtcbiAgICBkYXRhICs9IGAke2ZpeGVkVVJMRW5jKFwic19jb21tYW5kXCIpfT0ke2ZpeGVkVVJMRW5jKHRtcCl9YDtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGbGF0dGVuIG5lc3RlZCBhcnJheXMgaW4gY29tbWFuZFxuICAgKiBAcGFyYW0gY21kIGFwaSBjb21tYW5kXG4gICAqIEByZXR1cm5zIGFwaSBjb21tYW5kIHdpdGggZmxhdHRlbmRlZCBwYXJhbWV0ZXJzXG4gICAqL1xuICBwcml2YXRlIGZsYXR0ZW5Db21tYW5kKGNtZDogYW55KTogYW55IHtcbiAgICBjb25zdCBuZXdjbWQ6IGFueSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IGNtZFtrZXldO1xuICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnRvVXBwZXJDYXNlKCk7XG4gICAgICBpZiAodmFsICE9PSBudWxsICYmIHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHZhbCkge1xuICAgICAgICAgICAgbmV3Y21kW2Ake25ld0tleX0ke2luZGV4fWBdID0gKHJvdyArIFwiXCIpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIik7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgICAgICAgIG5ld2NtZFtuZXdLZXldID0gdmFsLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld2NtZFtuZXdLZXldID0gdmFsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBuZXdjbWQ7XG4gIH1cblxuICAvKipcbiAgICogQXV0byBjb252ZXJ0IEFQSSBjb21tYW5kIHBhcmFtZXRlcnMgdG8gcHVueWNvZGUsIGlmIG5lY2Vzc2FyeS5cbiAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFwaSBjb21tYW5kIHdpdGggSUROIHZhbHVlcyByZXBsYWNlZCB0byBwdW55Y29kZVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBhdXRvSUROQ29udmVydChjbWQ6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gZG9uJ3QgY29udmVydCBmb3IgY29udmVydGlkbiBjb21tYW5kIHRvIGF2b2lkIGVuZGxlc3MgbG9vcFxuICAgIC8vIGFuZCBpZ25vcmUgY29tbWFuZHMgaW4gc3RyaW5nIGZvcm1hdCAoZXZlbiBkZXByZWNhdGVkKVxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBjbWQgPT09IFwic3RyaW5nXCIgfHxcbiAgICAgIGNtZCBpbnN0YW5jZW9mIFN0cmluZyB8fFxuICAgICAgL15DT05WRVJUSUROJC9pLnRlc3QoY21kLkNPTU1BTkQpXG4gICAgKSB7XG4gICAgICByZXR1cm4gY21kO1xuICAgIH1cbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoY21kKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgcmV0dXJuIC9eKERPTUFJTnxOQU1FU0VSVkVSfEROU1pPTkUpKFswLTldKikkL2kudGVzdChrZXkpO1xuICAgIH0pO1xuICAgIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjbWQ7XG4gICAgfVxuICAgIGNvbnN0IHRvY29udmVydDogYW55ID0gW107XG4gICAgY29uc3QgaWR4czogc3RyaW5nW10gPSBbXTtcbiAgICBrZXlzLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGNtZFtrZXldICE9PSBudWxsICYmXG4gICAgICAgIGNtZFtrZXldICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgL1teYS16MC05LlxcLSBdL2kudGVzdChjbWRba2V5XSlcbiAgICAgICkge1xuICAgICAgICB0b2NvbnZlcnQucHVzaChjbWRba2V5XSk7XG4gICAgICAgIGlkeHMucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCF0b2NvbnZlcnQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY21kO1xuICAgIH1cbiAgICBjb25zdCByID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHtcbiAgICAgIENPTU1BTkQ6IFwiQ29udmVydElETlwiLFxuICAgICAgRE9NQUlOOiB0b2NvbnZlcnQsXG4gICAgfSk7XG4gICAgY29uc29sZS5kaXIoci5nZXRQbGFpbigpKTtcbiAgICBpZiAoci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgY29uc3QgY29sID0gci5nZXRDb2x1bW4oXCJBQ0VcIik7XG4gICAgICBpZiAoY29sKSB7XG4gICAgICAgIGNvbC5nZXREYXRhKCkuZm9yRWFjaCgocGM6IHN0cmluZywgaWR4OiBhbnkpID0+IHtcbiAgICAgICAgICBjbWRbaWR4c1tpZHhdXSA9IHBjO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNtZDtcbiAgfVxufVxuIl19