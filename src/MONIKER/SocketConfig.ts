/**
 * CNIC\MONIKER
 * Copyright © Team Internet Group PLC
 */

import { SocketConfig as IBSSocketConfig } from "../IBS/SocketConfig.js";

/**
 * Moniker SocketConfig — same API platform as IBS; only the endpoints differ.
 *
 * Everything else (auth params, sensitive fields, host-only + trailing-slash
 * shape) is inherited unchanged from `IBS.SocketConfig`.
 */
export class SocketConfig extends IBSSocketConfig {
  // Base constructor reads oteUrl/liveUrl during super() (trap #1), so these
  // must stay accessors, not fields, exactly like IBS.SocketConfig's own.
  protected override get oteUrl(): string {
    return "https://testapi.moniker.com/";
  }

  protected override get liveUrl(): string {
    return "https://api.moniker.com/";
  }
}
