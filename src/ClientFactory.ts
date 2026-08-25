/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import { Client as CNRClient } from "./CNR/Client.js";
import { Client as IBSClient } from "./IBS/Client.js";
import { Client as MONIKERClient } from "./MONIKER/Client.js";
import type { SocketConfig as CNRSocketConfig } from "./CNR/SocketConfig.js";
import type { SocketConfig as IBSSocketConfig } from "./IBS/SocketConfig.js";
import type { SocketConfig as MONIKERSocketConfig } from "./MONIKER/SocketConfig.js";

/**
 * Typed named constructors for each supported registrar brand. Each returns
 * the concrete brand client, fully typed, so every capability that brand
 * supports — shared (credentials, referer, user-agent, proxy, logging,
 * OT&E/LIVE switching, `request(cmd, path)`) and brand-specific alike — is
 * available directly, with no narrowing for the normal path:
 *
 * - {@link ClientFactory.cnr} yields a `CNR.Client` with CNR session
 *   handling (`getSession()`/`setSession()`/`login()`/`logout()`/`saveSession()`)
 *   and role credentials (`setRoleCredentials()`, from `RoleCredentialsInterface`).
 * - {@link ClientFactory.ibs}/{@link ClientFactory.moniker} yield the plain
 *   brand `IBS.Client`/`MONIKER.Client`. Those platforms have no session or
 *   role-credential concept, so those methods are genuinely **absent** —
 *   calling one is a compile-time error at the call site, not a runtime
 *   surprise. Keep it that way: a stub that accepts a session id and
 *   discards it is worse than no method at all.
 *
 * All further configuration — credentials, referer, user-agent, proxy,
 * logging and OT&E/sandbox mode — is the caller's responsibility. This keeps
 * the SDK platform-agnostic and transport-faithful: the caller normalizes
 * *configuration* input (e.g. HTML-entity decoding of WHMCS-stored
 * passwords) before handing it to the client. Scoped to configuration
 * deliberately — this says nothing about API *responses*, which the SDK
 * parses and exposes as received; do not read it as license to skip
 * normalising a response field the wire actually sends.
 *
 * There are two routes, and both stay supported. Pass a pre-built brand
 * `AbstractSocketConfig` when the connection settings are known up front —
 * the client is then correct the moment it exists, rather than starting on
 * LIVE and being corrected by a setter sequence. Or omit it and use the
 * client's fluent setters, which is the shorter route when the settings are
 * not yet known. The parameter is optional on purpose: `cnr()` with no
 * argument behaves exactly as it always has (RSRMID-2966).
 */
export class ClientFactory {
  /**
   * CentralNic Reseller (CNR, fka RRPproxy) client.
   * @param socketConfig pre-built CNR connection configuration to adopt; `null`/omitted builds the brand default
   */
  public static cnr(socketConfig: CNRSocketConfig | null = null): CNRClient {
    return new CNRClient(socketConfig);
  }

  /**
   * Internet.bs (IBS) client.
   * @param socketConfig pre-built IBS connection configuration to adopt; `null`/omitted builds the brand default
   */
  public static ibs(socketConfig: IBSSocketConfig | null = null): IBSClient {
    return new IBSClient(socketConfig);
  }

  /**
   * Moniker client (same platform as IBS; only the endpoints differ).
   *
   * The parameter is a Moniker config, not an IBS one — the endpoints are
   * the difference between the brands, so an IBS config here is refused at
   * the call site rather than silently pointing a Moniker client at the IBS
   * host.
   * @param socketConfig pre-built Moniker connection configuration to adopt; `null`/omitted builds the brand default
   */
  public static moniker(
    socketConfig: MONIKERSocketConfig | null = null,
  ): MONIKERClient {
    return new MONIKERClient(socketConfig);
  }
}
