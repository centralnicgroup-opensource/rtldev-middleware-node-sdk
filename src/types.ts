/**
 * Shared structural type aliases.
 *
 * PHP expresses these as PHPDoc array shapes (`array<string,mixed>`,
 * `array<string,string>`), which cost nothing at runtime or in a file. TS has
 * no such zero-cost equivalent, so they get a home here instead of being
 * inlined at every use site.
 *
 * Deliberately NOT named `Record<K, V>` — this SDK has its own class named
 * `Record` (src/Record.ts), the parity name for `CNIC\Record`. TypeScript's
 * built-in `Record<K,V>` utility type is unusable anywhere `Record` the class
 * is also in scope, so it is banned from src/ entirely; these aliases (and
 * plain index-signature object types) are the replacement.
 */

/**
 * PHP's `array<string, mixed>` — an arbitrary string-keyed hash of unknown
 * values. Used for API response hashes, context data, and similar untyped
 * bags.
 */
export type Hash = { [key: string]: unknown };

/**
 * PHP's `array<string, string>` — a string-keyed hash where every value is
 * itself a string. Used for sanitized/plain API commands.
 */
export type StringHash = { [key: string]: string };

/**
 * A scalar value as PHP's `scalar` type describes it (bool|int|float|string).
 */
export type Scalar = string | number | boolean;

/**
 * PHP's `array<string, scalar|scalar[]|null>` — the shape of an API command
 * as a caller builds it and passes to `request()`/`buildCommand()`, *before*
 * `CommandFormatter::flattenCommand()` reduces it to the all-string wire form
 * (a plain {@link StringHash}). Distinct from StringHash because a caller may
 * legally pass a number, boolean, array of scalars, or null (dropped) for a
 * given key — only the flattened form is guaranteed all-string.
 */
export type ApiCommand = { [key: string]: Scalar | Scalar[] | null };
