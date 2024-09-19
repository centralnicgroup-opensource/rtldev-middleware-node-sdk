import fetch from "cross-fetch";
import { Logger } from "./logger.js";
import { Response } from "./response.js";
import { ResponseTemplateManager } from "./responsetemplatemanager.js";
import { fixedURLEnc, SocketConfig } from "./socketconfig.js";
import { toAscii } from "idna-uts46-hx";

export const CNR_CONNECTION_URL_PROXY = "http://127.0.0.1/api/call.cgi";
export const CNR_CONNECTION_URL_LIVE = "https://api.rrpproxy.net/api/call.cgi";
export const CNR_CONNECTION_URL_OTE =
  "https://api-ote.rrpproxy.net/api/call.cgi";

const rtm = ResponseTemplateManager.getInstance();

/**
 * APIClient class
 */
export class APIClient {
  /**
   * API connection timeout setting
   */
  public static readonly socketTimeout: number = 300000;
  /**
   * User Agent string
   */
  private ua: string;
  /**
   * API connection url
   */
  private socketURL: string;
  /**
   * Object covering API connection data
   */
  private socketConfig: SocketConfig;
  /**
   * activity flag for debug mode
   */
  private debugMode: boolean;
  /**
   * additional connection settings
   */
  private curlopts: any;
  /**
   * logger function for debug mode
   */
  private logger: Logger | null;
  /**
   * set sub user account
   */
  private subUser: string;
  /**
   * set sub user account role seperater
   */
  private readonly roleSeparator: string = ":";

  public constructor() {
    this.ua = "";
    this.socketURL = "";
    this.debugMode = false;
    this.setURL(CNR_CONNECTION_URL_LIVE);
    this.socketConfig = new SocketConfig();
    this.useLIVESystem();
    this.curlopts = {};
    this.logger = null;
    this.subUser = "";
    this.roleSeparator = ":";
    this.setDefaultLogger();
  }

  /**
   * set custom logger to use instead of default one
   * @param customLogger
   * @returns Current APIClient instance for method chaining
   */
  public setCustomLogger(customLogger: Logger): APIClient {
    this.logger = customLogger;
    return this;
  }
  /**
   * set default logger to use
   * @returns Current APIClient instance for method chaining
   */
  public setDefaultLogger(): APIClient {
    this.logger = new Logger();
    return this;
  }
  /**
   * Enable Debug Output to STDOUT
   * @returns Current APIClient instance for method chaining
   */
  public enableDebugMode(): APIClient {
    this.debugMode = true;
    return this;
  }

  /**
   * Disable Debug Output
   * @returns Current APIClient instance for method chaining
   */
  public disableDebugMode(): APIClient {
    this.debugMode = false;
    return this;
  }

  /**
   * Get the API connection url that is currently set
   * @returns API connection url currently in use
   */
  public getURL(): string {
    return this.socketURL;
  }

  /**
   * Possibility to customize default user agent to fit your needs
   * @param str user agent label
   * @param rv revision of user agent
   * @param modules further modules to add to user agent string, format: ["<mod1>/<rev>", "<mod2>/<rev>", ... ]
   * @returns Current APIClient instance for method chaining
   */
  public setUserAgent(str: string, rv: string, modules: any = []): APIClient {
    const mods = modules.length ? " " + modules.join(" ") : "";
    this.ua =
      `${str} ` +
      `(${process.platform}; ${process.arch}; rv:${rv})` +
      mods +
      ` node-sdk/${this.getVersion()} ` +
      `node/${process.version}`;
    return this;
  }

  /**
   * Get the User Agent
   * @returns User Agent string
   */
  public getUserAgent(): string {
    if (!this.ua.length) {
      this.ua =
        `NODE-SDK (${process.platform}; ${process.arch
        }; rv:${this.getVersion()}) ` + `node/${process.version}`;
    }
    return this.ua;
  }

  /**
   * Set the proxy server to use for API communication
   * @param proxy proxy server to use for communicatio
   * @returns Current APIClient instance for method chaining
   */
  public setProxy(proxy: string): APIClient {
    this.curlopts.proxy = proxy;
    return this;
  }

  /**
   * Get the proxy server configuration
   * @returns proxy server configuration value or null if not set
   */
  public getProxy(): string | null {
    if (Object.prototype.hasOwnProperty.call(this.curlopts, "proxy")) {
      return this.curlopts.proxy;
    }
    return null;
  }

  /**
   * Set the referer to use for API communication
   * @param referer Referer
   * @returns Current APIClient instance for method chaining
   */
  public setReferer(referer: string): APIClient {
    this.curlopts.referer = referer;
    return this;
  }

  /**
   * Get the referer configuration
   * @returns referer configuration value or null if not set
   */
  public getReferer(): string | null {
    if (Object.prototype.hasOwnProperty.call(this.curlopts, "referer")) {
      return this.curlopts.referer;
    }
    return null;
  }

  /**
   * Get the current module version
   * @returns module version
   */
  public getVersion(): string {
    return "8.0.2";
  }

