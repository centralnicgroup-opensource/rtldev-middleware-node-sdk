import { expect } from "chai";
import "mocha";
import type { Column } from "../../src/Column.ts";
import type { ColumnInterface } from "../../src/ColumnInterface.ts";

/**
 * Directive: every public member `Column` exposes must be declared on
 * `ColumnInterface` — no public member reachable only by narrowing to the
 * concrete class, since CLAUDE.md tells consumers to type against
 * `ColumnInterface`, not `Column`.
 *
 * Failure mode prevented: `Column.length` was exactly this — a public
 * `readonly` field declared on no interface (RSRMID-2971, matching PHP-SDK
 * v33.0.0's identical fix). Every behavioural test reached it through the
 * concrete `Column` class directly, so nothing would show a regression at
 * runtime if a future change reintroduced the shape; only a check that
 * consults the interface can.
 *
 * Why structural: the gap is purely type-level. JS has no runtime
 * visibility modifiers, so the field stays actually callable on the
 * instance either way — an `expect()` assertion has nothing to observe.
 * TypeScript's own structural type system is the only thing that can see
 * "this class has a public member the interface doesn't declare", and it
 * can only do that at compile time. `PublicSurfaceIsDeclaredOn` below is
 * enforced by `pnpm run typecheck`, not by the `it()` block — `tsx`
 * transpiles `tests/` without type-checking it, so mocha alone would never
 * see a violation. The `it()` exists only so this guard is visible in
 * `pnpm test`'s output.
 *
 * Deliberately scoped to `Column`/`ColumnInterface` alone, not a general
 * sweep over every "total" interface the way PHP's `InterfaceCoverageSeamTest`
 * is: PHP needed reflection over every class under `src/` because PHP has
 * no compile-time equivalent at all. Widening this to every interface would
 * require re-deriving, for each one, which of its interfaces are "total"
 * (fully describe their implementor) versus "additive" (like
 * `ExtendedResponseInterface`/`RoleCredentialsInterface`, which legitimately
 * leave most of the implementing class's surface undeclared) — a
 * classification call PHP's own guard has to make explicitly and which does
 * not belong bundled into fixing one concrete field.
 *
 * Non-vacuity: proved by reverting `Column.length` from `private` to
 * `public` (undoing RSRMID-2971) and confirming `pnpm run typecheck` fails
 * on this file, naming "length" as the excess key via
 * `memberNotDeclaredOnTheInterface` — not by reasoning about the type
 * alone.
 *
 * Revisit condition: only if `ColumnInterface` stops being meant to fully
 * describe `Column` and becomes an additive capability interface instead —
 * not the case today.
 */

/**
 * `true` when every public member of `Concrete` is declared on `Iface`.
 *
 * `keyof Concrete` is TypeScript's own answer to "what is `Concrete`'s
 * public surface": `private`/`protected` members are excluded from `keyof`
 * when read from outside the class, and inherited `Object.prototype`
 * members (`toString`, `hasOwnProperty`, ...) are not part of a plain
 * class's `keyof` either — check both against a scratch class carrying all
 * three visibility modifiers if a future TS version needs re-confirming.
 * Combined with `Concrete`'s own `implements Iface`, which
 * already forces every interface member to exist on the class, this pins
 * the two key sets equal: `implements` gives one direction of the subset
 * relationship, this type gives the other.
 */
type PublicSurfaceIsDeclaredOn<Concrete, Iface> =
  keyof Concrete extends keyof Iface
    ? true
    : {
        readonly memberNotDeclaredOnTheInterface: Exclude<
          keyof Concrete,
          keyof Iface
        >;
      };

const columnSurfaceCoverage: PublicSurfaceIsDeclaredOn<
  Column,
  ColumnInterface
> = true;

describe("Seam: Column's public surface is fully declared on ColumnInterface", () => {
  it("has no public member Column exposes that ColumnInterface does not declare", () => {
    // The real check is the module-level type assertion above — see the
    // file header for why a runtime assertion cannot express this on its
    // own.
    expect(columnSurfaceCoverage).to.equal(true);
  });
});
