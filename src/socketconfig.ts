export const fixedURLEnc = (str: string): string => {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
  });
};

/**
 * SocketConfig Class
 */
export class SocketConfig {
  /**
   * account name
   */
  private login: string;
  /**
   * persistent for session request
   */
  private persistent: string;
  /**
   * account password
   */
  private pw: string;
  /**
   * API session id
   */
  private sessionid: string;

  public constructor() {
    this.login = "";
    this.persistent = "";
    this.pw = "";
    this.sessionid = "";
  }

  /**
   * Create POST data string out of connection data
   * @returns POST data string
   */
  public getPOSTData(): string {
    let data = "";
    if (this.login !== "") {
      data += `${fixedURLEnc("s_login")}=${fixedURLEnc(this.login)}&`;
    }
    if (this.persistent !== "") {
      data += `${fixedURLEnc("persistent")}=${fixedURLEnc(this.persistent)}&`;
    }
    if (this.pw !== "") {
      data += `${fixedURLEnc("s_pw")}=${fixedURLEnc(this.pw)}&`;
    }
    if (this.sessionid !== "") {
      data += `${fixedURLEnc("s_sessionid")}=${fixedURLEnc(this.sessionid)}&`;
    }
    return data;
  }

  /**
   * Get API Session ID in use
   * @returns API Session ID
   */
  public getSession(): string {
    return this.sessionid;
  }

  /**
   * Set account login to use
   * @param value account login
   * @returns Current SocketConfig instance for method chaining
   */
  public setLogin(value: string): SocketConfig {
    this.sessionid = "";
    this.login = value;
    return this;
  }

  /**
   * Get account login to use
   * @returns Current login
   */
  public getLogin(): string {
    return this.login;
  }

  /**
   * Set persistent to request session id
   * @param value one time password
   * @returns Current SocketConfig instance for method chaining
   */
  public setPersistent(): SocketConfig {
    this.sessionid = "";
    this.persistent = "1";
    return this;
  }

  /**
   * Set account password to use
   * @param value account password
   * @returns Current SocketConfig instance for method chaining
   */
  public setPassword(value: string): SocketConfig {
    this.sessionid = "";
    this.pw = value;
    return this;
  }

  /**
   * Set API Session ID to use
   * @param value API Session ID
   * @returns Current SocketConfig instance for method chaining
   */
  public setSession(value: string): SocketConfig {
    this.sessionid = value;
    this.pw = "";
    this.persistent = "";
    return this;
  }
}
