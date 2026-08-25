import { expect } from "chai";
import "mocha";
import { AbstractResponseTemplateManager } from "../../src/AbstractResponseTemplateManager.ts";
import { ResponseTemplateManager as CNRTemplates } from "../../src/CNR/ResponseTemplateManager.ts";
import { ResponseTemplateManager as IBSTemplates } from "../../src/IBS/ResponseTemplateManager.ts";
import type { ResponseTemplateFactoryInterface } from "../../src/ResponseTemplateFactoryInterface.ts";
import type { ResponseTemplateManagerInterface } from "../../src/ResponseTemplateManagerInterface.ts";

/**
 * Keeps the template registry's two faces apart (RSRMID-2968).
 *
 * Directive: a template registry publishes two disjoint contracts.
 * `ResponseTemplateManagerInterface` is the pipeline contract —
 * `AbstractResponseTranslator.translate()`'s only call on it is
 * `getRawTemplates()` — and must declare nothing that produces a Response.
 * `ResponseTemplateFactoryInterface` is the opt-in half that turns stored
 * templates into Responses, addressed by template id only; wire text is
 * never a way in.
 *
 * Failure mode prevented: two, both present pre-split.
 *
 * - The pipeline could re-enter itself. `translate()` holds a registry;
 *   while `getTemplate()` lived on the type it holds, calling it from
 *   inside `translate()` would build a Response whose constructor calls
 *   `translate()` again. What stopped it was a hand-written comment at the
 *   call site ("don't use getTemplate() as it leads to endless loop"), not
 *   a mechanism. With the method off the type, the call is a compile error.
 * - One parameter carried two meanings. The Response-building hook was
 *   `createResponse(raw)`, and its two callers disagreed about `raw`:
 *   `getTemplate()` passed a template id, `getTemplates()` passed that
 *   entry's own wire text. Register a template whose wire text is another
 *   template's id and the two routes returned different Responses — see
 *   the collision test below, which is the mutation that makes this
 *   concrete.
 *
 * Why structural: both defects are behaviour-preserving to reintroduce.
 * Nothing in `src/` calls the factory methods on the pipeline-typed
 * parameter — `getRawTemplates()` is the only production call site on
 * either contract — so merging the interfaces back leaves every other test
 * green; the recursion only appears the first time something inside the
 * pipeline takes the route the type now forbids. And every template either
 * brand ships has wire text that is not also a registered id, so the
 * collision only appears for a template a consumer registers later — hence
 * the collision case is asserted directly rather than trusted to a sweep
 * over the built-ins (see `testEveryTemplateResolvesIdenticallyThroughBothRoutes`'s
 * PHP counterpart, ported below as the second behavioural test).
 *
 * Revisit condition: the pipeline genuinely needing a Response from the
 * registry (e.g. `translate()` itself returning a `ResponseInterface`) —
 * the fix then is a factory argument of its own, not widening the pipeline
 * contract back to eight methods.
 *
 * Non-vacuity: proved twice by mutation, not by reasoning about the type.
 * Reverting `getTemplates()` to iterate `Object.entries()` and hand the
 * stored wire text to the hook (rather than the key) fails exactly
 * "getTemplate() and getTemplates() agree when a template's wire text is
 * another template's id" below, no other test in this file. Widening
 * `createResponseFromTemplateId` from `protected` to `public` on the
 * abstract base fails `pnpm run typecheck` immediately — TS2415, both
 * brand overrides "incorrectly extend" the base because narrowing a public
 * inherited member back to `protected` is itself illegal — which is a
 * stronger signal than the `@ts-expect-error` below going unused, though
 * either mutation trips a gate.
 */

/**
 * `true` when `Registry` and `Factory` share no member names — the
 * type-level form of PHP's `assertSame([], array_intersect(...))`. TS has
 * no interface reflection, so set-equality is checked the same way the
 * other seams in this file do: a conditional type assigned to a `const`,
 * enforced by `pnpm run typecheck` rather than by the `it()` body (see
 * ColumnInterfaceCoverageSeam.spec.ts for why).
 */
type Disjoint<Registry, Factory> = keyof Registry & keyof Factory extends never
  ? true
  : {
      readonly overlappingMember: keyof Registry & keyof Factory;
    };

const contractsAreDisjoint: Disjoint<
  ResponseTemplateManagerInterface,
  ResponseTemplateFactoryInterface
> = true;

/**
 * `true` when `Factory`'s member set is exactly `Expected` — both
 * directions, so deleting one of the four (rather than moving it) fails
 * this just as loudly as leaving it on the registry would.
 */
type FactoryDeclaresExactly<
  Factory,
  Expected extends string,
> = keyof Factory extends Expected
  ? Expected extends keyof Factory
    ? true
    : { readonly missingFromFactory: Exclude<Expected, keyof Factory> }
  : { readonly unexpectedOnFactory: Exclude<keyof Factory, Expected> };

