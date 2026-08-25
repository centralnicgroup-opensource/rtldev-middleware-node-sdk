/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { AbstractClient } from "../AbstractClient.js";
import { CommandFormatter } from "../CommandFormatter.js";
import { CommandRedactor } from "../CommandRedactor.js";
import { PaginationException } from "../Exception/PaginationException.js";
import { UnsupportedFeatureException } from "../Exception/UnsupportedFeatureException.js";
import { IDNCommandRewriter } from "./IDNCommandRewriter.js";
import { Logger as L } from "./Logger.js";
import { Response } from "./Response.js";
import { SocketConfig } from "./SocketConfig.js";
import type { RequestConfig } from "../AbstractClient.js";
import type { LogSinkInterface } from "../LogSinkInterface.js";
import type { RoleCredentialsInterface } from "../RoleCredentialsInterface.js";
import type { ApiCommand, Hash, StringHash } from "../types.js";

/**
 * CNR API Client
 *
 * Home of the two capabilities the CNR platform has and the flat IBS/Moniker
 * platform does not: **API sessions** — the accessors
 * {@link getSession}/{@link setSession} plus the lifecycle
 * {@link login}/{@link logout}/{@link saveSession}/{@link reuseSession} — and
 * **role credentials** (`RoleCredentialsInterface`). Both read state that
 * only `SocketConfig` carries, which is why they live here rather than on
 * `AbstractClient` — see the note there.
 *
 * The lifecycle methods lived on a separate `CNR.SessionClient` subclass
 * until RSRMID-2969 (matching PHP's identically-numbered fold off a
 * `SessionCapable` trait with exactly one host). Nothing in `src/`, `tests/`
 * or `examples/` ever produced the session-less parent — `ClientFactory.cnr()`
 * always handed out the subclass — so the split bought a distinction no code
 * made, at the price of a second file to find `login()`. Do not reintroduce
 * a `SessionClient` subclass or split the lifecycle back out into a mixin: if
 * a genuinely session-less CNR client ever becomes a real use case, that is a
 * new type with a narrower contract, not this indirection restored.
 */
export class Client extends AbstractClient implements RoleCredentialsInterface {
  /**
   * The exact command handed to {@link newResponse} for each `Response` this
   * client has produced, before `Response`'s constructor masks AUTH/PASSWORD
   * (RSRMID-2938). Keyed by `Response` identity so entries are collected
   * along with the response itself — never read back through any public
   * accessor; {@link getCommand} on `Response` stays masked for every other
   * caller. Exists solely so {@link requestNextResponsePage} can continue
   * pagination with the real values instead of resending the mask token
   * (RSRMID-2975; PHP v33.0.0 independently arrived at the same design,
   * see docs/agents/architecture.md#fixed-in-node-ahead-of-php).
   */
  private readonly unmaskedCommands = new WeakMap<Response, StringHash>();

  /**
   * Narrowed from `AbstractClient`'s `AbstractSocketConfig | null`, mirroring
   * the covariant {@link newSocketConfig} below.
   *
   * The narrowing is the point: `new Client(new IBS.SocketConfig())` has to
   * be a compile-time error at the call site, not an
   * `UnsupportedFeatureException` thrown later from {@link getSocketConfig}.
   * @param socketConfig CNR connection configuration to adopt; `null` builds the brand default
   */
  public constructor(socketConfig: SocketConfig | null = null) {
    super(socketConfig);
  }

  /**
   * Instantiate CNR SocketConfig.
   */
  protected override newSocketConfig(): SocketConfig {
    return new SocketConfig();
  }

