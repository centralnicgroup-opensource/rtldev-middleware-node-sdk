/**
 * CNIC\MONIKER
 * Copyright © Team Internet Group PLC
 */

import { Client as IBSClient } from "../IBS/Client.js";
import { SocketConfig } from "./SocketConfig.js";

/**
 * Moniker API Client — same platform as IBS; only the endpoints differ.
 *
 * Deliberately declares no Response/Parser/Translator/Logger/TemplateManager
 * of its own (decision #1) — everything except `newSocketConfig()` is
 * inherited unchanged from `IBS.Client`, including the request lifecycle,
 * `buildCommand()`'s JSON injection, and the absence of session methods
 * (decision #7).
 */
export class Client extends IBSClient {
  /**
   * Narrowed one step further than `IBS.Client`'s constructor: this brand
   * shares the IBS platform but not its endpoints, so accepting an
   * `IBS.SocketConfig` here would let a Moniker client silently talk to the
   * IBS host. Refusing it at the call site is the whole reason the
   * parameter is narrowed per brand rather than typed
   * `AbstractSocketConfig | null` once (RSRMID-2966).
   * @param socketConfig Moniker connection configuration to adopt; `null` builds the brand default
   */
  public constructor(socketConfig: SocketConfig | null = null) {
    super(socketConfig);
  }

  /**
   * Instantiate MONIKER SocketConfig.
   */
  protected override newSocketConfig(): SocketConfig {
    return new SocketConfig();
  }
}
