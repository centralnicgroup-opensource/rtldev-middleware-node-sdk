import { expect } from "chai";
import "mocha";
import { AbstractResponseTemplateManager } from "../../src/AbstractResponseTemplateManager.ts";
import { Response as CNRResponse } from "../../src/CNR/Response.ts";
import { ResponseTemplateManager as CNRTemplates } from "../../src/CNR/ResponseTemplateManager.ts";
import { Response as IBSResponse } from "../../src/IBS/Response.ts";
import { ResponseTemplateManager as IBSTemplates } from "../../src/IBS/ResponseTemplateManager.ts";

/**
 * Directive: a response-template registry is an object. Its contents belong
 * to that object and reach a Response only by being handed to one — through
 * AbstractResponse's constructor `templates` argument, forwarded by the
 * brand's translate() hook to AbstractResponseTranslator.translate(). No
 * static container, no singleton, no registry a caller can reach without
 * being given it (decision 10).
 *
 * Failure mode prevented: the pre-port Node SDK is a process-wide singleton
 * (`ResponseTemplateManager.getInstance()`) with a public mutable `templates`
 * field — exactly the shape this seam exists to refuse. A registration in one
 * test would silently change response translation in every later one,
 * making the whole suite order-dependent.
 *
 * Why structural: restoring a shared container is behaviour-preserving on
 * the day it lands — every existing test still passes, because a
 * single-writer suite cannot tell a per-instance registry from a shared one.
 * The defect only shows up later as an ordering coupling between two test
 * files that never mention each other. Hence asserting instance isolation
 * directly, not waiting for a coincidental collision to surface it.
 *
 * Revisit condition: a concrete need for templates that outlive the object
 * that registered them (e.g. brand-wide overrides configured once at
 * bootstrap). That would mean threading a registry through AbstractClient
 * (additive), never reinstating a shared/static container.
 *
 * Non-vacuity: change `AbstractResponseTemplateManager`'s `templates` field to
 * `static`, or make `translate()` read a module-level registry instead of its
 * `templates` parameter, and rerun — the isolation and forwarding tests below
 * fail immediately.
 */
describe("Seam: the response-template registry is per-instance state", () => {
  it("a CNR-registered template is visible only to the registry that received it", () => {
    const mine = new CNRTemplates().addTemplate(
      "seamScoped",
      "200",
      "scoped to mine",
    );

    expect(
      new CNRResponse(
        "seamScoped",
        {},
        {},
        {},
        null,
        null,
        mine,
      ).getDescription(),
    ).to.equal("scoped to mine");
    expect(new CNRResponse("seamScoped").getDescription()).to.not.equal(
      "scoped to mine",
    );
  });

  it("an IBS-registered template is visible only to the registry that received it", () => {
    const mine = new IBSTemplates().addTemplate(
      "seamScoped",
      "SUCCESS",
      "scoped to mine",
    );

    expect(
      new IBSResponse(
        "seamScoped",
        {},
        {},
        {},
        null,
        null,
        mine,
      ).getDescription(),
    ).to.equal("scoped to mine");
    expect(new IBSResponse("seamScoped").getDescription()).to.not.equal(
      "scoped to mine",
    );
  });

  it("two registries of the same brand do not see each other", () => {
    const a = new IBSTemplates().addTemplate("seamA", "FAILURE", "a");
    const b = new IBSTemplates();

    expect(a.hasTemplate("seamA")).to.be.true;
    expect(
      b.hasTemplate("seamA"),
      "a registry must not observe another's registrations",
    ).to.be.false;
    expect(
      b.hasTemplate("empty"),
      "the brand's built-ins are seeded into every instance",
    ).to.be.true;
  });

  it("the built-ins cannot be reached or rewritten through an instance", () => {
    // Mutating one instance to exhaustion must leave the next one pristine —
    // exactly what a shared/static container would fail to do.
    const vandal = new IBSTemplates();
    for (const id of Object.keys(vandal.getRawTemplates())) {
      vandal.addTemplate(id, "FAILURE", "vandalised");
    }

    const fresh = new IBSTemplates();
    expect(fresh.getRawTemplates()).to.deep.equal(
      new IBSTemplates().getRawTemplates(),
      "the built-ins a new registry starts from must not be reachable for writing",
    );
    expect(fresh.getTemplate("empty").getDescription()).to.not.include(
      "vandalised",
    );
  });

  // PHP's identical `return $this->templates;` is safe because PHP arrays
  // are copy-on-write value types; JS objects are references, so the same
  // code would hand back the live registry map itself, letting a caller
  // rewrite it without going through addTemplate() at all — a stronger
  // break of per-instance isolation than the vandal test above exercises.
  it("mutating the object from getRawTemplates() does not change the registry's own map", () => {
    const registry = new IBSTemplates();
    const raw = registry.getRawTemplates();
    raw["empty"] = "vandalised";
    delete raw["error"];

    expect(registry.getRawTemplates()["empty"]).to.not.equal("vandalised");
    expect(registry.hasTemplate("error")).to.be.true;
  });

  it("the Response constructor forwards the registry it was given, not a default", () => {
    const registry = new CNRTemplates().addTemplate(
      "seamForwarded",
      "421",
      "forwarded to the translator",
    );

    expect(
      new CNRResponse(
        "seamForwarded",
        {},
        {},
        {},
        null,
        null,
        registry,
      ).getDescription(),
    ).to.equal("forwarded to the translator");
    expect(
      new CNRResponse(
        "seamForwarded",
        {},
        {},
        {},
        null,
        null,
        registry,
      ).getCode(),
    ).to.equal(421);
  });

  it("matching an incomplete hash answers false without throwing on a missing key", () => {
    for (const registry of [new CNRTemplates(), new IBSTemplates()]) {
      expect(() =>
        registry.isTemplateMatchHash({ only: "one key" }, "empty"),
      ).to.not.throw();
      expect(registry.isTemplateMatchHash({ only: "one key" }, "empty")).to.be
        .false;
    }
  });

  it("matching an incomplete plain response takes the same guarded path", () => {
    for (const registry of [new CNRTemplates(), new IBSTemplates()]) {
      expect(() =>
        registry.isTemplateMatchPlain("nothing=here\r\n", "empty"),
      ).to.not.throw();
      expect(registry.isTemplateMatchPlain("nothing=here\r\n", "empty")).to.be
        .false;
    }
  });

  it("resetTemplates() is gone and must not come back", () => {
    expect(
      "resetTemplates" in AbstractResponseTemplateManager.prototype,
      "resetTemplates() undid a leak that no longer exists — reinstating it means the leak is back",
    ).to.be.false;
    expect("resetTemplates" in CNRTemplates.prototype).to.be.false;
    expect("resetTemplates" in IBSTemplates.prototype).to.be.false;
  });

  it("there is no getInstance() — the registry is never a singleton", () => {
    expect("getInstance" in AbstractResponseTemplateManager).to.be.false;
    expect("getInstance" in CNRTemplates).to.be.false;
    expect("getInstance" in IBSTemplates).to.be.false;
  });
});
