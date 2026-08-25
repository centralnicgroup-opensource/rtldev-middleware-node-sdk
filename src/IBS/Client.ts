/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import { AbstractClient } from "../AbstractClient.js";
import { CommandFormatter } from "../CommandFormatter.js";
import { Logger } from "./Logger.js";
import { Response } from "./Response.js";
import { SocketConfig } from "./SocketConfig.js";
import type { RequestConfig } from "../AbstractClient.js";
import type { LogSinkInterface } from "../LogSinkInterface.js";
import type { ApiCommand, StringHash } from "../types.js";

/**
 * IBS API Client
 *
 * Carries no transport defaults of its own, and must not grow any — not
 * here, and not on {@link SocketConfig}, which owns the option bag.
 *
 * IBS/Moniker has no session concept, so — unlike `CNR.Client` — this class
 * has no `login`/`logout`/`saveSession`/`reuseSession`/`getSession`/
 * `setSession`/`setRoleCredentials` at all (decision #7). Do not add them
 * here.
 */
export class Client extends AbstractClient {
  /**
   * Narrowed from `AbstractClient`'s `AbstractSocketConfig | null` to this
   * brand's config, mirroring the covariant {@link newSocketConfig} below.
   *
   * `MONIKER.Client` narrows it one step further: the two brands share this
   * platform but not its endpoints, so a Moniker client must refuse an IBS
   * config rather than silently talk to the IBS host.
   * @param socketConfig IBS connection configuration to adopt; `null` builds the brand default
   */
  public constructor(socketConfig: SocketConfig | null = null) {
    super(socketConfig);
  }

  /**
   * Instantiate IBS SocketConfig.
   */
  protected override newSocketConfig(): SocketConfig {
    return new SocketConfig();
  }

  /**
   * Instantiate the IBS logger writing to the given sink.
   */
  protected override newLogger(sink: LogSinkInterface): Logger {
    return new Logger(sink);
  }

  /**
   * Perform API request using the given command.
   *
   * The IBS/Moniker platform exposes many endpoints under one host, where
   * the path selects the operation (e.g. `Domain/Create`, `Domain/Info`).
   * The base host is configured on the SocketConfig (`liveUrl`/`oteUrl`, host
   * only, with a trailing slash); the per-operation path is appended by
   * `AbstractClient.performRequest()` and must therefore be supplied per
   * request — unlike CNR, there is no default that makes sense here.
   *
   * @param cmd API command to request
   * @param path Path segment appended to the base URL to select the endpoint
   */
  public override async request(
    cmd: ApiCommand = {},
    path = "",
  ): Promise<Response> {
    // performRequest() always constructs through this client's own
    // newResponse() hook below, so the result is always an IBS.Response.
    return (await this.performRequest(cmd, path)) as Response;
  }

  /**
   * Flatten the given command into wire form, injecting the JSON response
   * format.
   *
   * Deliberately no IDN handling: the IBS/Moniker platform converts IDNs
   * server-side, so the command reaches the wire with its unicode values
   * intact. CNR's client-side rewrite lives behind CNR's own hook and is not
   * shared.
   */
  protected override buildCommand(cmd: ApiCommand): StringHash {
    // PHP's `$cmd + [...]` keeps the LEFT operand (`$cmd`) on a duplicate
    // key; spreading `cmd` last reproduces that — a caller-supplied
    // ResponseFormat wins over the injected default.
    return CommandFormatter.flattenCommand(
      { ResponseFormat: "JSON", ...cmd },
      false,
    );
  }

  /**
   * Instantiate an IBS Response for the given raw payload.
   *
   * @param cmd flattened command that produced the response
   * @param cfg connection config used for the request
   * @param error transport error, if any; non-null means `raw` is unusable
   */
  protected override newResponse(
    raw: string,
    cmd: StringHash,
    cfg: RequestConfig,
    error: string | null = null,
  ): Response {
    // RequestConfig has no index signature, so it must be spread into a
    // plain object literal before it satisfies AbstractResponse's
    // StringHash-typed placeholders parameter.
    return new Response(raw, cmd, { ...cfg }, this.context, null, error);
  }
}