  /**
   * The CNR SocketConfig, narrowed from the shared `AbstractSocketConfig`
   * type of `AbstractClient.socketConfig`.
   *
   * The one narrowing point for CNR's platform-specific config state
   * (session, persistent, role separator). Deliberately the only override of
   * this accessor: two methods narrowing the same property would be two
   * places to keep in step.
   *
   * The guard below is unreachable for correctly-typed callers. There are
   * two writers of the property — the covariant {@link newSocketConfig}
   * above and the constructor parameter (RSRMID-2966) — and both are
   * narrowed to `SocketConfig`, so neither can seat a foreign config without
   * a compile-time error at the call site first.
   * @throws UnsupportedFeatureException if a subclass supplied a non-CNR config
   */
  public override getSocketConfig(): SocketConfig {
    if (!(this.socketConfig instanceof SocketConfig)) {
      throw new UnsupportedFeatureException(
        `CNR session and role handling require a CNIC.CNR.SocketConfig, got ${this.socketConfig.constructor.name}.`,
      );
    }
    return this.socketConfig;
  }

  /**
   * Get the API Session ID that is currently set, or null when there is
   * none.
   *
   * CNR-only: IBS/Moniker have no session concept, so the method is absent
   * there rather than present and answering null.
   */
  public getSession(): string | null {
    const sessid = this.getSocketConfig().getSession();
    return sessid === "" ? null : sessid;
  }

  /**
   * Set an API session id to be used for API communication.
   *
   * Setting a session clears the stored password: the two are alternative
   * credentials on the wire, and CNR's SocketConfig treats the newer one as
   * authoritative. That holds on the reset path too — `setSession("")`
   * leaves neither, so re-set the credentials to go back to password
   * authentication (see `SocketConfig.setSession()`).
   * @param session empty string resets it
   */
  public setSession(session = ""): this {
    this.getSocketConfig().setSession(session);
    return this;
  }

  /**
   * Perform API login to start session-based communication.
   *
   * `persistent` is reset in a `finally`, not just after a successful
   * `request()` — a thrown `UnsupportedFeatureException` from a
   * transport-owned option/header collision (a real, reachable path — see
   * `HttpTransport.post()`) would otherwise leave `persistent` stuck `true`
   * for every later request on that client. Briefly a deliberate
   * Node-ahead-of-PHP divergence; PHP shipped the identical fix in
   * **v33.0.1** (`d77de36`) — converged, not an open gap. See
   * architecture.md's "Converged: CNR session lifecycle cleans up in a
   * `finally`" for the verification detail.
   */
  public async login(): Promise<Response> {
    this.getSocketConfig().setPersistent(true);
    try {
      const rr = await this.request();
      if (rr.isSuccess()) {
        this.setSession(rr.getColumn("SESSIONID")?.getStringByIndex(0) ?? "");
      }
      return rr;
    } finally {
      this.getSocketConfig().setPersistent(false);
    }
  }

  /**
   * Perform API logout to close the API session in use.
   *
   * The session id is cleared only when `StopSession` actually succeeds
   * (`rr.isSuccess()`) — on any failure (e.g. the session was already
   * expired or invalid, matching PHP's identical `if ($rr->isSuccess())`
   * gate) `getSession()` keeps returning exactly the id it held before this
   * call. There is no separate "logout failed, so drop the session anyway"
   * path: a failed `logout()` is not the same as a cleared one, and this
   * client will keep sending that same (likely already-unusable) session
   * id on every request until a caller explicitly calls {@link setSession}
   * or {@link login} again.
   *
   * `close()` runs in a `finally`, not just after `request()` resolves —
   * the exact sibling of the {@link login} `persistent`-reset trap above; a
   * thrown `request()` would otherwise leave the transport's proxy agent
   * open for the rest of the client's life. Same convergence as `login()`:
   * PHP shipped the identical `try`/`finally` fix in **v33.0.1** (`d77de36`)
   * — see architecture.md's "Converged: CNR session lifecycle cleans up in
   * a `finally`".
   */
  public async logout(): Promise<Response> {
    try {
      const rr = await this.request({ COMMAND: "StopSession" });
      if (rr.isSuccess()) {
        this.setSession();
      }
      return rr;
    } finally {
      await this.close();
    }
  }

