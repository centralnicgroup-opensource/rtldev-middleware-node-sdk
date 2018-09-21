/**
 * SocketConfig Class
 */
export class SocketConfig {
    /**
     * API system entity. "54cd" for LIVE system; "1234" for OT&E system
     */
    private entity: string;
    /**
     * account name
     */
    private login: string;
    /**
     * one time password (2FA)
     */
    private otp: string;
    /**
     * account password
     */
    private pw: string;
    /**
     * remote ip address (ip filter)
     */
    private remoteaddr: string;
    /**
     * API session id
     */
    private session: string;
    /**
     * subuser account name (subuser specific data view)
     */
    private user: string;

    public constructor() {
        this.entity = "";
        this.login = "";
        this.otp = "";
        this.pw = "";
        this.remoteaddr = "";
        this.session = "";
        this.user = "";
    }

    /**
     * Create POST data string out of connection data
     * @returns POST data string
     */
    public getPOSTData(): string {
        let data = "";
        if (this.entity !== "") {
            data += `${encodeURIComponent("s_entity")}=${encodeURIComponent(this.entity)}&`;
        }
        if (this.login !== "") {
            data += `${encodeURIComponent("s_login")}=${encodeURIComponent(this.login)}&`;
        }
        if (this.otp !== "") {
            data += `${encodeURIComponent("s_otp")}=${encodeURIComponent(this.otp)}&`;
        }
        if (this.pw !== "") {
            data += `${encodeURIComponent("s_pw")}=${encodeURIComponent(this.pw)}&`;
        }
        if (this.remoteaddr !== "") {
            data += `${encodeURIComponent("s_remoteaddr")}=${encodeURIComponent(this.remoteaddr)}&`;
        }
        if (this.session !== "") {
            data += `${encodeURIComponent("s_session")}=${encodeURIComponent(this.session)}&`;
        }
        if (this.user !== "") {
            data += `${encodeURIComponent("s_user")}=${encodeURIComponent(this.user)}&`;
        }
        return data;
    }

    /**
     * Get API Session ID in use
     * @returns API Session ID
     */
    public getSession(): string {
        return this.session;
    }

    /**
     * Get API System Entity in use
     * @returns API System Entity
     */
    public getSystemEntity(): string {
        return this.entity;
    }

    /**
     * Set account name to use
     * @param value account name
     * @returns Current SocketConfig instance for method chaining
     */
    public setLogin(value: string): SocketConfig {
        this.session = "";
        this.login = value;
        return this;
    }

    /**
     * Set one time password to use
     * @param value one time password
     * @returns Current SocketConfig instance for method chaining
     */
    public setOTP(value: string): SocketConfig {
        this.session = "";
        this.otp = value;
        return this;
    }

    /**
     * Set account password to use
     * @param value account password
     * @returns Current SocketConfig instance for method chaining
     */
    public setPassword(value: string): SocketConfig {
        this.session = "";
        this.pw = value;
        return this;
    }

    /**
     * Set Remote IP Address to use
     * @param value remote ip address
     * @returns Current SocketConfig instance for method chaining
     */
    public setRemoteAddress(value: string): SocketConfig {
        this.remoteaddr = value;
        return this;
    }

    /**
     * Set API Session ID to use
     * @param value API Session ID
     * @returns Current SocketConfig instance for method chaining
     */
    public setSession(value: string): SocketConfig {
        this.session = value;
        this.login = "";
        this.pw = "";
        this.otp = "";
        return this;
    }

    /**
     * Set API System Entity to use
     * This is set to 54cd / LIVE System by default
     * @param value API System Entity
     * @returns Current SocketConfig instance for method chaining
     */
    public setSystemEntity(value: string): SocketConfig {
        this.entity = value;
        return this;
    }

    /**
     * Set subuser account name (for subuser data view)
     * @param value subuser account name
     * @returns Current SocketConfig instance for method chaining
     */
    public setUser(value: string): SocketConfig {
        this.user = value;
        return this;
    }
}
