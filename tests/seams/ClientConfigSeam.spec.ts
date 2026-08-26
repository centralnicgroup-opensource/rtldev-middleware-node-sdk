import { expect } from "chai";
import "mocha";
import { Client as CNRClient } from "../../src/CNR/Client.ts";
import { SocketConfig as CNRSocketConfig } from "../../src/CNR/SocketConfig.ts";
import { Client as IBSClient } from "../../src/IBS/Client.ts";
import { SocketConfig as IBSSocketConfig } from "../../src/IBS/SocketConfig.ts";
import { Client as MONIKERClient } from "../../src/MONIKER/Client.ts";
import { SocketConfig as MONIKERSocketConfig } from "../../src/MONIKER/SocketConfig.ts";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { AbstractSocketConfig } from "../../src/AbstractSocketConfig.ts";
import { UnsupportedFeatureException } from "../../src/Exception/UnsupportedFeatureException.ts";
import type { AbstractClient } from "../../src/AbstractClient.ts";
import type { PostDataParams } from "../../src/AbstractSocketConfig.ts";

/**
 * Directive: connection configuration lives ONLY on AbstractSocketConfig,
 * reachable through AbstractClient.getSocketConfig() — never duplicated as a
 * client-side instance property (decision 4, RSRMID-2921 in the PHP history
 * this ports from).
 *
 * Failure mode prevented: pre-RSRMID-2921 PHP kept a client-side `$socketURL`/
 * `$system`/`$curlOptions` beside the config's own copies, with no invariant
 * tying the two together — three independent drifts followed (URL/system
 * disagreement, high-performance routing losing the system, resetCurlOptions
 * dropping the proxy). See AbstractClientConfigDriftSeam.spec.ts for the
 * behavioural regression tests; this file guards the structural property that
 * makes all three unrepresentable.
 *
 * Why structural: re-adding a client-side copy is behaviour-preserving on the
 * day it lands — the copy agrees with the config until something writes only
 * one of them — so no behavioural test can catch it landing. Only reflecting
 * over the instance's own properties can refuse the copy on arrival.
 *
 * Revisit condition: none expected — this is the port's single-home invariant
 * for connection state, not a temporary constraint.
 *
 * Non-vacuity: add `private url = "";` to AbstractClient (or any brand Client)
 * and rerun — the first test below fails immediately.
 */
describe("Seam: connection configuration has exactly one home (the SocketConfig)", () => {
  const CONFIG_OWNED_PROPERTIES = [
    "url",
    "socketURL",
    "system",
    "curlopts",
    "curlOptions",
    "requestOptions",
    "proxy",
    "referer",
    "highPerformance",
    "oteUrl",
    "liveUrl",
    "socketTimeout",
  ];

  const brands: [string, () => AbstractClient][] = [
    ["CNR", () => CF.cnr()],
    ["IBS", () => CF.ibs()],
    ["MONIKER", () => CF.moniker()],
  ];

  for (const [name, make] of brands) {
    it(`${name}.Client carries no connection-configuration state of its own`, () => {
      const instance = make() as unknown as { [key: string]: unknown };
      for (const prop of CONFIG_OWNED_PROPERTIES) {
        expect(
          Object.prototype.hasOwnProperty.call(instance, prop),
          `${name}.Client must not carry an own property "${prop}": connection configuration lives on ` +
            "the SocketConfig. Forward to it instead of keeping a copy.",
        ).to.be.false;
      }
    });
  }

  it("the SocketConfig really owns the connection state (the test above isn't vacuous)", () => {
    const cfg = new (class extends AbstractSocketConfig {
      protected override get oteUrl(): string {
        return "https://ote.example/";
      }
      protected override get liveUrl(): string {
        return "https://live.example/";
      }
      protected override getPOSTDataParams(
        command: PostDataParams,
      ): PostDataParams {
        return command;
      }
    })() as unknown as { [key: string]: unknown };
    for (const prop of [
      "url",
      "highPerformance",
      "proxy",
      "referer",
      "requestOptions",
      "socketTimeout",
    ]) {
      expect(
        Object.prototype.hasOwnProperty.call(cfg, prop),
        `AbstractSocketConfig must own ${prop}`,
      ).to.be.true;
    }
  });

  const FORWARDED_METHODS = [
    "getURL",
    "setURL",
    "getLiveUrl",
    "getSystem",
    "isOTE",
    "useOTESystem",
    "useLIVESystem",
    "useHighPerformanceConnectionSetup",
    "getProxy",
    "setProxy",
    "getReferer",
    "setReferer",
    "getSocketTimeout",
    "setSocketTimeout",
    "setExtraRequestOptions",
    "resetRequestOptions",
    "getPOSTData",
  ];

  for (const [name, make] of brands) {
    it(`${name}.Client forwards every configuration method to the SocketConfig, and answers agree`, () => {
      const cl = make();
      const cfg = cl.getSocketConfig();
      for (const method of FORWARDED_METHODS) {
        expect(method in cl, `${name}.Client is missing forwarder ${method}`).to
          .be.true;
        expect(
          method in cfg,
          `${name}.SocketConfig is missing ${method} for the forwarder to reach`,
        ).to.be.true;
      }
      // Spot-check a couple of forwarders actually agree with the config's answer.
      expect(cl.getURL()).to.equal(cfg.getURL());
      expect(cl.getLiveUrl()).to.equal(cfg.getLiveUrl());
    });
  }
});

