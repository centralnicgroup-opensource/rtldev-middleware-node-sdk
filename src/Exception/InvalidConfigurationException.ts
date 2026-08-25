import { CnicException } from "./CnicException.js";

/**
 * Thrown when a configuration value handed to the SDK is outside the range
 * the transport can act on.
 *
 * Distinct from `UnsupportedFeatureException`, which reports a capability the
 * platform does not offer: here the capability exists and the value is the
 * problem. Raised rather than passed through because a bad value (e.g. a
 * negative socket timeout) would otherwise be dropped or silently coerced
 * with no signal.
 */
export class InvalidConfigurationException extends CnicException {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidConfigurationException";
  }
}
