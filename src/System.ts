/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

/**
 * API system a client is connected to.
 *
 * OT&E is the test/sandbox environment; LIVE is production. A client is always
 * on exactly one of the two, so the state is modelled as this frozen const
 * object rather than a boolean flag. Ported from PHP's `enum System: string`
 * — TS `enum` is non-erasable syntax and nominal across package boundaries,
 * so a frozen const + union type is the parity-preserving substitute (see the
 * "PHP construct -> TypeScript" table).
 */
export const System = Object.freeze({
  OTE: "OTE",
  LIVE: "LIVE",
} as const);

export type System = (typeof System)[keyof typeof System];
