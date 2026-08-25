import { expect } from "chai";
import "mocha";
import { AbstractClient } from "../../src/AbstractClient.ts";
import { AbstractSocketConfig } from "../../src/AbstractSocketConfig.ts";
import { Client as CNRClient } from "../../src/CNR/Client.ts";
import { SocketConfig as CNRSocketConfig } from "../../src/CNR/SocketConfig.ts";
import { Client as IBSClient } from "../../src/IBS/Client.ts";
import { SocketConfig as IBSSocketConfig } from "../../src/IBS/SocketConfig.ts";
import { Client as MONIKERClient } from "../../src/MONIKER/Client.ts";
import { SocketConfig as MONIKERSocketConfig } from "../../src/MONIKER/SocketConfig.ts";

/**
 * Directive: rewriting a command's IDN parameters to punycode is CNR
 * behaviour and lives in `CNR.IDNCommandRewriter`, called from CNR's own
 * `buildCommand()` hook — never on the shared `AbstractClient`/
 * `AbstractSocketConfig` behind a capability flag (RSRMID-2922, ported from
 * PHP's `ClientIDNSeamTest`).
 *
 * Failure mode prevented: until PHP's v24 the rules lived as 37 lines on the
 * shared client, gated by a `needsIDNConvert` config flag that only CNR's
 * config set `true`. That shape means every future brand inherits dead
 * IDN-conversion code it must actively opt out of (or worse, forgets to, and
 * silently converts a value the platform already handles server-side) — the
 * exact bug class behaviour gap #21 in the port plan found in the pre-port
 * Node code (`autoIDNConvert()`'s key pattern omitting `PARENTDOMAIN`, because
 * a shared method was quietly carrying brand-specific knowledge).
 *
 * Why the guard must be structural rather than behavioural: hoisting the
 * rewrite back onto the shared base behind a flag is behaviour-preserving the
 * day it lands — CNR still converts, IBS/Moniker still do not, because the
 * flag is threaded through correctly. No functional test calling `request()`
 * can observe the hoist itself; only the drift a later edit to the "shared"
 * method causes becomes visible, and by then it silently affects every brand.
 * `Object.getOwnPropertyNames`/`in` on the class prototype is the one
 * instrument that can refuse the hoist on arrival rather than after it causes
 * damage.
 *
 * Revisit condition: only if a second brand genuinely needs client-side IDN
 * conversion (IBS/Moniker convert server-side and are not expected to). If
 * that happens, the rewrite becomes a capability every brand names for
 * itself (e.g. each brand's own `buildCommand()` hook calling its own
 * rewriter), not a flag re-added to the shared base — see the class-level
 * reasoning in `CNIC.CNR.IDNCommandRewriter`.
 *
 * Non-vacuity: temporarily move `IDNCommandRewriter.rewrite()`'s call out of
 * `CNR.Client.buildCommand()` and back onto `AbstractClient` behind a
 * `needsIDNConvert` flag on `AbstractSocketConfig` — every assertion below
 * fails immediately (`hasOwnMethod`/`hasOwnField` finds the reintroduced
 * flag/method), which is what makes this guard non-vacuous. Revert after
 * checking.
 */
describe("Seam: IDN command rewriting is CNR-only", () => {
  /**
   * Whether `member` is declared as a *method or accessor* anywhere in
   * `cls`'s own prototype chain. Methods/getters live on the prototype from
   * the moment the class is defined, so this needs no instance.
   */
  function hasOwnMethod(cls: { prototype: object }, member: string): boolean {
    let proto: object | null = cls.prototype;
    while (proto !== null) {
      if (Object.prototype.hasOwnProperty.call(proto, member)) {
        return true;
      }
      proto = Object.getPrototypeOf(proto) as object | null;
    }
    return false;
  }

  /**
   * Whether `member` is declared as a plain class *field* anywhere in the
   * chain that produced `instance`. Unlike PHP properties, a TS class field
   * compiles to a `this.member = ...` assignment run during construction —
   * it is an own property of the *instance*, never of the prototype — so
   * catching a field re-added on `AbstractSocketConfig` itself needs an
   * instance of a concrete subclass, not the abstract class's prototype.
   */
  function hasOwnField(instance: object, member: string): boolean {
    return Object.prototype.hasOwnProperty.call(instance, member);
  }

  const clientClasses: [string, { prototype: object }][] = [
    ["AbstractClient", AbstractClient],
    ["CNR.Client", CNRClient],
    ["IBS.Client", IBSClient],
    ["MONIKER.Client", MONIKERClient],
  ];

  for (const [name, cls] of clientClasses) {
    it(`${name} must not carry the IDN command rewrite (autoIDNConvert)`, () => {
      expect(
        hasOwnMethod(cls, "autoIDNConvert"),
        `${name} must not declare autoIDNConvert() — it belongs in CNR.IDNCommandRewriter, ` +
          "called from CNR's buildCommand() hook (RSRMID-2922).",
      ).to.be.false;
    });
  }

  it("AbstractSocketConfig must not carry a needsIDNConvert getter", () => {
    expect(
      hasOwnMethod(AbstractSocketConfig, "getNeedsIDNConvert"),
      "AbstractSocketConfig.getNeedsIDNConvert() must be gone (RSRMID-2922).",
    ).to.be.false;
  });

  // Concrete configs only: AbstractSocketConfig cannot be `new`-ed directly,
  // but a field it declared would still show up as an own property of every
  // subclass instance (JS runs the base constructor's field initialisers
  // first), so instantiating the three brand configs also covers the
  // abstract base.
  const configInstances: [string, AbstractSocketConfig][] = [
    ["CNR.SocketConfig", new CNRSocketConfig()],
    ["IBS.SocketConfig", new IBSSocketConfig()],
    ["MONIKER.SocketConfig", new MONIKERSocketConfig()],
  ];

  for (const [name, instance] of configInstances) {
    it(`${name} must not carry a needsIDNConvert flag or getter`, () => {
      expect(
        hasOwnField(instance, "needsIDNConvert"),
        `${name} must not declare needsIDNConvert: its only purpose was to disable CNR behaviour ` +
          "for the two brands that never needed it (RSRMID-2922).",
      ).to.be.false;
      expect(
        hasOwnMethod(instance.constructor, "getNeedsIDNConvert"),
        `${name}.getNeedsIDNConvert() must be gone.`,
      ).to.be.false;
    });
  }
});
