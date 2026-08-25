/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import { AbstractSocketConfig } from "../AbstractSocketConfig.js";
import { CommandRedactor } from "../CommandRedactor.js";
import { SensitiveFields } from "./SensitiveFields.js";
import type { PostDataParams } from "../AbstractSocketConfig.js";

/**
 * IBS SocketConfig
 *
 * Host only, with a trailing slash — the per-operation path (e.g.
 * `Domain/Check`) is appended by `AbstractClient.performRequest()`, not
 * stored here. Auth is `apikey`/`password` POST params; IBS has no session
 * concept, unlike CNR's `s_login`/`s_pw`/`s_sessionid`.
 */
export class SocketConfig extends AbstractSocketConfig {
  protected override get oteUrl(): string {
    return "https://testapi.internet.bs/";
  }

  protected override get liveUrl(): string {
    return "https://api.internet.bs/";
  }

  /**
   * Not read by the base constructor, so a plain field override is safe here
   * (see `AbstractSocketConfig.sensitiveFields`'s docblock) — unlike
   * `oteUrl`/`liveUrl`, which must be accessors.
   */
  protected override sensitiveFields: string[] = SensitiveFields.KEYS;

  /**
   * IBS only uses login/password on the wire — command and session are
   * CNR-specific and have no IBS equivalent.
   */
  private readonly parameters = {
    login: "apikey",
    password: "password",
  } as const;

  /**
   * Get POST data container of connection data.
   */
  protected override getPOSTDataParams(
    command: PostDataParams,
    maskSecrets: boolean,
  ): PostDataParams {
    // The non-mask branch must copy: `command` is the caller's object, and
    // JS objects are references (unlike PHP arrays, which copy on write) —
    // mutating it below in place would leak into the caller's own command.
    const params: PostDataParams = maskSecrets
      ? this.maskSensitiveCommand(command)
      : { ...command };
    if (this.login.length !== 0) {
      params[this.parameters.login] = this.login;
    }
    if (this.password.length !== 0) {
      params[this.parameters.password] = maskSecrets
        ? CommandRedactor.MASK
        : this.password;
    }
    return params;
  }
}