  /**
   * Apply session data to a session-like object (e.g. `req.session`).
   * @param session session object to write connection data into
   */
  public saveSession(session: Hash): this {
    session["socketcfg"] = {
      login: this.getSocketConfig().getLogin(),
      session: this.getSocketConfig().getSession(),
    };
    return this;
  }

  /**
   * Rebuild connection settings from a session-like object.
   *
   * The two calls are ordered, not interchangeable: `setCredentials()`
   * clears the session id (a session and a password are alternative
   * credentials, and CNR's SocketConfig treats the newer one as
   * authoritative), so restoring the session second is what makes this work.
   * @param session session object previously populated by {@link saveSession}
   */
  public reuseSession(session: Hash): this {
    const socketcfg = session["socketcfg"];
    if (typeof socketcfg === "object" && socketcfg !== null) {
      const cfg = socketcfg as Hash;
      const login = cfg["login"];
      const sessionId = cfg["session"];
      if (typeof login === "string" && typeof sessionId === "string") {
        this.setCredentials(login);
        this.setSession(sessionId);
      }
    }
    return this;
  }

  /**
   * Instantiate the CNR logger writing to the given sink.
   */
  protected override newLogger(sink: LogSinkInterface): L {
    return new L(sink);
  }

  /**
   * Perform API request using the given command.
   * @param cmd API command to request (optional for session login)
   * @param path endpoint path appended to the base URL (defaults to the CNR script path)
   */
  public override async request(
    cmd: ApiCommand = {},
    path = "api/call.cgi",
  ): Promise<Response> {
    const r = await this.performRequest(cmd, path);
    if (!(r instanceof Response)) {
      throw new UnsupportedFeatureException(
        "Expected newResponse() to produce a CNR Response.",
      );
    }
    return r;
  }

  /**
   * Flatten the given command into wire form (CNR uppercase key/value pairs)
   * and convert its IDN parameters to punycode.
   *
   * The IDN rewrite is CNR's alone — IBS/Moniker convert server-side — so it
   * runs here, in the brand hook, and not on `AbstractClient` behind a flag;
   * see `IDNCommandRewriter`. It must run *after* the flattening: the rules
   * match wire keys (`NAMESERVER0`, `OBJECTID`), not the caller's nested,
   * arbitrarily-cased input.
   */
  protected override buildCommand(cmd: ApiCommand): StringHash {
    return IDNCommandRewriter.rewrite(CommandFormatter.flattenCommand(cmd));
  }

  /**
   * Instantiate a CNR Response for the given raw payload.
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
    const response = new Response(
      raw,
      cmd,
      { ...cfg },
      this.context,
      null,
      error,
    );
    // `cmd` here is what AbstractClient.performRequest() built via
    // buildCommand(), still unmasked — Response's own constructor masks its
    // *stored* copy, this reference is untouched by that (CommandRedactor.
    // redact() returns a new object, see RedactionParitySeam.spec.ts).
    this.unmaskedCommands.set(response, cmd);
    return response;
  }

  /**
   * Set Role Credentials to be used for API communication.
   *
   * CNR-only capability (see `RoleCredentialsInterface`): a role login is the
   * account id, the `":"` role separator and the role user id, authenticated
   * with that role user's own password.
   *
   * @param accountId empty string resets it
   * @param roleId empty string logs in as the account itself, without a role
   * @param password the role user's own password; empty string resets it
   */
  public setRoleCredentials(accountId = "", roleId = "", password = ""): this {
    let login = accountId;
    if (roleId !== "") {
      login += this.getSocketConfig().getRoleSeparator() + roleId;
    }
    return this.setCredentials(login, password);
  }

