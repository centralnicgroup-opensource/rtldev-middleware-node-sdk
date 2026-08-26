import { expect } from "chai";
import "mocha";
import { AbstractClient } from "../../src/AbstractClient.ts";
import { AbstractSocketConfig } from "../../src/AbstractSocketConfig.ts";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { Client as CNRClient } from "../../src/CNR/Client.ts";
import { SocketConfig as CNRSocketConfig } from "../../src/CNR/SocketConfig.ts";
import { Client as IBSClient } from "../../src/IBS/Client.ts";
import { SocketConfig as IBSSocketConfig } from "../../src/IBS/SocketConfig.ts";
import { Client as MONIKERClient } from "../../src/MONIKER/Client.ts";
import { SocketConfig as MONIKERSocketConfig } from "../../src/MONIKER/SocketConfig.ts";
import * as CNRBarrel from "../../src/CNR/index.ts";

/**
 * Directive: API sessions and role credentials are a **CNR concept only**, and
 * they are absent from IBS/Moniker *by type* rather than present-and-throwing
 * (decision 7). `login`/`logout`/`saveSession`/`reuseSession`/`getSession`/
 * `setSession`/`setRoleCredentials` exist on `CNR.Client` and nowhere else;
 * the session id, the `persistent` flag and the role separator live on
 * `CNR.SocketConfig` and nowhere else.
 *
 * Failure mode prevented: two shapes, both of which look like tidying.
 * (1) Hoisting `session`/`persistent` onto `AbstractSocketConfig`, or the
 * lifecycle methods onto `AbstractClient`, "because the field is harmless
 * there" — that turns `ibs.setSession("x")` from a call-site type error into
 * a silent no-op, which is the single worst outcome for a credential-bearing
 * setter and the reason decision 7 is phrased as *by type*.
 * (2) Reintroducing the `CNR.SessionClient` subclass (or a `SessionCapable`
 * mixin) that RSRMID-2969 folded away — PHP had the identical empty-subclass
 * shape and deleted it, deliberately leaving no alias behind, because an alias
 * looks like free backward compatibility while proving nothing.
 *
 * Why structural: both are behaviour-preserving on the day they land. A field
 * hoisted to the base still answers correctly for CNR, and every existing test
 * constructs clients through the correct brand, so nothing behavioural ever
 * attempts `ibs.setSession()` to discover it silently succeeds. Only
 * reflecting over the prototypes can refuse the widening on arrival.
 *
 * Revisit condition: only if IBS/Moniker's platform genuinely grows a session
 * concept of its own. That would be a new capability with its own contract —
 * not a reason to widen the shared base, and not a reason to weaken this file.
 *
 * Non-vacuity: move any one of the seven method names onto `AbstractClient`,
 * or `session`/`persistent` onto `AbstractSocketConfig`, and the corresponding
 * test below fails immediately. Verified by applying exactly that mutation.
 *
 * PHP parity: `tests/ClientSessionSeamTest.php`. TypeScript has no runtime
 * reflection over *declared* (vs inherited) members the way PHP's
 * `ReflectionClass::getMethods(...)` does, so the "absent" half is asserted
 * with `in`, which walks the whole prototype chain — strictly stronger than
 * PHP's check here, since it also refuses an inherited copy.
 */
