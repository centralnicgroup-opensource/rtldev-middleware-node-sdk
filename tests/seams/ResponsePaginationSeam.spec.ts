import { expect } from "chai";
import "mocha";
import { Response as CNRResponse } from "../../src/CNR/Response.ts";
import { Response as IBSResponse } from "../../src/IBS/Response.ts";
import { AbstractResponse } from "../../src/AbstractResponse.ts";
import { Paginator } from "../../src/Paginator.ts";

/**
 * Locks the pagination seam at the wire (decision 5, decision 18; RSRMID-2965).
 *
 * Directive: the seam is drawn at the wire. A brand `Response` declares
 * exactly the four methods that read its own pagination metadata
 * (`getFirstRecordIndex`, `getLastRecordIndex`, `getRecordsTotalCount`,
 * `getRecordsLimitation`) and nothing else. Every derivation from those
 * four answers is shared, written once, and never reimplemented per brand
 * — on the `Paginator` value object, which `AbstractResponse` only
 * assembles.
 *
 * Failure mode prevented: a brand that answers a derived question itself —
 * through a hoisted base default, a mixin, or a hand-rolled `hasNextPage()`
 * of its own — reports "one page, no next page" for a list that genuinely
 * has more, and a consumer paging through it silently loses pages 2..N
 * with no error anywhere.
 *
 * Why structural: every erosion this refuses is behaviour-preserving on
 * the day it lands. A brand re-declaring `hasNextPage()` with the same
 * arithmetic passes every existing behavioural assertion — right up to the
 * first wire shape where the copy and the original disagree. Only
 * reflecting over the actual declaring object can tell them apart before
 * that day arrives.
 *
 * Note on the assertion NOT made here: there is no "Paginator must declare
 * these six methods" check. That would be an existence check dressed as an
 * ownership check — nowhere else has the six derived methods at all once
 * `AbstractResponse` no longer does, so the positive is unfalsifiable. The
 * load-bearing half is the negative on the brands.
 *
 * Revisit condition: a brand whose "more results" signal is a cursor or
 * opaque token rather than a record offset — for such a brand, a
 * "hasNextPage"-shaped method genuinely becomes a wire read again and
 * belongs back on that brand's Response. Neither CNR nor IBS/Moniker
 * invokes this: both page by offset.
 *
 * Non-vacuity: re-adding `hasNextPage()` to `CNR.Response` (mirroring the
 * arithmetic Paginator already has) fails
 * `testNoBrandDeclaresADerivedGetter` specifically, not some unrelated
 * assertion — confirmed by mutation before relying on this guard.
 */
describe("Seam: pagination arithmetic lives on Paginator, never on a brand Response", () => {
  const PRIMITIVES = [
    "getFirstRecordIndex",
    "getLastRecordIndex",
    "getRecordsTotalCount",
    "getRecordsLimitation",
  ];

  const DERIVED_GETTERS = [
    "getCurrentPageNumber",
    "getNextPageNumber",
    "getNumberOfPages",
    "getPreviousPageNumber",
    "hasNextPage",
    "hasPreviousPage",
  ];

  const brands: [string, () => AbstractResponse, { prototype: object }][] = [
    [
      "CNR",
      () =>
        new CNRResponse("[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n"),
      CNRResponse,
    ],
    ["IBS", () => new IBSResponse(""), IBSResponse],
  ];

  for (const [name, , Brand] of brands) {
    it(`${name}.Response declares all 4 primitives itself, not inherited`, () => {
      for (const method of PRIMITIVES) {
        expect(
          Object.prototype.hasOwnProperty.call(Brand.prototype, method),
          `${name}.Response.prototype must own ${method}() itself`,
        ).to.be.true;
      }
    });
  }

  it("AbstractResponse declares no body for the 4 primitives — not even a single-page default", () => {
    for (const method of PRIMITIVES) {
      expect(
        Object.prototype.hasOwnProperty.call(
          AbstractResponse.prototype,
          method,
        ),
        `AbstractResponse.prototype must not own ${method}(): a brand that forgets pagination must fail ` +
          "at the type level, not inherit a silent stand-in",
      ).to.be.false;
    }
  });

  // The load-bearing half. `in` (via a real instance), not
  // hasOwnProperty(), on purpose: it is true for a method arriving from
  // anywhere — declared on the brand, inherited from a hoisted base
  // default, composed in through a mixin — which is the same defect from
  // a consumer's seat regardless of route.
  for (const [name, make] of brands) {
    it(`${name}.Response answers none of the six derived getters, by any route`, () => {
      const instance = make();
      for (const method of DERIVED_GETTERS) {
        expect(
          method in instance,
          `${name}.Response must not answer ${method}(): the derivation belongs to Paginator ` +
            "and is shared by every brand (RSRMID-2965)",
        ).to.be.false;
      }
    });
  }

  it("AbstractResponse owns getPagination() and getRecordsCount() — no brand assembles its own paginator or counts rows its own way", () => {
    for (const method of ["getPagination", "getRecordsCount"]) {
      expect(
        Object.prototype.hasOwnProperty.call(
          AbstractResponse.prototype,
          method,
        ),
        `AbstractResponse.prototype must own ${method}()`,
      ).to.be.true;
    }
  });

  // Paginator must stay constructible without a wire payload: every
  // constructor parameter is a plain number or null, never a class or
  // interface type. This is the type-level analogue of PHP's
  // "constructor takes builtin scalars only" reflection check — TS has no
  // runtime parameter-type reflection, so this is enforced at compile
  // time instead, the same way ColumnInterfaceCoverageSeam.spec.ts checks
  // Column's public surface. If this stops compiling, a non-scalar
  // parameter (e.g. a `ResponseInterface` for a rejected `fromResponse()`
  // convenience constructor) has been added.
  type PaginatorCtorParams = ConstructorParameters<typeof Paginator>;
  type EachParamIsNumberOrNull = PaginatorCtorParams extends (number | null)[]
    ? true
    : { readonly nonScalarConstructorParameter: PaginatorCtorParams };
  const paginatorCtorIsScalarOnly: EachParamIsNumberOrNull = true;

  it("Paginator's constructor takes plain numbers only (enforced above at compile time)", () => {
    // The real check is the module-level type assertion above — see
    // ColumnInterfaceCoverageSeam.spec.ts's file header for why a runtime
    // assertion cannot express this on its own; tsx transpiles tests/
    // without type-checking it, so this line exists only to keep the
    // guard visible in `pnpm test`'s output.
    expect(paginatorCtorIsScalarOnly).to.equal(true);
  });
});
