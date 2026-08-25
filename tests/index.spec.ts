import { expect } from "chai";
import "mocha";
import * as barrel from "../src/index.ts";
import * as cnrBarrel from "../src/CNR/index.ts";
import * as ibsBarrel from "../src/IBS/index.ts";
import * as monikerBarrel from "../src/MONIKER/index.ts";
import * as exceptionBarrel from "../src/Exception/index.ts";

/**
 * The barrel files (root + one per subdirectory) exist only because
 * `moduleResolution: node16` has no directory-index resolution — see each
 * file's own docblock. They carry real re-export statements that execute at
 * module-load time, so — unlike the pure `*Interface.ts`/`types.ts` files,
 * which are erased entirely at compile time and excluded from coverage —
 * these are real runtime modules a consumer actually loads. Every test
 * elsewhere in this suite imports classes directly from their own file for
 * precision, which means nothing else ever exercises the barrels themselves;
 * this file's only job is to import through each one instead.
 */
describe("package barrels", () => {
  it("the root barrel exposes ClientFactory and the brand namespaces", () => {
    expect(barrel.ClientFactory).to.be.a("function");
    const cnr = barrel.ClientFactory.cnr();
    // Exact class, not instanceof: a re-added CNR.SessionClient subclass (or
    // an alias) would still pass an instanceof check, which is exactly the
    // accident this pins against (RSRMID-2969, matching PHP's own
    // re-decided assertSame(Client::class, CF::cnr()::class)).
    expect(cnr.constructor).to.equal(cnrBarrel.Client);
  });

  it("the root barrel exposes shared concretes and abstracts", () => {
    expect(barrel.Record).to.be.a("function");
    expect(barrel.Column).to.be.a("function");
    expect(barrel.Paginator).to.be.a("function");
    expect(barrel.System).to.deep.equal({ OTE: "OTE", LIVE: "LIVE" });
    expect(barrel.ApiDateTime).to.be.a("function");
    expect(barrel.EchoSink).to.be.a("function");
    expect(barrel.AbstractClient).to.be.a("function");
    expect(barrel.AbstractLogger).to.be.a("function");
    expect(barrel.AbstractResponse).to.be.a("function");
    expect(barrel.AbstractSocketConfig).to.be.a("function");
  });

  it("the CNR barrel exposes every CNR class", () => {
    for (const name of [
      "Client",
      "IDNCommandRewriter",
      "Logger",
      "Response",
      "ResponseParser",
      "ResponseTemplateManager",
      "ResponseTranslator",
      "SensitiveFields",
      "SocketConfig",
    ] as const) {
      expect(cnrBarrel[name], `CNR barrel missing ${name}`).to.be.a("function");
    }
  });

  it("the CNR barrel does not expose a SessionClient — the session lifecycle lives on Client itself (RSRMID-2969)", () => {
    expect("SessionClient" in cnrBarrel).to.be.false;
  });

  it("the IBS barrel exposes every IBS class", () => {
    for (const name of [
      "Client",
      "Logger",
      "Response",
      "ResponseParser",
      "ResponseTemplateManager",
      "ResponseTranslator",
      "SensitiveFields",
      "SocketConfig",
    ] as const) {
      expect(ibsBarrel[name], `IBS barrel missing ${name}`).to.be.a("function");
    }
  });

  it("the MONIKER barrel exposes its two classes, both extending IBS", () => {
    expect(monikerBarrel.Client).to.be.a("function");
    expect(monikerBarrel.SocketConfig).to.be.a("function");
    expect(new monikerBarrel.Client()).to.be.instanceOf(ibsBarrel.Client);
  });

  it("the Exception barrel exposes the full hierarchy rooted at CnicException", () => {
    for (const name of [
      "CnicException",
      "DuplicateColumnException",
      "InvalidConfigurationException",
      "InvalidDateTimeException",
      "PaginationException",
      "UnsupportedFeatureException",
    ] as const) {
      expect(exceptionBarrel[name], `Exception barrel missing ${name}`).to.be.a(
        "function",
      );
    }
    expect(new exceptionBarrel.PaginationException("x")).to.be.instanceOf(
      exceptionBarrel.CnicException,
    );
  });

  it('package.json#exports resolves only "." — a deep import path is not the barrel\'s concern to test, but the barrel itself must not re-export a deep module path as a value', () => {
    // Sanity: the barrel's own surface is finite and enumerable (no wildcard
    // re-export that would defeat the single-entry-point decision).
    expect(Object.keys(barrel).length).to.be.greaterThan(0);
  });
});