  /**
   * The command to continue `currentPage`'s query with.
   *
   * Command data comes from the command, pagination state from the response
   * — this method is the first half of that split. Reading the command off
   * the response instead was RSRMID-2975: `getCommand()` answers the
   * *masked* copy, so a list command carrying `AUTH` or `PASSWORD` (an EPP
   * transfer auth code, an account password field) had the literal mask
   * re-sent as that parameter's value on page 2 onward. Not a display
   * artifact — it reached the wire. Note what it is *not*: the client's own
   * credentials travel as `s_login`/`s_pw` off the `SocketConfig` and were
   * never in the command, so every page authenticated correctly and the
   * damage was a corrupted *parameter* — which the API may well accept,
   * answering page 2 from a different result set than page 1 rather than
   * failing outright.
   *
   * A `Response` this client did not itself produce — constructed directly,
   * or returned by a different client instance — is not in
   * {@link unmaskedCommands}. Falling back to its masked command is safe
   * exactly when nothing in it was masked, which is the overwhelmingly
   * common case and continues to work untouched; when something *was*
   * masked there is no unmasked copy anywhere to recover, so this throws
   * rather than putting the mask on the wire. Detection is by value, not by
   * key, so it holds for a subclass that widened `sensitiveFields` beyond
   * `SensitiveFields.KEYS`; the only false positive is a caller legitimately
   * sending the literal `"***"`.
   *
   * @throws PaginationException if `currentPage` came from elsewhere and its command is masked
   */
  private continuationCommand(currentPage: Response): StringHash {
    const sent = this.unmaskedCommands.get(currentPage);
    if (sent !== undefined) {
      return sent;
    }
    const cmd = currentPage.getCommand();
    if (Object.values(cmd).includes(CommandRedactor.MASK)) {
      throw new PaginationException(
        `Cannot continue pagination from a Response this client did not produce: its command still carries ` +
          `the redaction mask ("${CommandRedactor.MASK}") in place of a sensitive parameter, and re-sending it ` +
          `would put the mask on the wire. Pass a Response returned by this client's own request().`,
      );
    }
    return cmd;
  }

  /**
   * Request the next page of list entries for the current list query.
   *
   * The continuation is assembled from two sources, deliberately: the
   * command that produced `currentPage` ({@link continuationCommand}) and
   * `currentPage`'s own pagination state. Response data — `LIMIT`, `LAST` —
   * is not masked and is read straight off the response; command parameters
   * are not.
   *
   * @throws PaginationException if command parameter LAST is in use while using this method,
   *         or if `currentPage` was produced elsewhere and its command is masked
   */
  public async requestNextResponsePage(
    currentPage: Response,
  ): Promise<Response | null> {
    const mycmd = this.continuationCommand(currentPage);
    if (Object.prototype.hasOwnProperty.call(mycmd, "LAST")) {
      throw new PaginationException(
        "Parameter LAST in use. Please remove it to avoid issues in requestNextPage.",
      );
    }
    // Delegate the termination decision to the paginator so "is there a next
    // page?" lives in one place (Paginator.hasNextPage()) rather than being
    // re-derived from total/limit arithmetic here. This also subsumes the
    // former LIMIT<=0 guard: a non-positive page size makes hasNextPage()
    // return false, so requestAllResponsePages() terminates instead of
    // re-requesting the same page forever.
    //
    // The advance itself is the response's own next offset — LAST + 1 —
    // rather than command FIRST + LIMIT: identical to the old arithmetic for
    // an aligned page, but correct for an unaligned one, and it no longer
    // depends on the caller having sent FIRST at all.
    if (!currentPage.getPagination().hasNextPage()) {
      return null;
    }
    const limit = currentPage.getRecordsLimitation();
    const last = currentPage.getLastRecordIndex();
    if (limit === null || limit <= 0 || last === null) {
      return null;
    }
    const nextCmd: ApiCommand = { ...mycmd, FIRST: last + 1, LIMIT: limit };
    return this.request(nextCmd);
  }

  /**
   * Request all pages/entries for the given query command.
   * @param cmd API list command to use
   */
  public async requestAllResponsePages(cmd: ApiCommand): Promise<Response[]> {
    const responses: Response[] = [];
    let tmp: Response | null = await this.request({ ...cmd, FIRST: 0 });
    do {
      responses.push(tmp);
      tmp = await this.requestNextResponsePage(tmp);
    } while (tmp !== null);
    return responses;
  }
}
