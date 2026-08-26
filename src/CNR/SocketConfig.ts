/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { AbstractSocketConfig } from "../AbstractSocketConfig.js";
import { CommandRedactor } from "../CommandRedactor.js";
import { SensitiveFields } from "./SensitiveFields.js";
import type { PostDataParams } from "../AbstractSocketConfig.js";

/**
 * CNR SocketConfig
 *
 * Owns the three settings that are CNR platform concepts rather than shared
 * transport configuration, and must not be hoisted onto
 * {@link AbstractSocketConfig}:
 *
 * - the **API session id** and the **`persistent` flag** that requests one.
 *   Living only here makes a `setSession()` call on an IBS/Moniker client a
 *   call-site type error instead of a silent no-op.
 * - the **role separator**, whose single consumer is
 *   `CNR.Client.setRoleCredentials()` — itself already CNR-only via
 *   `RoleCredentialsInterface`.
 *
 * There is deliberately no public client-side `setPersistent()` — see
 * `CNR.Client.login()`, the only caller.
 */
export class SocketConfig extends AbstractSocketConfig {
  protected override get oteUrl(): string {
    return "https://api-ote.rrpproxy.net/";
  }

  protected override get liveUrl(): string {
    return "https://api.rrpproxy.net/";
  }

  /**
   * Separator between the account id and the role user id in a role login.
   */
  private readonly roleSeparator = ":";

  /**
   * CNR carries sensitive data under upper-case command keys. Declared once
   * in {@link SensitiveFields.KEYS}, shared with `CNR.Response`. Safe as a
   * plain field override (unlike `oteUrl`/`liveUrl` above): the base
   * constructor never reads `sensitiveFields`.
   */
  protected override sensitiveFields: string[] = SensitiveFields.KEYS;

  /**
   * Parameter to trigger creation of a backend session.
   */
  private persistent = false;

  /**
   * API session id.
   */
  private session = "";

  /**
   * List of http request parameters.
   */
  private readonly parameters: {
    login: string;
    password: string;
    command: string;
    session: string;
  } = {
    login: "s_login",
    password: "s_pw",
    command: "s_command",
    session: "s_sessionid",
  };

  /**
   * Get POST data container of connection data.
   */
  protected override getPOSTDataParams(
    command: PostDataParams,
    maskSecrets: boolean,
  ): PostDataParams {
    const params: PostDataParams = {};
    if (this.login.length !== 0) {
      params[this.parameters.login] = this.login;
    }
    if (this.password.length !== 0) {
      params[this.parameters.password] = maskSecrets
        ? CommandRedactor.MASK
        : this.password;
    }
    // Masked for the same reason s_pw is: a session id is not a lesser
    // credential than the password but an alternative to it — see
    // setSession(), which clears the password because the newer of the two is
    // authoritative on the wire. Masking one and logging the other left the
    // debug body carrying a working credential on exactly the
    // persistent-session path, where there is no password left to mask.
    if (this.session.length !== 0) {
      params[this.parameters.session] = maskSecrets
        ? CommandRedactor.MASK
        : this.session;
    }
    if (Object.keys(command).length !== 0) {
      const cmd = maskSecrets ? this.maskSensitiveCommand(command) : command;
      let newcommand = "";
      for (const [key, val] of Object.entries(cmd)) {
        if (val === null) {
          continue;
        }
        newcommand += `${key}=${val}\n`;
      }
      params[this.parameters.command] = newcommand.slice(0, -1);
    }
    // Appended LAST — this is what keeps the encoded body byte-identical to
    // the CNR wire format (behaviour gap #9); a test asserts the exact bytes.
    if (this.getPersistent()) {
      params["persistent"] = "1";
    }
    return params;
  }

  /**
   * Add persistent parameter to request (request API session).
   */
  public setPersistent(persistent = false): this {
    this.persistent = persistent;
    return this;
  }

  /**
   * Get persistent parameter returned.
   */
  public getPersistent(): boolean {
    return this.persistent;
  }

  /**
   * Get API Session ID in use.
   */
  public getSession(): string {
    return this.session;
  }

  /**
   * Get the separator between account id and role user id in a role login.
   */
  public getRoleSeparator(): string {
    return this.roleSeparator;
  }

  /**
   * Set account name to use.
   */
  public override setLogin(login: string): this {
    this.session = "";
    this.login = login;
    return this;
  }

  /**
   * Set account password to use.
   */
  public override setPassword(password: string): this {
    this.session = "";
    this.password = password;
    return this;
  }

  /**
   * Set API Session ID to use.
   *
   * Always clears the stored password — a session and a password are
   * alternative credentials on the wire and the newer one is authoritative.
   * This holds on the **reset** path too: `setSession("")` drops the session
   * *and* leaves no password behind it, so the next request carries only the
   * login. Call `setLogin()`/`setPassword()` again to get back to password
   * authentication.
   * @param session empty string resets it
   */
  public setSession(session = ""): this {
    this.session = session;
    this.password = "";
    return this;
  }
}