/**
 * Directive: a client accepts a pre-built brand `SocketConfig` at
 * construction, narrowed per brand, adopted by reference — the build half of
 * the seam whose read half is `getSocketConfig()` (RSRMID-2966, PHP-SDK
 * v33.0.0).
 *
 * Failure mode prevented: two shapes, both behaviour-preserving on the day
 * they land, which is why each needs its own check rather than one shared
 * assertion —
 * - A defensive `clone`/copy of the supplied config in the constructor would
 *   quietly reopen decision 4's "one home" invariant as a copy the caller
 *   cannot see: the copy agrees with the original until one of the two is
 *   written, so only a write-through check (not just identity) can catch it.
 * - Widening a brand's constructor parameter from its own `SocketConfig`
 *   subtype to the shared `AbstractSocketConfig` would let
 *   `new MONIKER.Client(new IBS.SocketConfig())` compile and silently point
 *   a Moniker client at the IBS host, since endpoints are the only
 *   difference between the two brands. TypeScript has no runtime constructor
 *   reflection the way PHP does, so this is checked the same way as
 *   `ColumnInterfaceCoverageSeam.spec.ts`: a `@ts-expect-error` line that
 *   only compiles because the narrowing is real.
 *
 * Why structural: both gaps are type-level or reference-identity properties
 * that no amount of behavioural testing through the *correct* call shape
 * would ever exercise — a test that only ever constructs clients correctly
 * cannot tell an adopted config from a cloned one, or a narrowed parameter
 * from a widened one, until the wrong shape is actually attempted.
 *
 * Non-vacuity: the write-through test fails if the constructor is changed to
 * `this.socketConfig = socketConfig ? cloneConfig(socketConfig) : ...` (or
 * any copy); the `@ts-expect-error` line fails `pnpm run typecheck` (as
 * "unused directive") if `MONIKER.Client`'s constructor parameter is widened
 * to `AbstractSocketConfig | null` — re-run both checks against any change
 * near this seam.
 */
