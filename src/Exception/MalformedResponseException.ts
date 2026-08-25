/**
 * CNIC\Exception
 * Copyright © Team Internet Group PLC
 */

import { UnsupportedFeatureException } from "./UnsupportedFeatureException.js";

/**
 * Thrown when the API sent a shape the SDK cannot represent.
 *
 * Raised by `CNR.Response`'s `stringCells()` when a `PROPERTY` entry is not
 * an array, or one of its cells is not a string. This is deliberately NOT
 * the "capability absent on this platform or response" meaning
 * `UnsupportedFeatureException` documents on its own class — nothing is
 * missing here, the wire sent something the SDK's data model has no way to
 * hold.
 *
 * It extends `UnsupportedFeatureException` rather than `CnicException`
 * **deliberately** (matching PHP, RSRMID-2967): both `stringCells()` throw
 * sites already raised `UnsupportedFeatureException` before this type
 * existed, so re-parenting them would break an existing
 * `catch (err instanceof UnsupportedFeatureException)` at either site.
 * Extending instead of replacing keeps the split purely additive.
 */
export class MalformedResponseException extends UnsupportedFeatureException {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MalformedResponseException";
  }
}