  /**
   * Apply session data (session id and system entity) to given client request session
   * @param session ClientRequest session instance
   * @returns Current APIClient instance for method chaining
   */
  public saveSession(session: any): APIClient {
    session.socketcfg = {
      login: this.socketConfig.getLogin(),
      session: this.socketConfig.getSession(),
    };
    return this;
  }

  /**
   * Use existing configuration out of ClientRequest session
   * to rebuild and reuse connection settings
   * @param session ClientRequest session instance
   * @returns Current APIClient instance for method chaining
   */
  public reuseSession(session: any): APIClient {
    if (!session || !session.socketcfg || !session.socketcfg.login || !session.socketcfg.session) {
      return this;
    }
    this.setCredentials(session.socketcfg.login);
    this.socketConfig.setSession(session.socketcfg.session);
    return this;
  }

  /**
   * Set another connection url to be used for API communication
   * @param value API connection url to set
   * @returns Current APIClient instance for method chaining
   */
  public setURL(value: string): APIClient {
    this.socketURL = value;
    return this;
  }

  /**
 * Set Persistent to request session id for API communication
 * @param value API session id
 * @returns Current APIClient instance for method chaining
 */
  public setPersistent(): APIClient {
    this.socketConfig.setPersistent();
    return this;
  }

  /**
   * Set Credentials to be used for API communication
   * @param uid account name
   * @param pw account password
   * @returns Current APIClient instance for method chaining
   */
  public setCredentials(uid: string, pw: string = ""): APIClient {
    this.socketConfig.setLogin(uid);
    this.socketConfig.setPassword(pw);
    return this;
  }

  /**
   * Set Credentials to be used for API communication
   * @param uid account name
   * @param role role user id
   * @param pw role user password
   * @returns Current APIClient instance for method chaining
   */
  public setRoleCredentials(
    uid: string,
    role: string,
    pw: string = "",
  ): APIClient {
    return this.setCredentials(
      role ? `${uid}${this.roleSeparator}${role}` : uid,
      pw,
    );
  }

  /**
   * Perform API login to start session-based communication
   * @param otp optional one time password
   * @returns Promise resolving with API Response
   */
  public async login(): Promise<Response> {
    this.setPersistent();
    const rr = await this.request({}, false);
    this.socketConfig.setSession("");
    if (rr.isSuccess()) {
      const col = rr.getColumn("SESSIONID");
      this.socketConfig.setSession(col ? col.getData()[0] : "");
    }
    return rr;
  }

  /**
   * Perform API logout to close API session in use
   * @returns Promise resolving with API Response
   */
  public async logout(): Promise<Response> {
    const rr = await this.request(
      {
        COMMAND: "StopSession",
      },
      false,
    );
    if (rr.isSuccess()) {
      this.socketConfig.setSession("");
    }
    return rr;
  }

  /**
   * Perform API request using the given command
   * @param cmd API command to request
   * @returns Promise resolving with API Response
   */
  public async request(cmd: any, setUserView = true): Promise<Response> {
    // set sub user id if available
    if (setUserView && this.subUser !== "") {
      cmd.SUBUSER = this.subUser;
    }

    // flatten nested api command bulk parameters
    let mycmd = this.flattenCommand(cmd);

    // auto convert umlaut names to punycode
    mycmd = await this.autoIDNConvert(mycmd);

    // request command to API
    const cfg: any = {
      CONNECTION_URL: this.socketURL,
    };
    // TODO: 300s (to be sure to get an API response)
    const reqCfg: any = {
      // encoding: "utf8", //default for type string
      // gzip: true,
      body: this.getPOSTData(mycmd),
      headers: {
        "User-Agent": this.getUserAgent(),
      },
      method: "POST",
      timeout: APIClient.socketTimeout,
      url: cfg.CONNECTION_URL,
    };
    const proxy = this.getProxy();
    if (proxy) {
      reqCfg.proxy = proxy;
    }
    const referer = this.getReferer();
    if (referer) {
      reqCfg.headers.Referer = referer;
    }
    return fetch(cfg.CONNECTION_URL, reqCfg)
      .then(async (res: any) => {
        let error = null;
        let body;
        if (res.ok) {
          // res.status >= 200 && res.status < 300
          body = await res.text();
        } else {
          error = res.status + (res.statusText ? " " + res.statusText : "");
          body = rtm.getTemplate("httperror").getPlain();
        }
        const rr = new Response(body, mycmd, cfg);
        if (this.debugMode && this.logger) {
          this.logger.log(this.getPOSTData(mycmd, true), rr, error);
        }
        return rr;
      })
      .catch((err) => {
        const body = rtm.getTemplate("httperror").getPlain();
        const rr = new Response(body, mycmd, cfg);
        if (this.debugMode && this.logger) {
          this.logger.log(this.getPOSTData(mycmd, true), rr, err.message);
        }
        return rr;
      });
  }

