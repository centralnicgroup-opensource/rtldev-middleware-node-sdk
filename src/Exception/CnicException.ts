/**
 * Base class for every exception the CNIC SDK throws.
 *
 * All SDK-specific exceptions extend this base, which in turn extends the
 * native `Error`. Consumers can therefore catch any SDK failure in one place
 * with `catch (e) { if (e instanceof CnicException) ... }` while pre-existing
 * `catch (e)` code keeps working unchanged — the hierarchy is purely
 * additive and non-breaking.
 */
export class CnicException extends Error {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    // String literal, not `new.target.name` — a minifier can rename a class
    // but not a string literal, so `.name` survives bundling.
    this.name = "CnicException";
  }
}