describe("Seam: clients accept a pre-built, per-brand SocketConfig at construction", () => {
  // Each closure already calls its own brand's narrowed constructor
  // internally and returns [config, client] pairs — a fresh config per
  // route, so reusing one across both never gets asserted as a property this
  // guard doesn't claim.
  const routes: [string, () => [AbstractSocketConfig, AbstractClient][]][] = [
    [
      "CNR",
      () => {
        const direct = new CNRSocketConfig();
        const viaFactory = new CNRSocketConfig();
        return [
          [direct, new CNRClient(direct)],
          [viaFactory, CF.cnr(viaFactory)],
        ];
      },
    ],
    [
      "IBS",
      () => {
        const direct = new IBSSocketConfig();
        const viaFactory = new IBSSocketConfig();
        return [
          [direct, new IBSClient(direct)],
          [viaFactory, CF.ibs(viaFactory)],
        ];
      },
    ],
    [
      "MONIKER",
      () => {
        const direct = new MONIKERSocketConfig();
        const viaFactory = new MONIKERSocketConfig();
        return [
          [direct, new MONIKERClient(direct)],
          [viaFactory, CF.moniker(viaFactory)],
        ];
      },
    ],
  ];

  for (const [name, makeRoutes] of routes) {
    it(`${name}: a supplied config is adopted by reference, not copied, both via the constructor and via ClientFactory`, () => {
      for (const [cfg, cl] of makeRoutes()) {
        expect(
          cl.getSocketConfig(),
          `${name}.Client must adopt the supplied config, not a copy of it`,
        ).to.equal(cfg);

        // The identity above only matters because writes still cross it.
        cfg.setSocketTimeout(17);
        expect(cl.getSocketTimeout()).to.equal(17);
        cl.setReferer("https://adopted.example/");
        expect(cfg.getReferer()).to.equal("https://adopted.example/");
      }
    });
  }

  const defaults: [
    string,
    () => AbstractClient,
    new () => AbstractSocketConfig,
  ][] = [
    ["CNR", () => new CNRClient(), CNRSocketConfig],
    ["IBS", () => new IBSClient(), IBSSocketConfig],
    ["MONIKER", () => new MONIKERClient(), MONIKERSocketConfig],
  ];

  for (const [name, make, ConfigClass] of defaults) {
    it(`${name}: omitting the config still mints the brand's own config, exactly (not a parent brand's)`, () => {
      const cl = make();
      const cfg = cl.getSocketConfig();
      // Exact class, not instanceof: MONIKER.SocketConfig extends
      // IBS.SocketConfig, so an instanceof check would pass for Moniker and
      // hide exactly the endpoint mix-up the narrowed constructor exists to
      // prevent.
      expect(
        cfg.constructor,
        `a default-constructed ${name}.Client must build its own brand's config exactly`,
      ).to.equal(ConfigClass);
      expect(
        cl.getSocketConfig(),
        "the default config must be built once",
      ).to.equal(cfg);
      expect(cfg.getURL()).to.equal(cfg.getLiveUrl());
    });
  }

  it("MONIKER.Client's constructor refuses an IBS.SocketConfig at compile time", () => {
    // @ts-expect-error — endpoints are the only difference between IBS and
    // MONIKER; widening MONIKER.Client's constructor parameter to accept an
    // IBS.SocketConfig would silently point a Moniker client at the IBS
    // host, which is exactly what this line must never compile into.
    new MONIKERClient(new IBSSocketConfig());
  });

  // The other half of the narrowing accessor: its documented `@throws`.
  //
  // CNR.Client.getSocketConfig() refuses a non-CNR config rather than
  // asserting, so a subclass that seated the wrong one gets a named SDK
  // exception instead of an undefined-method failure deeper in. Nothing
  // exercised that branch, which left both the exception type and the
  // diagnostic — it names the class actually found — free to drift.
  //
  // Reaching it needs the one route the narrowing does not close. Both
  // writers of the property are typed to CNR.SocketConfig, so the cast is
  // what a subclass bypassing the narrowed constructor would amount to at
  // runtime; that is the case the guard is written for, not a poke past the
  // type system for its own sake. PHP added the same coverage in v33.0.3.
  it("CNR.Client.getSocketConfig() refuses a foreign config with a named exception", () => {
    const cl = CF.cnr();
    (cl as unknown as { socketConfig: AbstractSocketConfig }).socketConfig =
      new IBSSocketConfig();

    expect(() => cl.getSocketConfig())
      .to.throw(UnsupportedFeatureException)
      .with.property(
        "message",
        "CNR session and role handling require a CNIC.CNR.SocketConfig, got SocketConfig.",
      );
  });
});