  /**
   * Request the next page of list entries for the current list query
   * Useful for tables
   * @param rr API Response of current page
   * @returns Promise resolving with API Response or null in case there are no further list entries
   */
  public async requestNextResponsePage(rr: Response): Promise<Response | null> {
    const mycmd = rr.getCommand();
    if (Object.prototype.hasOwnProperty.call(mycmd, "LAST")) {
      throw new Error(
        "Parameter LAST in use. Please remove it to avoid issues in requestNextPage.",
      );
    }
    let first = 0;
    if (Object.prototype.hasOwnProperty.call(mycmd, "FIRST")) {
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

    return null;
  }

  /**
   * Request all pages/entries for the given query command
   * @param cmd API list command to use
   * @returns Promise resolving with array of API Responses
   */
  public async requestAllResponsePages(cmd: any): Promise<Response[]> {
    const responses: Response[] = [];
    let rr: Response | null = await this.request({ ...cmd, FIRST: 0 });

    while (rr !== null) {
      responses.push(rr);
      rr = await this.requestNextResponsePage(rr);
    }

    return responses;
  }

  /**
   * Set a data view to a given subuser
   * @param uid subuser account name
   * @returns Current APIClient instance for method chaining
   */
  public setUserView(uid: string): APIClient {
    this.subUser = uid;
    return this;
  }

  /**
   * Reset data view back from subuser to user
   * @returns Current APIClient instance for method chaining
   */
  public resetUserView(): APIClient {
    this.subUser = "";
    return this;
  }

  /**
   * Activate High Performance Connection Setup
   * @see https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/README.md
   * @returns Current APIClient instance for method chaining
   */
  public useHighPerformanceConnectionSetup(): APIClient {
    this.setURL(CNR_CONNECTION_URL_PROXY);
    return this;
  }

  /**
   * Activate Default Connection Setup (the default)
   * @returns Current APIClient instance for method chaining
   */
  public useDefaultConnectionSetup(): APIClient {
    this.setURL(CNR_CONNECTION_URL_LIVE);
    return this;
  }

  /**
   * Set OT&E System for API communication
   * @returns Current APIClient instance for method chaining
   */
  public useOTESystem(): APIClient {
    this.setURL(CNR_CONNECTION_URL_OTE);
    return this;
  }

  /**
   * Set LIVE System for API communication (this is the default setting)
   * @returns Current APIClient instance for method chaining
   */
  public useLIVESystem(): APIClient {
    this.setURL(CNR_CONNECTION_URL_LIVE);
    return this;
  }

  /**
   * Serialize given command for POST request including connection configuration data
   * @param cmd API command to encode
   * @returns encoded POST data string
   */
  public getPOSTData(cmd: any, secured = false): string {
    let data = this.socketConfig.getPOSTData();
    if (secured) {
      data = data.replace(/s_pw=[^&]+/, "s_pw=***");
    }

    let tmp = "";
    if (!(typeof cmd === "string" || cmd instanceof String)) {
      Object.keys(cmd).forEach((key: string) => {
        if (cmd[key] !== null && cmd[key] !== undefined) {
          tmp += `${key}=${cmd[key].toString().replace(/\r|\n/g, "")}\n`;
        }
      });
    } else {
      tmp = "" + cmd;
    }
    if (secured) {
      tmp = tmp.replace(/PASSWORD=[^\n]+/, "PASSWORD=***");
    }
    tmp = tmp.replace(/\n$/, "");   
    if (Object.keys(cmd).length > 0) {
          data += `${fixedURLEnc("s_command")}=${fixedURLEnc(tmp)}`
    }

    return data.endsWith("&") ? data.slice(0, -1) : data;
  }

  /**
   * Flatten nested arrays in command
   * @param cmd api command
   * @returns api command with flattended parameters
   */
  private flattenCommand(cmd: any): any {
    const newcmd: any = {};
    Object.keys(cmd).forEach((key: string) => {
      const val = cmd[key];
      const newKey = key.toUpperCase();
      if (val !== null && val !== undefined) {
        if (Array.isArray(val)) {
          let index = 0;
          for (const row of val) {
            newcmd[`${newKey}${index}`] = (row + "").replace(/\r|\n/g, "");
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
  }

  /**
   * Auto convert API command parameters to punycode, if necessary.
   * @param cmd api command
   * @returns Promise resolving with api command with IDN values replaced to punycode
   */
  private async autoIDNConvert(cmd: any): Promise<any> {
    const keyPattern = /^(NAMESERVER|NS|DNSZONE)([0-9]*)$/i;
    const objClassPattern =
      /^(DOMAIN(APPLICATION|BLOCKING)?|NAMESERVER|NS|DNSZONE)$/i;
    const asciiPattern = /^[A-Za-z0-9.\-]+$/;

    const toConvert: string[] = [];
    const idxs: string[] = [];

    Object.keys(cmd).forEach((key) => {
      const val = cmd[key];
      if (
        (keyPattern.test(key) ||
          (key.toUpperCase() === "OBJECTID" &&
            cmd.OBJECTCLASS &&
            objClassPattern.test(cmd.OBJECTCLASS))) &&
        !asciiPattern.test(val)
      ) {
        toConvert.push(val);
        idxs.push(key);
      }
    });

    if (toConvert.length > 0) {
      const convertedValues = toConvert.map((value) => toAscii(value));
      convertedValues.forEach((convertedValue, idx) => {
        cmd[idxs[idx]] = convertedValue;
      });
    }

    return cmd;
  }
}
