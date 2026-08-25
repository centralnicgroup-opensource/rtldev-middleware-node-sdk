/**
 * Test support (RSRMID-2974)
 *
 * Test seam exposing the two protected `AbstractResponse` hooks a brand uses
 * to build its column and record lists — the brand's own `addColumn()` and
 * the shared `assembleRecords()`.
 *
 * Both are protected in `src/` on purpose (RSRMID-2939: a response is sealed
 * once constructed). The seam spec that exercises the sealing invariants
 * still has to *drive* these two hooks to prove them — that a duplicate
 * column name is refused, and that assembling twice does not double the
 * record list — and a brand subclass calling its own protected hooks is the
 * closest a test can get to what a real brand does, closer than reaching in
 * via a cast through `unknown`.
 *
 * Declared here, rather than inline in the seam spec, so an anonymous
 * subclass has a named type a factory function can carry through its return
 * type. Nothing in `src/` knows about this interface, and declaring it does
 * not widen the sealed surface: a subclass built in a test file can already
 * reach a protected member of its own base class regardless of whether this
 * type exists.
 */
export type ColumnRegistrar = {
  /** Register a column through the brand's own protected `addColumn()` hook. */
  register(columnName: string, data: unknown[]): void;

  /** Re-run the shared record assembly (`AbstractResponse.assembleRecords()`). */
  assembleAgain(): void;
};
