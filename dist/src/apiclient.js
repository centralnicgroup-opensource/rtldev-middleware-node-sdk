"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient =
  exports.ISPAPI_CONNECTION_URL =
  exports.ISPAPI_CONNECTION_URL_PROXY =
    void 0;
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
    return sessid === "" ? null : sessid;
  };
  APIClient.prototype.getURL = function () {
    return this.socketURL;
  };
  APIClient.prototype.setUserAgent = function (str, rv, modules) {
    if (modules === void 0) {
      modules = [];
    }
    var mods = modules.length ? " " + modules.join(" ") : "";
    this.ua =
      str +
      " " +
      ("(" + process.platform + "; " + process.arch + "; rv:" + rv + ")") +
      mods +
      (" node-sdk/" + this.getVersion() + " ") +
      ("node/" + process.version);
    return this;
  };
  APIClient.prototype.getUserAgent = function () {
    if (!this.ua.length) {
      this.ua =
        "NODE-SDK (" +
        process.platform +
        "; " +
        process.arch +
        "; rv:" +
        this.getVersion() +
        ") " +
        ("node/" + process.version);
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
    if (otp === void 0) {
      otp = "";
    }
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
    if (otp === void 0) {
      otp = "";
    }
    return __awaiter(this, void 0, void 0, function () {
      var rr, col;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.setOTP(otp);
            return [
              4,
              this.request(
                Object.assign(
                  {
                    COMMAND: "StartSession",
                  },
                  params
                )
              ),
            ];
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
          case 0:
            return [
              4,
              this.request({
                COMMAND: "EndSession",
              }),
            ];
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
            return [
              2,
              node_fetch_1
                .default(cfg.CONNECTION_URL, reqCfg)
                .then(function (res) {
                  return __awaiter(_this, void 0, void 0, function () {
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
                          error =
                            res.status +
                            (res.statusText ? " " + res.statusText : "");
                          body = rtm.getTemplate("httperror").getPlain();
                          _a.label = 3;
                        case 3:
                          rr = new response_1.Response(body, mycmd, cfg);
                          if (this.debugMode && this.logger) {
                            this.logger.log(
                              this.getPOSTData(mycmd, true),
                              rr,
                              error
                            );
                          }
                          return [2, rr];
                      }
                    });
                  });
                })
                .catch(function (err) {
                  var body = rtm.getTemplate("httperror").getPlain();
                  var rr = new response_1.Response(body, mycmd, cfg);
                  if (_this.debugMode && _this.logger) {
                    _this.logger.log(
                      _this.getPOSTData(mycmd, true),
                      rr,
                      err.message
                    );
                  }
                  return err;
                }),
            ];
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
          throw new Error(
            "Parameter LAST in use. Please remove it to avoid issues in requestNextPage."
          );
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
        } else {
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
          case 5:
            return [2, responses];
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
    if (secured === void 0) {
      secured = false;
    }
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
    } else {
      tmp = "" + cmd;
    }
    if (secured) {
      tmp = tmp.replace(/PASSWORD=[^\n]+/, "PASSWORD=***");
    }
    tmp = tmp.replace(/\n$/, "");
    data +=
      socketconfig_1.fixedURLEnc("s_command") +
      "=" +
      socketconfig_1.fixedURLEnc(tmp);
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
        } else {
          if (typeof val === "string" || val instanceof String) {
            newcmd[newKey] = val.replace(/\r|\n/g, "");
          } else {
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
            if (
              typeof cmd === "string" ||
              cmd instanceof String ||
              /^CONVERTIDN$/i.test(cmd.COMMAND)
            ) {
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
              if (
                cmd[key] !== null &&
                cmd[key] !== undefined &&
                /[^a-z0-9.\- ]/i.test(cmd[key])
              ) {
                toconvert.push(cmd[key]);
                idxs.push(key);
              }
            });
            if (!toconvert.length) {
              return [2, cmd];
            }
            return [
              4,
              this.request({
                COMMAND: "ConvertIDN",
                DOMAIN: toconvert,
              }),
            ];
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
})();
exports.APIClient = APIClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpRUFBMEM7QUFDMUMsMERBQStCO0FBQy9CLG1DQUFrQztBQUNsQyx1Q0FBc0M7QUFDdEMscUVBQW9FO0FBQ3BFLCtDQUEyRDtBQUU5QyxRQUFBLDJCQUEyQixHQUFHLCtCQUErQixDQUFDO0FBQzlELFFBQUEscUJBQXFCLEdBQUcscUNBQXFDLENBQUM7QUFFM0UsSUFBTSxHQUFHLEdBQUcsaURBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFLbEQ7SUE4Qkk7UUFDSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsNkJBQXFCLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBT00sbUNBQWUsR0FBdEIsVUFBdUIsWUFBb0I7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUtNLG9DQUFnQixHQUF2QjtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS00s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QUFFLFlBQVk7Z0NBQ3JCLE1BQU0sRUFBRSxTQUFTOzZCQUNwQixDQUFDLEVBQUE7O3dCQUhJLENBQUMsR0FBRyxTQUdSO3dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzFCLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFOzRCQUNULEdBQUcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUMvQixJQUFJLEdBQUcsRUFBRTtnQ0FDTCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBVSxFQUFFLEdBQVE7b0NBQ3ZDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0NBQ3hCLENBQUMsQ0FBQyxDQUFDOzZCQUNOO3lCQUNKO3dCQUNELFdBQU8sR0FBRyxFQUFDOzs7O0tBQ2Q7SUEzakJzQix1QkFBYSxHQUFXLE1BQU0sQ0FBQztJQTRqQjFELGdCQUFDO0NBQUEsQUFoa0JELElBZ2tCQztBQWhrQlksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFja2FnZUluZm8gZnJvbSBcIi4uL3BhY2thZ2UuanNvblwiO1xuaW1wb3J0IGZldGNoIGZyb20gXCJub2RlLWZldGNoXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcbmltcG9ydCB7IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyIH0gZnJvbSBcIi4vcmVzcG9uc2V0ZW1wbGF0ZW1hbmFnZXJcIjtcbmltcG9ydCB7IGZpeGVkVVJMRW5jLCBTb2NrZXRDb25maWcgfSBmcm9tIFwiLi9zb2NrZXRjb25maWdcIjtcblxuZXhwb3J0IGNvbnN0IElTUEFQSV9DT05ORUNUSU9OX1VSTF9QUk9YWSA9IFwiaHR0cDovLzEyNy4wLjAuMS9hcGkvY2FsbC5jZ2lcIjtcbmV4cG9ydCBjb25zdCBJU1BBUElfQ09OTkVDVElPTl9VUkwgPSBcImh0dHBzOi8vYXBpLmlzcGFwaS5uZXQvYXBpL2NhbGwuY2dpXCI7XG5cbmNvbnN0IHJ0bSA9IFJlc3BvbnNlVGVtcGxhdGVNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQVBJQ2xpZW50IGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBBUElDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEFQSSBjb25uZWN0aW9uIHRpbWVvdXQgc2V0dGluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgc29ja2V0VGltZW91dDogbnVtYmVyID0gMzAwMDAwO1xuICAgIC8qKlxuICAgICAqIFVzZXIgQWdlbnQgc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSB1YTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEFQSSBjb25uZWN0aW9uIHVybFxuICAgICAqL1xuICAgIHByaXZhdGUgc29ja2V0VVJMOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogT2JqZWN0IGNvdmVyaW5nIEFQSSBjb25uZWN0aW9uIGRhdGFcbiAgICAgKi9cbiAgICBwcml2YXRlIHNvY2tldENvbmZpZzogU29ja2V0Q29uZmlnO1xuICAgIC8qKlxuICAgICAqIGFjdGl2aXR5IGZsYWcgZm9yIGRlYnVnIG1vZGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlYnVnTW9kZTogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBhZGRpdGlvbmFsIGNvbm5lY3Rpb24gc2V0dGluZ3NcbiAgICAgKi9cbiAgICBwcml2YXRlIGN1cmxvcHRzOiBhbnk7XG4gICAgLyoqXG4gICAgICogbG9nZ2VyIGZ1bmN0aW9uIGZvciBkZWJ1ZyBtb2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciB8IG51bGw7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudWEgPSBcIlwiO1xuICAgICAgICB0aGlzLnNvY2tldFVSTCA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0VVJMKElTUEFQSV9DT05ORUNUSU9OX1VSTCk7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnID0gbmV3IFNvY2tldENvbmZpZygpO1xuICAgICAgICB0aGlzLnVzZUxJVkVTeXN0ZW0oKTtcbiAgICAgICAgdGhpcy5jdXJsb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdExvZ2dlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldCBjdXN0b20gbG9nZ2VyIHRvIHVzZSBpbnN0ZWFkIG9mIGRlZmF1bHQgb25lXG4gICAgICogQHBhcmFtIGN1c3RvbUxvZ2dlclxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q3VzdG9tTG9nZ2VyKGN1c3RvbUxvZ2dlcjogTG9nZ2VyKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBjdXN0b21Mb2dnZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzZXQgZGVmYXVsdCBsb2dnZXIgdG8gdXNlXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXREZWZhdWx0TG9nZ2VyKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRW5hYmxlIERlYnVnIE91dHB1dCB0byBTVERPVVRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGVuYWJsZURlYnVnTW9kZSgpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmRlYnVnTW9kZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgRGVidWcgT3V0cHV0XG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBkaXNhYmxlRGVidWdNb2RlKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuZGVidWdNb2RlID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgQVBJIFNlc3Npb24gdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAgICogQHJldHVybnMgQVBJIFNlc3Npb24gb3IgbnVsbFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZXNzaW9uKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBjb25zdCBzZXNzaWQgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRTZXNzaW9uKCk7XG4gICAgICAgIHJldHVybiAoc2Vzc2lkID09PSBcIlwiKSA/IG51bGwgOiBzZXNzaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBBUEkgY29ubmVjdGlvbiB1cmwgdGhhdCBpcyBjdXJyZW50bHkgc2V0XG4gICAgICogQHJldHVybnMgQVBJIGNvbm5lY3Rpb24gdXJsIGN1cnJlbnRseSBpbiB1c2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VVJMKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvY2tldFVSTDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQb3NzaWJpbGl0eSB0byBjdXN0b21pemUgZGVmYXVsdCB1c2VyIGFnZW50IHRvIGZpdCB5b3VyIG5lZWRzXG4gICAgICogQHBhcmFtIHN0ciB1c2VyIGFnZW50IGxhYmVsXG4gICAgICogQHBhcmFtIHJ2IHJldmlzaW9uIG9mIHVzZXIgYWdlbnRcbiAgICAgKiBAcGFyYW0gbW9kdWxlcyBmdXJ0aGVyIG1vZHVsZXMgdG8gYWRkIHRvIHVzZXIgYWdlbnQgc3RyaW5nLCBmb3JtYXQ6IFtcIjxtb2QxPi88cmV2PlwiLCBcIjxtb2QyPi88cmV2PlwiLCAuLi4gXVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXNlckFnZW50KHN0cjogc3RyaW5nLCBydjogc3RyaW5nLCBtb2R1bGVzOiBhbnkgPSBbXSk6IEFQSUNsaWVudCB7XG4gICAgICAgIGNvbnN0IG1vZHMgPSBtb2R1bGVzLmxlbmd0aCA/IFwiIFwiICsgbW9kdWxlcy5qb2luKFwiIFwiKSA6IFwiXCI7XG4gICAgICAgIHRoaXMudWEgPSAoXG4gICAgICAgICAgICBgJHtzdHJ9IGAgK1xuICAgICAgICAgICAgYCgke3Byb2Nlc3MucGxhdGZvcm19OyAke3Byb2Nlc3MuYXJjaH07IHJ2OiR7cnZ9KWAgK1xuICAgICAgICAgICAgbW9kcyArXG4gICAgICAgICAgICBgIG5vZGUtc2RrLyR7dGhpcy5nZXRWZXJzaW9uKCl9IGAgK1xuICAgICAgICAgICAgYG5vZGUvJHtwcm9jZXNzLnZlcnNpb259YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIFVzZXIgQWdlbnRcbiAgICAgKiBAcmV0dXJucyBVc2VyIEFnZW50IHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLnVhLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy51YSA9IChcbiAgICAgICAgICAgICAgICBgTk9ERS1TREsgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07ICR7cHJvY2Vzcy5hcmNofTsgcnY6JHt0aGlzLmdldFZlcnNpb24oKX0pIGAgK1xuICAgICAgICAgICAgICAgIGBub2RlLyR7cHJvY2Vzcy52ZXJzaW9ufWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudWE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSBwcm94eSBwcm94eSBzZXJ2ZXIgdG8gdXNlIGZvciBjb21tdW5pY2F0aW9cbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3h5KHByb3h5OiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLmN1cmxvcHRzLnByb3h5ID0gcHJveHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcHJveHkgc2VydmVyIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcmV0dXJucyBwcm94eSBzZXJ2ZXIgY29uZmlndXJhdGlvbiB2YWx1ZSBvciBudWxsIGlmIG5vdCBzZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJveHkoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jdXJsb3B0cywgXCJwcm94eVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucHJveHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSByZWZlcmVyIHRvIHVzZSBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gcmVmZXJlciBSZWZlcmVyXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZWZlcmVyKHJlZmVyZXI6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuY3VybG9wdHMucmVmZXJlciA9IHJlZmVyZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVmZXJlciBjb25maWd1cmF0aW9uXG4gICAgICogQHJldHVybnMgcmVmZXJlciBjb25maWd1cmF0aW9uIHZhbHVlIG9yIG51bGwgaWYgbm90IHNldFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWZlcmVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuY3VybG9wdHMsIFwicmVmZXJlclwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VybG9wdHMucmVmZXJlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgbW9kdWxlIHZlcnNpb25cbiAgICAgKiBAcmV0dXJucyBtb2R1bGUgdmVyc2lvblxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwYWNrYWdlSW5mby52ZXJzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGx5IHNlc3Npb24gZGF0YSAoc2Vzc2lvbiBpZCBhbmQgc3lzdGVtIGVudGl0eSkgdG8gZ2l2ZW4gY2xpZW50IHJlcXVlc3Qgc2Vzc2lvblxuICAgICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2F2ZVNlc3Npb24oc2Vzc2lvbjogYW55KTogQVBJQ2xpZW50IHtcbiAgICAgICAgc2Vzc2lvbi5zb2NrZXRjZmcgPSB7XG4gICAgICAgICAgICBlbnRpdHk6IHRoaXMuc29ja2V0Q29uZmlnLmdldFN5c3RlbUVudGl0eSgpLFxuICAgICAgICAgICAgc2Vzc2lvbjogdGhpcy5zb2NrZXRDb25maWcuZ2V0U2Vzc2lvbigpLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgZXhpc3RpbmcgY29uZmlndXJhdGlvbiBvdXQgb2YgQ2xpZW50UmVxdWVzdCBzZXNzaW9uXG4gICAgICogdG8gcmVidWlsZCBhbmQgcmV1c2UgY29ubmVjdGlvbiBzZXR0aW5nc1xuICAgICAqIEBwYXJhbSBzZXNzaW9uIENsaWVudFJlcXVlc3Qgc2Vzc2lvbiBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgcmV1c2VTZXNzaW9uKHNlc3Npb246IGFueSk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShzZXNzaW9uLnNvY2tldGNmZy5lbnRpdHkpO1xuICAgICAgICB0aGlzLnNldFNlc3Npb24oc2Vzc2lvbi5zb2NrZXRjZmcuc2Vzc2lvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhbm90aGVyIGNvbm5lY3Rpb24gdXJsIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHZhbHVlIEFQSSBjb25uZWN0aW9uIHVybCB0byBzZXRcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFVSTCh2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRVUkwgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IG9uZSB0aW1lIHBhc3N3b3JkIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHZhbHVlIG9uZSB0aW1lIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRPVFAodmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldE9UUCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhbiBBUEkgc2Vzc2lvbiBpZCB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEBwYXJhbSB2YWx1ZSBBUEkgc2Vzc2lvbiBpZFxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0U2Vzc2lvbih2YWx1ZTogc3RyaW5nKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U2Vzc2lvbih2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhbiBSZW1vdGUgSVAgQWRkcmVzcyB0byBiZSB1c2VkIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIFRvIGJlIHVzZWQgaW4gY2FzZSB5b3UgaGF2ZSBhbiBhY3RpdmUgaXAgZmlsdGVyIHNldHRpbmcuXG4gICAgICogQHBhcmFtIHZhbHVlIFJlbW90ZSBJUCBBZGRyZXNzXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZW1vdGVJUEFkZHJlc3ModmFsdWU6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFJlbW90ZUFkZHJlc3ModmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgQ3JlZGVudGlhbHMgdG8gYmUgdXNlZCBmb3IgQVBJIGNvbW11bmljYXRpb25cbiAgICAgKiBAcGFyYW0gdWlkIGFjY291bnQgbmFtZVxuICAgICAqIEBwYXJhbSBwdyBhY2NvdW50IHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDcmVkZW50aWFscyh1aWQ6IHN0cmluZywgcHc6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldExvZ2luKHVpZCk7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFBhc3N3b3JkKHB3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IENyZWRlbnRpYWxzIHRvIGJlIHVzZWQgZm9yIEFQSSBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIHVpZCBhY2NvdW50IG5hbWVcbiAgICAgKiBAcGFyYW0gcm9sZSByb2xlIHVzZXIgaWRcbiAgICAgKiBAcGFyYW0gcHcgcm9sZSB1c2VyIHBhc3N3b3JkXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSb2xlQ3JlZGVudGlhbHModWlkOiBzdHJpbmcsIHJvbGU6IHN0cmluZywgcHc6IHN0cmluZyk6IEFQSUNsaWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldENyZWRlbnRpYWxzKHJvbGUgPyBgJHt1aWR9ISR7cm9sZX1gIDogdWlkLCBwdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBBUEkgbG9naW4gdG8gc3RhcnQgc2Vzc2lvbi1iYXNlZCBjb21tdW5pY2F0aW9uXG4gICAgICogQHBhcmFtIG90cCBvcHRpb25hbCBvbmUgdGltZSBwYXNzd29yZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGxvZ2luKG90cCA9IFwiXCIpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIHRoaXMuc2V0T1RQKG90cCB8fCBcIlwiKTtcbiAgICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3QoeyBDT01NQU5EOiBcIlN0YXJ0U2Vzc2lvblwiIH0pO1xuICAgICAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHJyLmdldENvbHVtbihcIlNFU1NJT05cIik7XG4gICAgICAgICAgICB0aGlzLnNldFNlc3Npb24oY29sID8gY29sLmdldERhdGEoKVswXSA6IFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSBsb2dpbiB0byBzdGFydCBzZXNzaW9uLWJhc2VkIGNvbW11bmljYXRpb24uXG4gICAgICogVXNlIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAgICAgKiBAcGFyYW0gcGFyYW1zIGdpdmVuIHNwZWNpZmljIGNvbW1hbmQgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSBvdHAgb3B0aW9uYWwgb25lIHRpbWUgcGFzc3dvcmRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBsb2dpbkV4dGVuZGVkKHBhcmFtczogYW55LCBvdHAgPSBcIlwiKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICB0aGlzLnNldE9UUChvdHApO1xuICAgICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIENPTU1BTkQ6IFwiU3RhcnRTZXNzaW9uXCIsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHJyLmdldENvbHVtbihcIlNFU1NJT05cIik7XG4gICAgICAgICAgICB0aGlzLnNldFNlc3Npb24oY29sID8gY29sLmdldERhdGEoKVswXSA6IFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIEFQSSBsb2dvdXQgdG8gY2xvc2UgQVBJIHNlc3Npb24gaW4gdXNlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBBUEkgUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgbG9nb3V0KCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlcXVlc3Qoe1xuICAgICAgICAgICAgQ09NTUFORDogXCJFbmRTZXNzaW9uXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocnIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vzc2lvbihcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBBUEkgcmVxdWVzdCB1c2luZyB0aGUgZ2l2ZW4gY29tbWFuZFxuICAgICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdG8gcmVxdWVzdFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggQVBJIFJlc3BvbnNlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlcXVlc3QoY21kOiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGZsYXR0ZW4gbmVzdGVkIGFwaSBjb21tYW5kIGJ1bGsgcGFyYW1ldGVyc1xuICAgICAgICBsZXQgbXljbWQgPSB0aGlzLmZsYXR0ZW5Db21tYW5kKGNtZCk7XG5cbiAgICAgICAgLy8gYXV0byBjb252ZXJ0IHVtbGF1dCBuYW1lcyB0byBwdW55Y29kZVxuICAgICAgICBteWNtZCA9IGF3YWl0IHRoaXMuYXV0b0lETkNvbnZlcnQobXljbWQpO1xuXG4gICAgICAgIC8vIHJlcXVlc3QgY29tbWFuZCB0byBBUElcbiAgICAgICAgY29uc3QgY2ZnOiBhbnkgPSB7XG4gICAgICAgICAgICBDT05ORUNUSU9OX1VSTDogdGhpcy5zb2NrZXRVUkwsXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IDMwMHMgKHRvIGJlIHN1cmUgdG8gZ2V0IGFuIEFQSSByZXNwb25zZSlcbiAgICAgICAgY29uc3QgcmVxQ2ZnOiBhbnkgPSB7XG4gICAgICAgICAgICAvL2VuY29kaW5nOiBcInV0ZjhcIiwgLy9kZWZhdWx0IGZvciB0eXBlIHN0cmluZ1xuICAgICAgICAgICAgLy9nemlwOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogdGhpcy5nZXRQT1NURGF0YShteWNtZCksXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJVc2VyLUFnZW50XCI6IHRoaXMuZ2V0VXNlckFnZW50KCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHRpbWVvdXQ6IEFQSUNsaWVudC5zb2NrZXRUaW1lb3V0LFxuICAgICAgICAgICAgdXJsOiBjZmcuQ09OTkVDVElPTl9VUkwsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHByb3h5ID0gdGhpcy5nZXRQcm94eSgpO1xuICAgICAgICBpZiAocHJveHkpIHtcbiAgICAgICAgICAgIHJlcUNmZy5wcm94eSA9IHByb3h5O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlZmVyZXIgPSB0aGlzLmdldFJlZmVyZXIoKTtcbiAgICAgICAgaWYgKHJlZmVyZXIpIHtcbiAgICAgICAgICAgIHJlcUNmZy5oZWFkZXJzLlJlZmVyZXIgPSByZWZlcmVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmZXRjaChjZmcuQ09OTkVDVElPTl9VUkwsIHJlcUNmZykudGhlbihhc3luYyAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICBsZXQgYm9keTtcbiAgICAgICAgICAgIGlmIChyZXMub2spIHsgLy8gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMFxuICAgICAgICAgICAgICAgIGJvZHkgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHJlcy5zdGF0dXMgKyAocmVzLnN0YXR1c1RleHQgPyBcIiBcIiArIHJlcy5zdGF0dXNUZXh0IDogXCJcIik7XG4gICAgICAgICAgICAgICAgYm9keSA9IHJ0bS5nZXRUZW1wbGF0ZShcImh0dHBlcnJvclwiKS5nZXRQbGFpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcnIgPSBuZXcgUmVzcG9uc2UoYm9keSwgbXljbWQsIGNmZyk7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWJ1Z01vZGUgJiYgdGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2codGhpcy5nZXRQT1NURGF0YShteWNtZCwgdHJ1ZSksIHJyLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnI7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gcnRtLmdldFRlbXBsYXRlKFwiaHR0cGVycm9yXCIpLmdldFBsYWluKCk7XG4gICAgICAgICAgICBjb25zdCByciA9IG5ldyBSZXNwb25zZShib2R5LCBteWNtZCwgY2ZnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnTW9kZSAmJiB0aGlzLmxvZ2dlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0aGlzLmdldFBPU1REYXRhKG15Y21kLCB0cnVlKSwgcnIsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlcnJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0aGUgbmV4dCBwYWdlIG9mIGxpc3QgZW50cmllcyBmb3IgdGhlIGN1cnJlbnQgbGlzdCBxdWVyeVxuICAgICAqIFVzZWZ1bCBmb3IgdGFibGVzXG4gICAgICogQHBhcmFtIHJyIEFQSSBSZXNwb25zZSBvZiBjdXJyZW50IHBhZ2VcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIEFQSSBSZXNwb25zZSBvciBudWxsIGluIGNhc2UgdGhlcmUgYXJlIG5vIGZ1cnRoZXIgbGlzdCBlbnRyaWVzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlcXVlc3ROZXh0UmVzcG9uc2VQYWdlKHJyOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2UgfCBudWxsPiB7XG4gICAgICAgIGNvbnN0IG15Y21kID0gcnIuZ2V0Q29tbWFuZCgpO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkxBU1RcIikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmFtZXRlciBMQVNUIGluIHVzZS4gUGxlYXNlIHJlbW92ZSBpdCB0byBhdm9pZCBpc3N1ZXMgaW4gcmVxdWVzdE5leHRQYWdlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZmlyc3QgPSAwO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG15Y21kLCBcIkZJUlNUXCIpKSB7XG4gICAgICAgICAgICBmaXJzdCA9IG15Y21kLkZJUlNUO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsID0gcnIuZ2V0UmVjb3Jkc1RvdGFsQ291bnQoKTtcbiAgICAgICAgY29uc3QgbGltaXQgPSByci5nZXRSZWNvcmRzTGltaXRhdGlvbigpO1xuICAgICAgICBmaXJzdCArPSBsaW1pdDtcbiAgICAgICAgaWYgKGZpcnN0IDwgdG90YWwpIHtcbiAgICAgICAgICAgIG15Y21kLkZJUlNUID0gZmlyc3Q7XG4gICAgICAgICAgICBteWNtZC5MSU1JVCA9IGxpbWl0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChteWNtZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYWxsIHBhZ2VzL2VudHJpZXMgZm9yIHRoZSBnaXZlbiBxdWVyeSBjb21tYW5kXG4gICAgICogQHBhcmFtIGNtZCBBUEkgbGlzdCBjb21tYW5kIHRvIHVzZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdpdGggYXJyYXkgb2YgQVBJIFJlc3BvbnNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyByZXF1ZXN0QWxsUmVzcG9uc2VQYWdlcyhjbWQ6IGFueSk6IFByb21pc2U8UmVzcG9uc2VbXT4ge1xuICAgICAgICBjb25zdCByZXNwb25zZXM6IFJlc3BvbnNlW10gPSBbXTtcbiAgICAgICAgY29uc3QgcnI6IFJlc3BvbnNlID0gYXdhaXQgdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24oe30sIGNtZCwgeyBGSVJTVDogMCB9KSk7XG4gICAgICAgIGxldCB0bXA6IFJlc3BvbnNlIHwgbnVsbCA9IHJyO1xuICAgICAgICBsZXQgaWR4ID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgcmVzcG9uc2VzW2lkeCsrXSA9IHRtcDtcbiAgICAgICAgICAgIHRtcCA9IGF3YWl0IHRoaXMucmVxdWVzdE5leHRSZXNwb25zZVBhZ2UodG1wKTtcbiAgICAgICAgfSB3aGlsZSAodG1wICE9PSBudWxsKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBkYXRhIHZpZXcgdG8gYSBnaXZlbiBzdWJ1c2VyXG4gICAgICogQHBhcmFtIHVpZCBzdWJ1c2VyIGFjY291bnQgbmFtZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXNlclZpZXcodWlkOiBzdHJpbmcpOiBBUElDbGllbnQge1xuICAgICAgICB0aGlzLnNvY2tldENvbmZpZy5zZXRVc2VyKHVpZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGRhdGEgdmlldyBiYWNrIGZyb20gc3VidXNlciB0byB1c2VyXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyByZXNldFVzZXJWaWV3KCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFVzZXIoXCJcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlIEhpZ2ggUGVyZm9ybWFuY2UgQ29ubmVjdGlvbiBTZXR1cFxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2hleG9uZXQvbm9kZS1zZGsvYmxvYi9tYXN0ZXIvUkVBRE1FLm1kXG4gICAgICogQHJldHVybnMgQ3VycmVudCBBUElDbGllbnQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyB1c2VIaWdoUGVyZm9ybWFuY2VDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMX1BST1hZKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGUgRGVmYXVsdCBDb25uZWN0aW9uIFNldHVwICh0aGUgZGVmYXVsdClcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZURlZmF1bHRDb25uZWN0aW9uU2V0dXAoKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zZXRVUkwoSVNQQVBJX0NPTk5FQ1RJT05fVVJMKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IE9UJkUgU3lzdGVtIGZvciBBUEkgY29tbXVuaWNhdGlvblxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgQVBJQ2xpZW50IGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgdXNlT1RFU3lzdGVtKCk6IEFQSUNsaWVudCB7XG4gICAgICAgIHRoaXMuc29ja2V0Q29uZmlnLnNldFN5c3RlbUVudGl0eShcIjEyMzRcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBMSVZFIFN5c3RlbSBmb3IgQVBJIGNvbW11bmljYXRpb24gKHRoaXMgaXMgdGhlIGRlZmF1bHQgc2V0dGluZylcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IEFQSUNsaWVudCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIHVzZUxJVkVTeXN0ZW0oKTogQVBJQ2xpZW50IHtcbiAgICAgICAgdGhpcy5zb2NrZXRDb25maWcuc2V0U3lzdGVtRW50aXR5KFwiNTRjZFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplIGdpdmVuIGNvbW1hbmQgZm9yIFBPU1QgcmVxdWVzdCBpbmNsdWRpbmcgY29ubmVjdGlvbiBjb25maWd1cmF0aW9uIGRhdGFcbiAgICAgKiBAcGFyYW0gY21kIEFQSSBjb21tYW5kIHRvIGVuY29kZVxuICAgICAqIEByZXR1cm5zIGVuY29kZWQgUE9TVCBkYXRhIHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQT1NURGF0YShjbWQ6IGFueSwgc2VjdXJlZCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLnNvY2tldENvbmZpZy5nZXRQT1NURGF0YSgpO1xuICAgICAgICBpZiAoc2VjdXJlZCkge1xuICAgICAgICAgICAgZGF0YSA9IGRhdGEucmVwbGFjZSgvc19wdz1bXiZdKy8sIFwic19wdz0qKipcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdG1wID0gXCJcIjtcbiAgICAgICAgaWYgKCEodHlwZW9mIGNtZCA9PT0gXCJzdHJpbmdcIiB8fCBjbWQgaW5zdGFuY2VvZiBTdHJpbmcpKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbWQpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNtZFtrZXldICE9PSBudWxsICYmIGNtZFtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wICs9IGAke2tleX09JHtjbWRba2V5XS50b1N0cmluZygpLnJlcGxhY2UoL1xccnxcXG4vZywgXCJcIil9XFxuYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRtcCA9IFwiXCIgKyBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlY3VyZWQpIHtcbiAgICAgICAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9QQVNTV09SRD1bXlxcbl0rLywgXCJQQVNTV09SRD0qKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgdG1wID0gdG1wLnJlcGxhY2UoL1xcbiQvLCBcIlwiKTtcbiAgICAgICAgZGF0YSArPSBgJHtmaXhlZFVSTEVuYyhcInNfY29tbWFuZFwiKX09JHtmaXhlZFVSTEVuYyh0bXApfWA7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZsYXR0ZW4gbmVzdGVkIGFycmF5cyBpbiBjb21tYW5kXG4gICAgICogQHBhcmFtIGNtZCBhcGkgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIGFwaSBjb21tYW5kIHdpdGggZmxhdHRlbmRlZCBwYXJhbWV0ZXJzXG4gICAgICovXG4gICAgcHJpdmF0ZSBmbGF0dGVuQ29tbWFuZChjbWQ6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IG5ld2NtZDogYW55ID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKGNtZCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9IGNtZFtrZXldO1xuICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAodmFsICE9PSBudWxsICYmIHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld2NtZFtgJHtuZXdLZXl9JHtpbmRleH1gXSA9IChyb3cgKyBcIlwiKS5yZXBsYWNlKC9cXHJ8XFxuL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y21kW25ld0tleV0gPSB2YWwucmVwbGFjZSgvXFxyfFxcbi9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld2NtZFtuZXdLZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld2NtZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdXRvIGNvbnZlcnQgQVBJIGNvbW1hbmQgcGFyYW1ldGVycyB0byBwdW55Y29kZSwgaWYgbmVjZXNzYXJ5LlxuICAgICAqIEBwYXJhbSBjbWQgYXBpIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFwaSBjb21tYW5kIHdpdGggSUROIHZhbHVlcyByZXBsYWNlZCB0byBwdW55Y29kZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgYXV0b0lETkNvbnZlcnQoY21kOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICAvLyBkb24ndCBjb252ZXJ0IGZvciBjb252ZXJ0aWRuIGNvbW1hbmQgdG8gYXZvaWQgZW5kbGVzcyBsb29wXG4gICAgICAgIC8vIGFuZCBpZ25vcmUgY29tbWFuZHMgaW4gc3RyaW5nIGZvcm1hdCAoZXZlbiBkZXByZWNhdGVkKVxuICAgICAgICBpZiAodHlwZW9mIGNtZCA9PT0gXCJzdHJpbmdcIiB8fCBjbWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgL15DT05WRVJUSUROJC9pLnRlc3QoY21kLkNPTU1BTkQpKSB7XG4gICAgICAgICAgICByZXR1cm4gY21kO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjbWQpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gL14oRE9NQUlOfE5BTUVTRVJWRVJ8RE5TWk9ORSkoWzAtOV0qKSQvaS50ZXN0KGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY21kO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvY29udmVydDogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGlkeHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjbWRba2V5XSAhPT0gbnVsbCAmJiBjbWRba2V5XSAhPT0gdW5kZWZpbmVkICYmIC9bXmEtejAtOS5cXC0gXS9pLnRlc3QoY21kW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgdG9jb252ZXJ0LnB1c2goY21kW2tleV0pO1xuICAgICAgICAgICAgICAgIGlkeHMucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXRvY29udmVydC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjbWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgciA9IGF3YWl0IHRoaXMucmVxdWVzdCh7XG4gICAgICAgICAgICBDT01NQU5EOiBcIkNvbnZlcnRJRE5cIixcbiAgICAgICAgICAgIERPTUFJTjogdG9jb252ZXJ0LFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5kaXIoci5nZXRQbGFpbigpKTtcbiAgICAgICAgaWYgKHIuaXNTdWNjZXNzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHIuZ2V0Q29sdW1uKFwiQUNFXCIpO1xuICAgICAgICAgICAgaWYgKGNvbCkge1xuICAgICAgICAgICAgICAgIGNvbC5nZXREYXRhKCkuZm9yRWFjaCgocGM6IHN0cmluZywgaWR4OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY21kW2lkeHNbaWR4XV0gPSBwYztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY21kO1xuICAgIH1cbn1cbiJdfQ==