describe("Seam: sessions and role credentials are CNR-only, by type", () => {
  const SESSION_METHODS = [
    "login",
    "logout",
    "saveSession",
    "reuseSession",
    "getSession",
    "setSession",
    "setRoleCredentials",
  ];

  const CONFIG_SESSION_MEMBERS = [
    "getSession",
    "setSession",
    "setPersistent",
    "getPersistent",
    "getRoleSeparator",
  ];

  it("AbstractClient declares no session or role capability", () => {
    for (const method of SESSION_METHODS) {
      expect(
        method in AbstractClient.prototype,
        `AbstractClient must not carry "${method}": a session is a CNR platform concept, and hoisting it ` +
          "here turns an IBS/Moniker call-site type error into a silent no-op.",
      ).to.be.false;
    }
  });

  it("AbstractSocketConfig owns no session id, persistent flag or role separator", () => {
    for (const member of CONFIG_SESSION_MEMBERS) {
      expect(
        member in AbstractSocketConfig.prototype,
        `AbstractSocketConfig must not carry "${member}" — it belongs to CNR.SocketConfig alone.`,
      ).to.be.false;
    }
    // The backing fields, not just the accessors: a hoisted private field is
    // the halfway state that makes hoisting the accessor look harmless next.
    const cfg = new IBSSocketConfig() as unknown as { [key: string]: unknown };
    for (const field of ["session", "persistent", "roleSeparator"]) {
      expect(
        Object.prototype.hasOwnProperty.call(cfg, field),
        `AbstractSocketConfig must not own the field "${field}"`,
      ).to.be.false;
    }
  });

  const sessionless: [string, () => AbstractClient][] = [
    ["IBS", () => CF.ibs()],
    ["MONIKER", () => CF.moniker()],
  ];

  for (const [name, make] of sessionless) {
    it(`${name}.Client exposes no session or role capability, by any route`, () => {
      const cl = make() as unknown as { [key: string]: unknown };
      for (const method of SESSION_METHODS) {
        expect(
          method in cl,
          `${name}.Client must not expose "${method}" — declared, inherited or otherwise.`,
        ).to.be.false;
      }
    });

    it(`${name}.SocketConfig exposes no session state`, () => {
      const cfg = make().getSocketConfig() as unknown as {
        [key: string]: unknown;
      };
      for (const member of CONFIG_SESSION_MEMBERS) {
        expect(
          member in cfg,
          `${name}.SocketConfig must not expose "${member}".`,
        ).to.be.false;
      }
    });
  }

  it("CNR keeps the capability, on the Client itself and not behind a subclass", () => {
    const cl = CF.cnr();
    expect(
      cl.constructor,
      "ClientFactory.cnr() must hand out CNR.Client exactly",
    ).to.equal(CNRClient);
    for (const method of SESSION_METHODS) {
      expect(
        Object.prototype.hasOwnProperty.call(CNRClient.prototype, method),
        `CNR.Client.prototype must own "${method}" itself, not inherit it from a reinstated SessionClient.`,
      ).to.be.true;
    }
    for (const member of CONFIG_SESSION_MEMBERS) {
      expect(
        Object.prototype.hasOwnProperty.call(CNRSocketConfig.prototype, member),
        `CNR.SocketConfig.prototype must own "${member}"`,
      ).to.be.true;
    }
  });

  it("no SessionClient is exported from the CNR barrel", () => {
    // Exact-name check rather than instanceof: an alias or an empty
    // `class SessionClient extends Client {}` would still satisfy an
    // instanceof test, which is precisely the reinstatement this refuses.
    expect(
      "SessionClient" in CNRBarrel,
      "CNR.SessionClient was folded into CNR.Client (RSRMID-2969) and must not come back, not even as an alias.",
    ).to.be.false;
  });

  it("the compile-time half: a sessionless client's session call does not typecheck", () => {
    const ibs = new IBSClient(new IBSSocketConfig());
    const moniker = new MONIKERClient(new MONIKERSocketConfig());

    // @ts-expect-error — sessions are CNR-only; IBS.Client must not declare login().
    void ibs.login;
    // @ts-expect-error — MONIKER extends IBS.Client and must not acquire one either.
    void moniker.setSession;
    // @ts-expect-error — role credentials are CNR-only (RoleCredentialsInterface).
    void ibs.setRoleCredentials;
  });

  it("the persistent parameter is emitted by CNR's own config, not the shared base", () => {
    // The behavioural counterpart of the structural checks above: `persistent`
    // reaches the wire from CNR.SocketConfig.getPOSTDataParams() and from
    // nowhere else, so hoisting the flag would be observable here too.
    const cfg = new CNRSocketConfig();
    cfg.setLogin("acct").setPassword("pw").setPersistent(true);

    expect(cfg.getPOSTData({ COMMAND: "StatusAccount" }, false)).to.include(
      "persistent=1",
    );
    expect(
      new IBSSocketConfig()
        .setLogin("acct")
        .setPassword("pw")
        .getPOSTData({ Command: "Domain/Check" }, false),
    ).not.to.include("persistent");
  });
});
