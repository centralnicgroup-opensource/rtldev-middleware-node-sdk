import type { ResponseInterface } from "./ResponseInterface.js";
import type { Hash } from "./types.js";

/**
 * Extended Response Interface
 *
 * The optional capabilities of a richer API surface (currently CentralNic
 * Reseller): server-side telemetry (queuetime/runtime), transient/pending
 * status signals and the table-friendly list-hash projection. These are NOT
 * part of the universal {@link ResponseInterface} because flat APIs such as
 * IBS/Moniker do not provide them — their responses implement the core
 * interface only, and these five methods are absent, not present-and-throwing.
 * Consumers holding the shared type narrow to this one via
 * `instanceof` checks (or a brand-specific check) before using any of these
 * methods.
 */
export interface ExtendedResponseInterface extends ResponseInterface {
  /**
   * Get Queuetime of API response
   */
  getQueuetime(): number;

  /**
   * Get Runtime of API response
   */
  getRuntime(): number;

  /**
   * Check if current API response represents a temporary error case (a 4xx
   * code)
   */
  isTmpError(): boolean;

  /**
   * Check if current operation is returned as pending
   */
  isPending(): boolean;

  /**
   * Get Response as List Hash including useful meta data for tables
   */
  getListHash(): Hash;
}