const factoryCarriesExactlyTheResponseProducingMethods: FactoryDeclaresExactly<
  ResponseTemplateFactoryInterface,
  | "getTemplate"
  | "getTemplates"
  | "isTemplateMatchHash"
  | "isTemplateMatchPlain"
> = true;

describe("Seam: the template registry's two faces stay apart", () => {
  it("ResponseTemplateManagerInterface and ResponseTemplateFactoryInterface share no member (enforced above at compile time)", () => {
    // The real check is the module-level type assertion above — tsx
    // transpiles tests/ without type-checking it, so this line exists only
    // to keep the guard visible in `pnpm test`'s output; the enforcement is
    // `pnpm run typecheck`.
    expect(contractsAreDisjoint).to.equal(true);
  });

  it("ResponseTemplateFactoryInterface still carries exactly the four Response-producing methods (enforced above at compile time)", () => {
    expect(factoryCarriesExactlyTheResponseProducingMethods).to.equal(true);
  });

  it("createResponseFromTemplateId is protected — not part of either published contract", () => {
    // @ts-expect-error createResponseFromTemplateId is a protected hook,
    // not part of either published contract; calling it from outside the
    // class hierarchy must be a compile error. If this stops being an
    // error (the modifier was dropped), `pnpm run typecheck` reports this
    // directive as unused, which is the non-vacuity proof for this test.
    new CNRTemplates().createResponseFromTemplateId("empty");
  });

  it("createResponseFromTemplateId is declared by each concrete registry, resolving one template id and nothing else", () => {
    for (const Brand of [CNRTemplates, IBSTemplates]) {
      expect(
        Object.prototype.hasOwnProperty.call(
          Brand.prototype,
          "createResponseFromTemplateId",
        ),
        `${Brand.name}.prototype must own createResponseFromTemplateId() itself`,
      ).to.be.true;
    }
  });

  it("createResponse — the ambiguous name RSRMID-2968 removed — does not exist anywhere in the hierarchy", () => {
    for (const Brand of [
      AbstractResponseTemplateManager,
      CNRTemplates,
      IBSTemplates,
    ]) {
      expect(
        "createResponse" in Brand.prototype,
        `${Brand.name} must not answer createResponse(): its callers disagreed on whether the ` +
          "argument was a template id or wire text, which is exactly the collision this split closed",
      ).to.be.false;
    }
  });

  it("getTemplate() and getTemplates() agree when a template's wire text is another template's id", () => {
    // "collide" stores the literal string "empty", which is also a
    // built-in template id. Before the fix, getTemplates() passed that
    // wire text to the Response-building hook, translate() re-resolved it
    // as an id, and this route handed back the "empty" template while
    // getTemplate("collide") handed back what the literal payload actually
    // parses to.
    for (const registry of [new CNRTemplates(), new IBSTemplates()]) {
      registry.addTemplate("collide", "empty");

      const viaId = registry.getTemplate("collide");
      const viaAll = registry.getTemplates()["collide"];
      if (viaAll === undefined) {
        throw new Error("getTemplates() must carry the just-registered id");
      }

      expect(viaAll.getDescription()).to.equal(
        viaId.getDescription(),
        "getTemplate() and getTemplates() disagree about the same template id",
      );
      expect(viaAll.getCode()).to.equal(
        viaId.getCode(),
        "same id, two response codes",
      );
      expect(viaAll.getDescription()).to.not.equal(
        registry.getTemplate("empty").getDescription(),
        'asking for "collide" returned the "empty" template — the payload was re-resolved as an ' +
          "id instead of being taken as this template's content",
      );
    }
  });

  it("every template resolves identically through both routes", () => {
    // The general form of the case above, over the brand's own built-ins
    // plus one registered here. getTemplates() is keyed by id and must
    // build from that id, so this is an identity by construction — and a
    // getTemplates() that went back to iterating values would still pass
    // this sweep for the built-ins, which is why the collision case above
    // is asserted separately rather than trusted to this one.
    for (const registry of [new CNRTemplates(), new IBSTemplates()]) {
      registry.addTemplate(
        "seamRegistered",
        "421",
        "registered on this registry",
      );

      const all = registry.getTemplates();
      const ids = Object.keys(all);
      expect(ids, "no templates to compare — the sweep would prove nothing").to
        .not.be.empty;

      for (const id of ids) {
        const viaAll = all[id];
        if (viaAll === undefined) {
          continue;
        }
        expect(viaAll.getDescription()).to.equal(
          registry.getTemplate(id).getDescription(),
          `template "${id}" resolves differently depending on which route asked for it`,
        );
      }

      expect(all["seamRegistered"]?.getDescription()).to.equal(
        "registered on this registry",
      );
    }
  });
});
