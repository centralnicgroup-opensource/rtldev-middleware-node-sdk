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
exports.APIClient = exports.ISPAPI_CONNECTION_URL = exports.ISPAPI_CONNECTION_URL_PROXY = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpRUFBMEM7QUFDMUMsMERBQStCO0FBQy9CLG1DQUFrQztBQUNsQyx1Q0FBc0M7QUFDdEMscUVBQW9FO0FBQ3BFLCtDQUEyRDtBQUU5QyxRQUFBLDJCQUEyQixHQUFHLCtCQUErQixDQUFDO0FBQzlELFFBQUEscUJBQXFCLEdBQUcscUNBQXFDLENBQUM7QUFFM0UsSUFBTSxHQUFHLEdBQUcsaURBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFLbEQ7SUE4Qkk7UUFDSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsNkJBQXFCLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBT00sbUNBQWUsR0FBdEIsVUFBdUIsWUFBb0I7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUtNLG9DQUFnQixHQUF2QjtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS00s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QUFFLFlBQVk7Z0NBQ3JCLE1BQU0sRUFBRSxTQUFTOzZCQUNwQixDQUFDLEVBQUE7O3dCQUhJLENBQUMsR0FBRyxTQUdSO3dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzFCLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNULEdBQUcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUMvQixJQUFJLEdBQUcsRUFBRTtnQ0FDTCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBVSxFQUFFLEdBQVE7b0NBQ3ZDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0NBQ3hCLENBQUMsQ0FBQyxDQUFDOzZCQUNOO3lCQUNKO3dCQUNELFdBQU8sR0FBRyxFQUFDOzs7O0tBQ2Q7SUE5akJzQix1QkFBYSxHQUFXLE1BQU0sQ0FBQztJQStqQjFELGdCQUFDO0NBQUEsQUFua0JELElBbWtCQztBQW5rQlksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFja2FnZUluZm8gZnJvbSBcIi4uL3BhY2thZ2UuanNvblwiO1xuaW1wb3J0IGZldGNoIGZyb20gXCJub2RlLWZldGNoXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcbmltcG9ydCB7IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyIH0gZnJvbSBcIi4vcmVzcG9uc2V0ZW1wbGF0ZW1hbmFnZXJcIjtcbmltcG9ydCB7IGZpeGVkVVJMRW5jLCBTb2NrZXRDb25maWcgfSBmcm9tIFwiLi9zb2NrZXRjb25maWdcIjtcblxuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSA9IFwiaHR0cDovLzEyNy4wLjAuMS9hcGkvY2FsbC5jZ2lcIjtcbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkwgPSBcImh0dHBzOi8vYXBpLmlzcGFwaS5uZXQvYXBpL2NhbGwuY2dpXCI7XG5cbmNvbnN0IHJ0bSA9IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQVBJQ2xpZW50IGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBBUElDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEFQSSBjb25uZWN0aW9uIHRpbWVvdXQgc2V0dGluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgc29ja2V0VGltZW91dDogbnVtYmVyID0gMzAwMDAwO1xuICAgIC8qKlxuICAgICAqIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSB1YTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEFQSSBjb25uZWN0aW9uIHVybFxuICAgICAqL1xuICAgIHByaXZhdGUgc29ja2V0VVJMOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogT2JqZWN0IGNvdmVyaW5nIEFQSSBjb25uZWN0aW9uIGRhdGFcbiAgICAgKi9cbiAgICBwcml2YXRlIHNvY2tldENvbmZpZzogU29ja2V0Q29uZmlnO1xuICAgIC8qKlxuICAgICAqIGFjdGl2aXR5IGZsYWcgZm9yIGRlYnVnIG1vZGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlYnVnTW9kZTogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBhZGRpdGlvbmFsIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICAgKi9cbiAgICBwcml2YXRlIGN1cmxvcHRzOiBhbnk7XG4gICAgLyoqXG4gICAgICogbG9nZ2VyIGZ1bmN0aW9uIGZvciBkZWJ1ZyBtb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciB8IG51bGw7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudWEgPSBcIlwiO1xuICAgICAgICB0aGlzLnNvY2tldFVSTCA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTCk7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnID0gbmV3IFNvY2tldENvbmZpZygpO1xuICAgICAgICB0aGlzLnVzZUxJVkVTeXN0ZW0oKTtcbiAgICAgICAgdGhpcy5jdXJsb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdExvZ2dlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldCBjdXN0b20gbG9nZ2VyIHRvIHVzZSBpbnN0ZWFkIG9mIGRlZmF1bHQgb25lXG4gICAgICogQHBhcmFtIGN1c3RvbUxvZ2dlclxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q3VzdG9tTG9nZ2VyKGN1c3RvbUxvZ2dlcjogTG9nZ2VyKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBjdXN0b21Mb2dnZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzZXQgZGVmYXVsdCBsb2dnZXIgdG8gdXNlXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXREZWZhdWx0TG9nZ2VyKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRW5hYmxlIERlYnVnIE91dHB1dCB0byBTVERPVVRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGVuYWJsZURlYnVnTW9kZSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmRlYnVnTW9kZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgRGVidWcgT3V0cHV0XG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBkaXNhYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgQVBJIFNlc3Npb24gdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAgICogQHJldHVybnMgQVBJIFNlc3Npb24gb3IgbnVsbFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZXNzaW9uKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBjb25zdCBzZXNzaWQgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCk7XG4gICAgICAgIHJldHVybiAoc2Vzc2lkID09PSBcIlwiKSA/IG51bGwgOiBzZXNzaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBBUEkgY29ubmVjdGlvbiB1cmwgdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAgICogQHJldHVybnMgQVBJIGNvbm5lY3Rpb24gdXJsIGN1cnJlbnRseSBpbiB1c2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VVJMKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvY2tldFVSTDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQb3NzaWJpbGl0eSB0byBjdXN0b21pemUgZGVmYXVsdCB1c2VyIGFnZW50IHRvIGZpdCB5b3VyIG5lZWRzXG4gICAgICogQHBhcmFtIHN0ciB1c2VyIGFnZW50IGxhYmVsXG4gICAgICogQHBhcmFtIHJ2IHJldmlzaW9uIG9mIHVzZXIgYWdlbnRcbiAgICAgKiBAcGFyYW0gbW9kdWxlcyBmdXJ0aGVyIG1vZHVsZXMgdG8gYWRkIHRvIHVzZXIgYWdlbnQgc3RyaW5nLCBmb3JtYXQ6IFtcIjxtb2QxPi88cmV2PlwiLCBcIjxtb2QyPi88cmV2PlwiLCAuLi4gXVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXNlckFnZW50KHN0cjogc3RyaW5nLCBydjogc3RyaW5nLCBtb2R1bGVzOiBhbnkgPSBbXSk6IEFQSUNsaWVudCB7XG4gICAgICAgIGNvbnN0IG1vZHMgPSBtb2R1bGVzLmxlbmd0aCA/IFwiIFwiICsgbW9kdWxlcy5qb2luKFwiIFwiKSA6IFwiXCI7XG4gICAgICAgIHRoaXMudWEgPSAoXG4gICAgICAgICAgICBgJHtzdHJ9IGAgK1xuICAgICAgICAgICAgYCgke3Byb2Nlc3MucGxhdGZvcm19OyAke3Byb2Nlc3MuYXJjaH07IHJ2OiR7cnZ9KWAgK1xuICAgICAgICAgICAgbW9kcyArXG4gICAgICAgICAgICBgIG5vZGUtc2RrLyR7dGhpcy5nZXRWZXJzaW9uKCl9IGAgK1xuICAgICAgICAgICAgYG5vZGUvJHtwcm9jZXNzLnZlcnNpb259YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIFVzZXIgQWdlbnRcbiAgICAgKiBAcmV0dXJucyBVc2VyIEFnZW50IHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLnVhLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy51YSA9IChcbiAgICAgICAgICAgICAgICBgTk9ERS1TREsgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07ICR7cHJvY2Vzcy5hcmNofTsgcnY6JHt0aGlzLmdldFZlcnNpb24oKX0pIGAgK1xuICAgICAgICAgICAgICAgIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudWE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSBwcm94eSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBjb21tdW5pY2F0aW9cbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3h5KHByb3h5OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmN1cmxvcHRzLnByb3h5ID0gcHJveHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcHJveHkgc2VydmVyIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcmV0dXJucyBwcm94eSBzZXJ2ZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJveHkoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJwcm94eVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucHJveHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSByZWZlcmVyIHRvIHVzZSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gcmVmZXJlciBSZWZlcmVyXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZWZlcmVyKHJlZmVyZXI6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuY3VybG9wdHMucmVmZXJlciA9IHJlZmVyZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVmZXJlciBjb25maWd1cmF0aW9uXG4gICAgICogQHJldHVybnMgcmVmZXJlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWZlcmVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY3VybG9wdHMsIFwicmVmZXJlclwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucmVmZXJlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgbW9kdWxlIHZlcnNpb25cbiAgICAgKiBAcmV0dXJucyBtb2R1bGUgdmVyc2lvblxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwYWNrYWdlSW5mby52ZXJzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGx5IHNlc3Npb24gZGF0YSAoc2Vzc2lvbiBpZCBhbmQgc3lzdGVtIGVudGl0eSkgdG8gZ2l2ZW4gY2xpZW50IHJlcXVlc3Qgc2Vzc2lvblxuICAgICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2F2ZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlc1xuICAgICAgICBzZXNzaW9uLnNvY2tldGNmZyA9IHtcbiAgICAgICAgICAgIGVudGl0eTogdGhpcy5zb2NrZXRDb25maWcuZ2V0U3lzdGVtRW50aXR5KCksXG4gICAgICAgICAgICBzZXNzaW9uOiB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCksXG4gICAgICAgIH07XG4gICAgICAgIC8vIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlc1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgZXhpc3RpbmcgY29uZmlndXJhdGlvbiBvdXQgb2YgQ2xpZW50UmVxdWVzdCBzZXNzaW9uXG4gICAgICogdG8gcmVidWlsZCBhbmQgcmV1c2UgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgcmV1c2VTZXNzaW9uKHNlc3Npb246IGFueSk6IEFQSUNsaWVudCB7XG4gICAgICAgIC8vZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tb2R1bGUtYm91bmRhcnktdHlwZXNcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KHNlc3Npb24uc29ja2V0Y2ZnLmVudGl0eSk7XG4gICAgICAgIHRoaXMuc2V0U2Vzc2lvbihzZXNzaW9uLnNvY2tldGNmZy5zZXNzaW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFub3RoZXIgY29ubmVjdGlvbiB1cmwgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdmFsdWUgQVBJIGNvbm5lY3Rpb24gdXJsIHRvIHNldFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VVJMKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldFVSTCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb25lIHRpbWUgcGFzc3dvcmQgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdmFsdWUgb25lIHRpbWUgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldE9UUCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0T1RQKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFuIEFQSSBzZXNzaW9uIGlkIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHZhbHVlIEFQSSBzZXNzaW9uIGlkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRTZXNzaW9uKHZhbHVlOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTZXNzaW9uKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFuIFJlbW90ZSBJUCBBZGRyZXNzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogVG8gYmUgdXNlZCBpbiBjYXNlIHlvdSBoYXZlIGFuIGFjdGl2ZSBpcCBmaWx0ZXIgc2V0dGluZy5cbiAgICAgKiBAcGFyYW0gdmFsdWUgUmVtb3RlIElQIEFkZHJlc3NcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFJlbW90ZUlQQWRkcmVzcyh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UmVtb3RlQWRkcmVzcyh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBDcmVkZW50aWFscyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB1aWQgYWNjb3VudCBuYW1lXG4gICAgICogQHBhcmFtIHB3IGFjY291bnQgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldENyZWRlbnRpYWxzKHVpZDogc3RyaW5nLCBwdzogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0TG9naW4odWlkKTtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0UGFzc3dvcmQocHcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgQ3JlZGVudGlhbHMgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgICAqIEBwYXJhbSByb2xlIHJvbGUgdXNlciBpZFxuICAgICAqIEBwYXJhbSBwdyByb2xlIHVzZXIgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFJvbGVDcmVkZW50aWFscyh1aWQ6IHN0cmluZywgcm9sZTogc3RyaW5nLCBwdzogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0Q3JlZGVudGlhbHMocm9sZSA/IGAke3VpZH0hJHtyb2xlfWAgOiB1aWQsIHB3KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSBsb2dpbiB0byBzdGFydCBzZXNzaW9uLWJhc2VkIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gb3RwIG9wdGlvbmFsIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgbG9naW4ob3RwID0gXCJcIik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgdGhpcy5zZXRPVFAob3RwIHx8IFwiXCIpO1xuICAgICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7IENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIgfSk7XG4gICAgICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gQVBJIGxvZ2luIHRvIHN0YXJ0IHNlc3Npb24tYmFzZWQgY29tbXVuaWNhdGlvbi5cbiAgICAgKiBVc2UgZ2l2ZW4gc3BlY2lmaWMgY29tbWFuZCBwYXJhbWV0ZXJzLlxuICAgICAqIEBwYXJhbSBwYXJhbXMgZ2l2ZW4gc3BlY2lmaWMgY29tbWFuZCBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGxvZ2luRXh0ZW5kZWQocGFyYW1zOiBhbnksIG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIHRoaXMuc2V0T1RQKG90cCk7XG4gICAgICAgIGNvbnN0IHJyID0gYXdhaXQgdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgQ09NTUFORDogXCJTdGFydFNlc3Npb25cIixcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gcnIuZ2V0Q29sdW1uKFwiU0VTU0lPTlwiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vzc2lvbihjb2wgPyBjb2wuZ2V0RGF0YSgpWzBdIDogXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gQVBJIGxvZ291dCB0byBjbG9zZSBBUEkgc2Vzc2lvbiBpbiB1c2VcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBsb2dvdXQoKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICAgICAgICBDT01NQU5EOiBcIkVuZFNlc3Npb25cIixcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTZXNzaW9uKFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSByZXF1ZXN0IHVzaW5nIHRoZSBnaXZlbiBjb21tYW5kXG4gICAgICogQHBhcmFtIGNtZCBBUEkgY29tbWFuZCB0byByZXF1ZXN0XG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVxdWVzdChjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZmxhdHRlbiBuZXN0ZWQgYXBpIGNvbW1hbmQgYnVsayBwYXJhbWV0ZXJzXG4gICAgICAgIGxldCBteWNtZCA9IHRoaXMuZmxhdHRlbkNvbW1hbmQoY21kKTtcblxuICAgICAgICAvLyBhdXRvIGNvbnZlcnQgdW1sYXV0IG5hbWVzIHRvIHB1bnljb2RlXG4gICAgICAgIG15Y21kID0gYXdhaXQgdGhpcy5hdXRvSUROQ29udmVydChteWNtZCk7XG5cbiAgICAgICAgLy8gcmVxdWVzdCBjb21tYW5kIHRvIEFQSVxuICAgICAgICBjb25zdCBjZmc6IGFueSA9IHtcbiAgICAgICAgICAgIENPTk5FQ1RJT05fVVJMOiB0aGlzLnNvY2tldFVSTCxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVE9ETzogMzAwcyAodG8gYmUgc3VyZSB0byBnZXQgYW4gQVBJIHJlc3BvbnNlKVxuICAgICAgICBjb25zdCByZXFDZmc6IGFueSA9IHtcbiAgICAgICAgICAgIC8vZW5jb2Rpbmc6IFwidXRmOFwiLCAvL2RlZmF1bHQgZm9yIHR5cGUgc3RyaW5nXG4gICAgICAgICAgICAvL2d6aXA6IHRydWUsXG4gICAgICAgICAgICBib2R5OiB0aGlzLmdldFBPU1REYXRhKG15Y21kKSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIlVzZXItQWdlbnRcIjogdGhpcy5nZXRVc2VyQWdlbnQoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdGltZW91dDogQVBJQ2xpZW50LnNvY2tldFRpbWVvdXQsXG4gICAgICAgICAgICB1cmw6IGNmZy5DT05ORUNUSU9OX1VSTCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcHJveHkgPSB0aGlzLmdldFByb3h5KCk7XG4gICAgICAgIGlmIChwcm94eSkge1xuICAgICAgICAgICAgcmVxQ2ZnLnByb3h5ID0gcHJveHk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVmZXJlciA9IHRoaXMuZ2V0UmVmZXJlcigpO1xuICAgICAgICBpZiAocmVmZXJlcikge1xuICAgICAgICAgICAgcmVxQ2ZnLmhlYWRlcnMuUmVmZXJlciA9IHJlZmVyZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZldGNoKGNmZy5DT05ORUNUSU9OX1VSTCwgcmVxQ2ZnKS50aGVuKGFzeW5jIChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBib2R5O1xuICAgICAgICAgICAgaWYgKHJlcy5vaykgeyAvLyByZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwXG4gICAgICAgICAgICAgICAgYm9keSA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yID0gcmVzLnN0YXR1cyArIChyZXMuc3RhdHVzVGV4dCA/IFwiIFwiICsgcmVzLnN0YXR1c1RleHQgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICBib2R5ID0gcnRtLmdldFRlbXBsYXRlKFwiaHR0cGVycm9yXCIpLmdldFBsYWluKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByciA9IG5ldyBSZXNwb25zZShib2R5LCBteWNtZCwgY2ZnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBycjtcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBydG0uZ2V0VGVtcGxhdGUoXCJodHRwZXJyb3JcIikuZ2V0UGxhaW4oKTtcbiAgICAgICAgICAgIGNvbnN0IHJyID0gbmV3IFJlc3BvbnNlKGJvZHksIG15Y21kLCBjZmcpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVidWdNb2RlICYmIHRoaXMubG9nZ2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKHRoaXMuZ2V0UE9TVERhdGEobXljbWQsIHRydWUpLCByciwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVyclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRoZSBuZXh0IHBhZ2Ugb2YgbGlzdCBlbnRyaWVzIGZvciB0aGUgY3VycmVudCBsaXN0IHF1ZXJ5XG4gICAgICogVXNlZnVsIGZvciB0YWJsZXNcbiAgICAgKiBAcGFyYW0gcnIgQVBJIFJlc3BvbnNlIG9mIGN1cnJlbnQgcGFnZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlIG9yIG51bGwgaW4gY2FzZSB0aGVyZSBhcmUgbm8gZnVydGhlciBsaXN0IGVudHJpZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVxdWVzdE5leHRSZXNwb25zZVBhZ2UocnI6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZSB8IG51bGw+IHtcbiAgICAgICAgY29uc3QgbXljbWQgPSByci5nZXRDb21tYW5kKCk7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobXljbWQsIFwiTEFTVFwiKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW1ldGVyIExBU1QgaW4gdXNlLiBQbGVhc2UgcmVtb3ZlIGl0IHRvIGF2b2lkIGlzc3VlcyBpbiByZXF1ZXN0TmV4dFBhZ2UuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmaXJzdCA9IDA7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobXljbWQsIFwiRklSU1RcIikpIHtcbiAgICAgICAgICAgIGZpcnN0ID0gbXljbWQuRklSU1Q7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG90YWwgPSByci5nZXRSZWNvcmRzVG90YWxDb3VudCgpO1xuICAgICAgICBjb25zdCBsaW1pdCA9IHJyLmdldFJlY29yZHNMaW1pdGF0aW9uKCk7XG4gICAgICAgIGZpcnN0ICs9IGxpbWl0O1xuICAgICAgICBpZiAoZmlyc3QgPCB0b3RhbCkge1xuICAgICAgICAgICAgbXljbWQuRklSU1QgPSBmaXJzdDtcbiAgICAgICAgICAgIG15Y21kLkxJTUlUID0gbGltaXQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG15Y21kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBhbGwgcGFnZXMvZW50cmllcyBmb3IgdGhlIGdpdmVuIHF1ZXJ5IGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gY21kIEFQSSBsaXN0IGNvbW1hbmQgdG8gdXNlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBhcnJheSBvZiBBUEkgUmVzcG9uc2VzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlcXVlc3RBbGxSZXNwb25zZVBhZ2VzKGNtZDogYW55KTogUHJvbWlzZTxSZXNwb25zZVtdPiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlczogUmVzcG9uc2VbXSA9IFtdO1xuICAgICAgICBjb25zdCBycjogUmVzcG9uc2UgPSBhd2FpdCB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbih7fSwgY21kLCB7IEZJUlNUOiAwIH0pKTtcbiAgICAgICAgbGV0IHRtcDogUmVzcG9uc2UgfCBudWxsID0gcnI7XG4gICAgICAgIGxldCBpZHggPSAwO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICByZXNwb25zZXNbaWR4KytdID0gdG1wO1xuICAgICAgICAgICAgdG1wID0gYXdhaXQgdGhpcy5yZXF1ZXN0TmV4dFJlc3BvbnNlUGFnZSh0bXApO1xuICAgICAgICB9IHdoaWxlICh0bXAgIT09IG51bGwpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2VzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGRhdGEgdmlldyB0byBhIGdpdmVuIHN1YnVzZXJcbiAgICAgKiBAcGFyYW0gdWlkIHN1YnVzZXIgYWNjb3VudCBuYW1lXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRVc2VyVmlldyh1aWQ6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFVzZXIodWlkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZGF0YSB2aWV3IGJhY2sgZnJvbSBzdWJ1c2VyIHRvIHVzZXJcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHJlc2V0VXNlclZpZXcoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0VXNlcihcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGUgSGlnaCBQZXJmb3JtYW5jZSBDb25uZWN0aW9uIFNldHVwXG4gICAgICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vaGV4b25ldC9ub2RlLXNkay9ibG9iL21hc3Rlci9SRUFETUUubWRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZUhpZ2hQZXJmb3JtYW5jZUNvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkxfUFJPWFkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY3RpdmF0ZSBEZWZhdWx0IENvbm5lY3Rpb24gU2V0dXAgKHRoZSBkZWZhdWx0KVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlRGVmYXVsdENvbm5lY3Rpb25TZXR1cCgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNldFVSTChJU1BBUElfQ09OTkVDVElPTl9VUkwpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgT1QmRSBTeXN0ZW0gZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyB1c2VPVEVTeXN0ZW0oKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiMTIzNFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IExJVkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvbiAodGhpcyBpcyB0aGUgZGVmYXVsdCBzZXR0aW5nKVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlTElWRVN5c3RlbSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRTeXN0ZW1FbnRpdHkoXCI1NGNkXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXJpYWxpemUgZ2l2ZW4gY29tbWFuZCBmb3IgUE9TVCByZXF1ZXN0IGluY2x1ZGluZyBjb25uZWN0aW9uIGNvbmZpZ3VyYXRpb24gZGF0YVxuICAgICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdG8gZW5jb2RlXG4gICAgICogQHJldHVybnMgZW5jb2RlZCBQT1NUIGRhdGEgc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIGdldFBPU1REYXRhKGNtZDogYW55LCBzZWN1cmVkID0gZmFsc2UpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuc29ja2V0Q29uZmlnLmdldFBPU1REYXRhKCk7XG4gICAgICAgIGlmIChzZWN1cmVkKSB7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9zX3B3PVteJl0rLywgXCJzX3B3PSoqKlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0bXAgPSBcIlwiO1xuICAgICAgICBpZiAoISh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY21kW2tleV0gIT09IG51bGwgJiYgY21kW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gYCR7a2V5fT0ke2NtZFtrZXldLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKX1cXG5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG1wID0gXCJcIiArIGNtZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VjdXJlZCkge1xuICAgICAgICAgICAgdG1wID0gdG1wLnJlcGxhY2UoL1BBU1NXT1JEPVteXFxuXSsvLCBcIlBBU1NXT1JEPSoqKlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0bXAgPSB0bXAucmVwbGFjZSgvXFxuJC8sIFwiXCIpO1xuICAgICAgICBkYXRhICs9IGAke2ZpeGVkVVJMRW5jKFwic19jb21tYW5kXCIpfT0ke2ZpeGVkVVJMRW5jKHRtcCl9YDtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmxhdHRlbiBuZXN0ZWQgYXJyYXlzIGluIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gY21kIGFwaSBjb21tYW5kXG4gICAgICogQHJldHVybnMgYXBpIGNvbW1hbmQgd2l0aCBmbGF0dGVuZGVkIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGZsYXR0ZW5Db21tYW5kKGNtZDogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgbmV3Y21kOiBhbnkgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMoY21kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsID0gY21kW2tleV07XG4gICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIGlmICh2YWwgIT09IG51bGwgJiYgdmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW2Ake25ld0tleX0ke2luZGV4fWBdID0gKHJvdyArIFwiXCIpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdjbWRbbmV3S2V5XSA9IHZhbC5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW25ld0tleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3Y21kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF1dG8gY29udmVydCBBUEkgY29tbWFuZCBwYXJhbWV0ZXJzIHRvIHB1bnljb2RlLCBpZiBuZWNlc3NhcnkuXG4gICAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXBpIGNvbW1hbmQgd2l0aCBJRE4gdmFsdWVzIHJlcGxhY2VkIHRvIHB1bnljb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBhdXRvSUROQ29udmVydChjbWQ6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIC8vIGRvbid0IGNvbnZlcnQgZm9yIGNvbnZlcnRpZG4gY29tbWFuZCB0byBhdm9pZCBlbmRsZXNzIGxvb3BcbiAgICAgICAgLy8gYW5kIGlnbm9yZSBjb21tYW5kcyBpbiBzdHJpbmcgZm9ybWF0IChldmVuIGRlcHJlY2F0ZWQpXG4gICAgICAgIGlmICh0eXBlb2YgY21kID09PSBcInN0cmluZ1wiIHx8IGNtZCBpbnN0YW5jZW9mIFN0cmluZyB8fCAvXkNPTlZFUlRJRE4kL2kudGVzdChjbWQuQ09NTUFORCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNtZCkuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAvXihET01BSU58TkFNRVNFUlZFUnxETlNaT05FKShbMC05XSopJC9pLnRlc3Qoa2V5KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9jb252ZXJ0OiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgaWR4czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQgJiYgL1teYS16MC05LlxcLSBdL2kudGVzdChjbWRba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0b2NvbnZlcnQucHVzaChjbWRba2V5XSk7XG4gICAgICAgICAgICAgICAgaWR4cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdG9jb252ZXJ0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNtZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHtcbiAgICAgICAgICAgIENPTU1BTkQ6IFwiQ29udmVydElETlwiLFxuICAgICAgICAgICAgRE9NQUlOOiB0b2NvbnZlcnQsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmRpcihyLmdldFBsYWluKCkpO1xuICAgICAgICBpZiAoci5pc1N1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgY29uc3QgY29sID0gci5nZXRDb2x1bW4oXCJBQ0VcIik7XG4gICAgICAgICAgICBpZiAoY29sKSB7XG4gICAgICAgICAgICAgICAgY29sLmdldERhdGEoKS5mb3JFYWNoKChwYzogc3RyaW5nLCBpZHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbWRbaWR4c1tpZHhdXSA9IHBjO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbWQ7XG4gICAgfVxufVxuIl19