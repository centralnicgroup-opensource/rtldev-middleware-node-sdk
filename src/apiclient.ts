import * as path from "path";
import * as request from "request";
import { Response } from "./response";
import { ResponseTemplateManager } from "./responsetemplatemanager";
import { fixedURLEnc, SocketConfig } from "./socketconfig";

const rtm = ResponseTemplateManager.getInstance();

/**
 * APIClient class
 */
export class APIClient {
    /**
     * API connection timeout setting
     */
    private static readonly socketTimeout: number = 300000;
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

    public constructor() {
        this.socketURL = "";
        this.debugMode = false;
        this.setURL("https://coreapi.1api.net/api/call.cgi");
        this.socketConfig = new SocketConfig();
        this.useLIVESystem();
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
     * Serialize given command for POST request including connection configuration data
     * @param cmd API command to encode
     * @returns encoded POST data string
     */
    public getPOSTData(cmd: any): string {
        let data = this.socketConfig.getPOSTData();
        let tmp = "";
        if (!(typeof cmd === "string" || cmd instanceof String)) {
            Object.keys(cmd).forEach((key: string) => {
                if (cmd[key] !== null && cmd[key] !== undefined) {
                    tmp += `${key}=${cmd[key].toString().replace(/\r|\n/g, "")}\n`;
                }
            });
        }
        tmp = tmp.replace(/\n$/, "");
        data += `${fixedURLEnc("s_command")}=${fixedURLEnc(tmp)}`;
        return data;
    }

    /**
     * Get the API connection url that is currently set
     * @returns API connection url currently in use
     */
    public getURL(): string {
        return this.socketURL;
    }

    /**
     * Get the current module version
     * @returns module version
     */
    public getVersion(): string {
        const packageInfo = require(path.join(__dirname, "/../package.json"));
        return packageInfo.version;
    }

    /**
     * Apply session data (session id and system entity) to given client request session
     * @param session ClientRequest session instance
     * @returns Current APIClient instance for method chaining
     */
    public saveSession(session: any): APIClient {
        session.socketcfg = {
            entity: this.socketConfig.getSystemEntity(),
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
        this.socketConfig.setSystemEntity(session.socketcfg.entity);
        this.setSession(session.socketcfg.session);
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
     * Set one time password to be used for API communication
     * @param value one time password
     * @returns Current APIClient instance for method chaining
     */
    public setOTP(value: string): APIClient {
        this.socketConfig.setOTP(value);
        return this;
    }

    /**
     * Set an API session id to be used for API communication
     * @param value API session id
     * @returns Current APIClient instance for method chaining
     */
    public setSession(value: string): APIClient {
        this.socketConfig.setSession(value);
        return this;
    }

    /**
     * Set an Remote IP Address to be used for API communication
     * To be used in case you have an active ip filter setting.
     * @param value Remote IP Address
     * @returns Current APIClient instance for method chaining
     */
    public setRemoteIPAddress(value: string): APIClient {
        this.socketConfig.setRemoteAddress(value);
        return this;
    }

    /**
     * Set Credentials to be used for API communication
     * @param uid account name
     * @param pw account password
     * @returns Current APIClient instance for method chaining
     */
    public setCredentials(uid: string, pw: string): APIClient {
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
    public setRoleCredentials(uid: string, role: string, pw: string): APIClient {
        return this.setCredentials(role ? `${uid}!${role}` : uid, pw);
    }

    /**
     * Perform API login to start session-based communication
     * @param otp optional one time password
     * @returns Promise resolving with API Response
     */
    public async login(otp: string = ""): Promise<Response> {
        this.setOTP(otp || "");
        const rr = await this.request({ COMMAND: "StartSession"});
        if (rr.isSuccess()) {
            const col = rr.getColumn("SESSION");
            this.setSession(col ? col.getData()[0] : "");
        }
        return rr;
    }

    /**
     * Perform API login to start session-based communication.
     * Use given specific command parameters.
     * @param params given specific command parameters
     * @param otp optional one time password
     * @returns Promise resolving with API Response
     */
    public async loginExtended(params: any, otp: string = ""): Promise<Response> {
        this.setOTP(otp);
        const rr = await this.request(Object.assign({
            COMMAND: "StartSession",
        }, params));
        if (rr.isSuccess()) {
            const col = rr.getColumn("SESSION");
            this.setSession(col ? col.getData()[0] : "");
        }
        return rr;
    }

    /**
     * Perform API logout to close API session in use
     * @returns Promise resolving with API Response
     */
    public async logout(): Promise<Response> {
        const rr = await this.request({
            COMMAND: "EndSession",
        });
        if (rr.isSuccess()) {
            this.setSession("");
        }
        return rr;
    }

    /**
     * Perform API request using the given command
     * @param cmd API command to request
     * @returns Promise resolving with API Response
     */
    public request(cmd: any): Promise<Response> {
        return new Promise((resolve) => {
            const data = this.getPOSTData(cmd);
            // TODO: 300s (to be sure to get an API response)
            request({
                encoding: "utf8",
                form: data,
                gzip: true,
                headers: {
                    "User-Agent": `node-sdk::${this.getVersion()}`,
                },
                method: "POST",
                timeout: APIClient.socketTimeout,
                url: this.socketURL,
            }, (error, r, body) => {
                if (
                    (!error) &&
                    (r.statusCode !== undefined) &&
                    (r.statusCode < 200 || r.statusCode > 299)
                ) {
                    error = new Error(r.statusCode + (r.statusMessage ? " " + r.statusMessage : ""));
                }
                if (error) {
                    body = rtm.getTemplate("httperror").getPlain();
                    if (this.debugMode) {
                        console.log(this.socketURL);
                        console.dir(data);
                        console.error("HTTP communication failed:", error);
                        console.log(body);
                    }
                    resolve(new Response(body, cmd));
                } else {
                    if (this.debugMode) {
                        console.log(this.socketURL);
                        console.dir(data);
                        console.log(body);
                    }
                    resolve(new Response(body, cmd));
                }

            });
        });
    }

    /**
     * Request the next page of list entries for the current list query
     * Useful for tables
     * @param rr API Response of current page
     * @returns Promise resolving with API Response or null in case there are no further list entries
     */
    public async requestNextResponsePage(rr: Response): Promise<Response | null> {
        const mycmd = this.toUpperCaseKeys(rr.getCommand());
        if (mycmd.hasOwnProperty("LAST")) {
            throw new Error("Parameter LAST in use. Please remove it to avoid issues in requestNextPage.");
        }
        let first = 0;
        if (mycmd.hasOwnProperty("FIRST")) {
            first = mycmd.FIRST;
        }
        const total = rr.getRecordsTotalCount();
        const limit = rr.getRecordsLimitation();
        first += limit;
        if (first < total) {
            mycmd.FIRST = first;
            mycmd.LIMIT = limit;
            return this.request(mycmd);
        } else {
            return null;
        }
    }

    /**
     * Request all pages/entries for the given query command
     * @param cmd API list command to use
     * @returns Promise resolving with array of API Responses
     */
    public async requestAllResponsePages(cmd: any): Promise<Response[]> {
        const responses: Response[] = [];
        const rr: Response = await this.request(Object.assign({}, cmd, { FIRST: 0 }));
        let tmp: Response | null = rr;
        let idx = 0;
        do {
            responses[idx++] = tmp;
            tmp = await this.requestNextResponsePage(tmp);
        } while (tmp !== null);
        return responses;
    }

    /**
     * Set a data view to a given subuser
     * @param uid subuser account name
     * @returns Current APIClient instance for method chaining
     */
    public setUserView(uid: string): APIClient {
        this.socketConfig.setUser(uid);
        return this;
    }

    /**
     * Reset data view back from subuser to user
     * @returns Current APIClient instance for method chaining
     */
    public resetUserView(): APIClient {
        this.socketConfig.setUser("");
        return this;
    }

    /**
     * Set OT&E System for API communication
     * @returns Current APIClient instance for method chaining
     */
    public useOTESystem(): APIClient {
        this.socketConfig.setSystemEntity("1234");
        return this;
    }

    /**
     * Set LIVE System for API communication (this is the default setting)
     * @returns Current APIClient instance for method chaining
     */
    public useLIVESystem(): APIClient {
        this.socketConfig.setSystemEntity("54cd");
        return this;
    }

    /**
     * Translate all command parameter names to uppercase
     * @param cmd api command
     * @returns api command with uppercase parameter names
     */
    private toUpperCaseKeys(cmd: any): any {
        const newcmd: any = {};
        Object.keys(cmd).forEach((k: string) => {
            newcmd[k.toUpperCase()] = cmd[k];
        });
        return newcmd;
    }
}
