import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { System } from "../../src/System.ts";
import { SpyTransport } from "../Support/SpyTransport.ts";
import type { AbstractClient } from "../../src/AbstractClient.ts";

/**
 * Regression tests for the configuration drifts that follow from giving
 * connection state a second home (see ClientConfigSeam.spec.ts for the
 * structural guard). Stated as behaviour so a reader can see what used to
 * happen: URL/system disagreement, high-performance routing losing the
 * system, and — the one this port actually shipped once (B2) — the proxy/
 * referer being stored correctly and never reaching the wire.
 *
 * Assertions about what reaches the transport go through SpyTransport, never
 * the client's own state: a value stored correctly and never sent is exactly
 * the defect class this file exists to catch — "in the bag" is not "on the
 * wire".
 *
 * Non-vacuity: revert AbstractSocketConfig.getTransportOptions() to return
 * only `{ ...this.requestOptions }` (dropping proxy/referer) and rerun —
 * "the dedicated proxy/referer state reaches the transport" fails
 * immediately, reproducing B2.
 */
describe("Seam: client configuration drift regressions", () => {
  const brands: [string, () => AbstractClient][] = [
    ["CNR", () => CF.cnr()],
    ["IBS", () => CF.ibs()],
    ["MONIKER", () => CF.moniker()],
  ];

  for (const [name, make] of brands) {
    it(`${name}: a custom URL cannot leave the system flag lying`, () => {
      const cl = make();
      cl.useOTESystem().setURL("https://example.test/");

      expect(
        cl.isOTE(),
        "isOTE() must not still claim OT&E after the URL was replaced",
      ).to.be.false;
      expect(
        cl.getSystem(),
        "an unrecognised endpoint has no OT&E-or-LIVE answer",
      ).to.be.null;
      expect(cl.getURL()).to.equal("https://example.test/");
    });

    it(`${name}: system and URL agree on the known endpoints`, () => {
      const cl = make();

      expect(cl.getSystem(), "LIVE is the default").to.equal(System.LIVE);
      expect(cl.getURL()).to.equal(cl.getLiveUrl());
      expect(cl.isOTE()).to.be.false;

      cl.useOTESystem();
      expect(cl.getSystem()).to.equal(System.OTE);
      expect(cl.isOTE()).to.be.true;

      cl.setURL("https://example.test/").useLIVESystem();
      expect(cl.getSystem()).to.equal(System.LIVE);
      expect(cl.getURL()).to.equal(cl.getLiveUrl());
    });

    it(`${name}: high-performance routing preserves the selected system`, () => {
      const cl = make();
      cl.useOTESystem().useHighPerformanceConnectionSetup();

      expect(
        cl.isOTE(),
        "routing through a local proxy does not change which system it fronts",
      ).to.be.true;
      expect(cl.getSystem()).to.equal(System.OTE);
      expect(cl.getURL()).to.equal("http://127.0.0.1/");
    });

    it(`${name}: high-performance routing survives a later system switch`, () => {
      const cl = make();
      cl.useHighPerformanceConnectionSetup().useOTESystem();
      expect(cl.getURL()).to.equal("http://127.0.0.1/");

      cl.useLIVESystem();
      expect(cl.getURL()).to.equal("http://127.0.0.1/");
      expect(cl.getSystem()).to.equal(System.LIVE);
    });

    it(`${name}: getURL()/getLiveUrl() and the SocketConfig's own answer agree from one home`, () => {
      const cl = make();
      const cfg = cl.getSocketConfig();

      expect(cl.getURL()).to.equal(cfg.getURL());
      expect(cl.getLiveUrl()).to.equal(cfg.getLiveUrl());

      cl.setURL("https://example.test/");
      expect(cl.getLiveUrl()).to.equal(cfg.getLiveUrl());
      expect(cl.getURL()).to.equal("https://example.test/");
    });
  }

  it("high-performance routing rewrites only the scheme and host", () => {
    const cl = CF.cnr();
    cl.setURL(
      "https://api.example.com:8443/api.example.com/call.cgi?foo=bar",
    ).useHighPerformanceConnectionSetup();
    expect(cl.getURL()).to.equal(
      "http://127.0.0.1:8443/api.example.com/call.cgi?foo=bar",
    );
  });

  it("high-performance routing leaves a hostless URL alone", () => {
    const cl = CF.cnr();
    cl.setURL("/relative/path").useHighPerformanceConnectionSetup();
    expect(cl.getURL()).to.equal("/relative/path");
  });

  it("the URL the request actually goes to is the one getURL() reports", async () => {
    const spy = new SpyTransport();
    const cl = CF.cnr();
    cl.setTransport(spy).setURL("https://example.test/");
    await cl.request({ COMMAND: "StatusAccount" });

    expect(spy.url).to.equal("https://example.test/api/call.cgi");
  });

  describe("B2: the dedicated proxy/referer state must reach the transport, not just the config", () => {
    it("the dedicated proxy/referer state reaches the transport", async () => {
      const spy = new SpyTransport();
      const cl = CF.cnr();
      cl.setTransport(spy).useOTESystem();
      cl.setProxy("http://proxy.test:8080").setReferer("https://referer.test/");
      await cl.request({ COMMAND: "StatusAccount" });

      expect(spy.options.proxy).to.equal("http://proxy.test:8080");
      expect(spy.options.referer).to.equal("https://referer.test/");
    });

    it("resetting proxy/referer stops them reaching the transport", async () => {
      const spy = new SpyTransport();
      const cl = CF.cnr();
      cl.setTransport(spy).useOTESystem();
      cl.setProxy("http://proxy.test:8080").setReferer("https://referer.test/");
      cl.setProxy().setReferer();
      await cl.request({ COMMAND: "StatusAccount" });

      expect(cl.getProxy()).to.be.null;
      expect(cl.getReferer()).to.be.null;
      expect(spy.options.proxy ?? null).to.be.null;
      expect(spy.options.referer ?? null).to.be.null;
    });

    it("resetExtraRequestOptions() does not drop the proxy/referer (they are not bag keys)", () => {
      const cl = CF.cnr();
      cl.setProxy("http://proxy.test:8080").setReferer("https://referer.test/");
      cl.setExtraRequestOptions({ redirect: "manual" });

      cl.resetRequestOptions();

      expect(
        cl.getProxy(),
        "the proxy is not a request-option default",
      ).to.equal("http://proxy.test:8080");
      expect(cl.getReferer()).to.equal("https://referer.test/");
      expect(cl.getSocketConfig().getRequestOptions()).to.deep.equal({});
    });
  });

  it("the request timeout has exactly one route: AbortSignal, not the option bag", async () => {
    const cl = CF.cnr();
    cl.setSocketTimeout(7);

    const spy = new SpyTransport();
    await cl
      .setTransport(spy)
      .useOTESystem()
      .request({ COMMAND: "StatusAccount" });

    expect(spy.timeout).to.equal(7);
    expect("signal" in spy.options).to.be.false;
  });

  it("getUserAgent() does not memoise the default into stored state (a pure read)", () => {
    const cl = CF.cnr();
    const first = cl.getUserAgent();

    expect(
      (cl as unknown as { userAgent: string }).userAgent,
      "getUserAgent() must not write the default back",
    ).to.equal("");
    expect(cl.getUserAgent()).to.equal(first);
    expect(first).to.include("NODE-SDK");
  });

  it("an explicit user agent wins and is what reaches the wire", async () => {
    const spy = new SpyTransport();
    const cl = CF.cnr();
    cl.setTransport(spy).useOTESystem().setUserAgent("MyPlatform", "1.2.3");
    await cl.request({ COMMAND: "StatusAccount" });

    expect(cl.getUserAgent()).to.match(/^MyPlatform \(/);
    expect(spy.userAgent).to.equal(cl.getUserAgent());
  });

  it("setCredentials() discards an active CNR session, by design", () => {
    const cl = CF.cnr();
    cl.setCredentials("myaccount", "mypassword").setSession("SESSION-ABC");
    expect(cl.getSession()).to.equal("SESSION-ABC");

    cl.setCredentials("myaccount", "mypassword");
    expect(cl.getSession(), "new credentials supersede the session, by design")
      .to.be.null;
  });
});
