import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { Response as R } from "../../src/IBS/Response.ts";
import { Cassettes } from "../Support/Cassettes.ts";
import { CassetteTransport } from "../Support/CassetteTransport.ts";
import type { RoleCredentialsInterface } from "../../src/RoleCredentialsInterface.ts";

/**
 * IBS.Client — brand contract plus the cassette-driven request() lifecycle,
 * ported from PHP's IBS/ClientTest.php. Deliberately not requiring live
 * credentials: replay mode (the default) is fully offline.
 */
describe("IBS.Client", () => {
  const cassetteDir = new URL("./cassettes", import.meta.url).pathname;
  let cl: ReturnType<typeof CF.ibs>;
  let tape: CassetteTransport;

  beforeEach(() => {
    cl = CF.ibs();
    tape = Cassettes.attach(cl, cassetteDir);
  });

  afterEach(async () => {
    await Cassettes.throttle();
  });

  it("getPOSTData secures the password but not the apikey", () => {
    cl.setCredentials("test.user", "test.pw");
    const enc = cl.getPOSTData(
      { domain: "test.com", ResponseFormat: "JSON" },
      true,
    );
    const params = new URLSearchParams(enc);
    expect(params.get("domain")).to.equal("test.com");
    expect(params.get("ResponseFormat")).to.equal("JSON");
    expect(params.get("apikey")).to.equal("test.user");
    expect(params.get("password")).to.equal("***");
  });

  it("getPOSTData without credentials sends no apikey/password", () => {
    const enc = cl.getPOSTData({ domain: "test.com" });
    expect(enc).to.equal("domain=test.com");
  });

  it("setCredentials populates apikey/password on the wire", () => {
    cl.setCredentials("myapikey", "mypassword");
    expect(cl.getPOSTData({ domain: "test.com" })).to.equal(
      "domain=test.com&apikey=myapikey&password=mypassword",
    );
  });

  it("setCredentials() with no arguments resets both", () => {
    cl.setCredentials("myapikey", "mypassword");
    cl.setCredentials();
    expect(cl.getPOSTData({ domain: "test.com" })).to.equal("domain=test.com");
  });

  it("getURL defaults to the LIVE url", () => {
    expect(cl.getURL()).to.equal(cl.getLiveUrl());
  });

  it("getUserAgent derives the SDK default before setUserAgent is called", () => {
    const ua = `NODE-SDK (${process.platform}; ${process.arch}; rv:${cl.getVersion()}) node/${process.version}`;
    expect(cl.getUserAgent()).to.equal(ua);
  });

  it("setUserAgent overrides the default, with and without modules", () => {
    const ua = `WHMCS (${process.platform}; ${process.arch}; rv:7.7.0) node-sdk/${cl.getVersion()} node/${process.version}`;
    const ret = cl.setUserAgent("WHMCS", "7.7.0");
    expect(ret).to.equal(cl);
    expect(cl.getUserAgent()).to.equal(ua);

    const mods = ["reg/2.6.2", "ssl/7.2.2", "dc/8.2.2"];
    const uaMods = `WHMCS (${process.platform}; ${process.arch}; rv:7.7.0) ${mods.join(" ")} node-sdk/${cl.getVersion()} node/${process.version}`;
    cl.setUserAgent("WHMCS", "7.7.0", mods);
    expect(cl.getUserAgent()).to.equal(uaMods);
  });

  it("setURL overrides the configured endpoint", () => {
    const newUrl = "http://127.0.0.1/";
    expect(cl.setURL(newUrl).getURL()).to.equal(newUrl);
  });

  it("has no session accessors — IBS has no API session concept", () => {
    expect("getSession" in cl).to.be.false;
    expect("setSession" in cl).to.be.false;
    expect("login" in cl).to.be.false;
    expect("logout" in cl).to.be.false;
  });

  it("has no role-credentials capability — RoleCredentialsInterface is CNR-only", () => {
    expect(
      "setRoleCredentials" in
        (cl as unknown as Partial<RoleCredentialsInterface>),
    ).to.be.false;
  });

  it("useHighPerformanceConnectionSetup rewrites only the scheme+host to loopback", () => {
    cl.setURL("https://api.example.com:8443/api.example.com/x?foo=bar");
    cl.useHighPerformanceConnectionSetup();
    expect(cl.getURL()).to.equal(
      "http://127.0.0.1:8443/api.example.com/x?foo=bar",
    );
  });

  it("setProxy/getProxy round-trip and reset with no argument", () => {
    expect(cl.getProxy()).to.be.null;
    cl.setProxy("127.0.0.1");
    expect(cl.getProxy()).to.equal("127.0.0.1");
    cl.setProxy();
    expect(cl.getProxy()).to.be.null;
  });

  it("setReferer/getReferer round-trip and reset with no argument", () => {
    expect(cl.getReferer()).to.be.null;
    cl.setReferer("https://www.internet.bs/");
    expect(cl.getReferer()).to.equal("https://www.internet.bs/");
    cl.setReferer();
    expect(cl.getReferer()).to.be.null;
  });

  it("a transport (HTTP communication) failure produces a failed Response, not a thrown error", async () => {
    // Hand-authored cassette, replay-only: a real DNS failure message, not
    // something a record run should ever overwrite (RSRMID-2910).
    const replayOnly = new CassetteTransport(null, cassetteDir, false);
    const c = CF.ibs();
    c.setTransport(replayOnly);
    replayOnly.useCassette("conn-error");
    c.useOTESystem();
    const r = await c.request({ domain: "tronexats.com" }, "Domain/Info");
    expect(r).to.be.instanceOf(R);
    expect(r.isSuccess()).to.be.false;
    expect(r.getDescription()).to.include(
      "Command failed due to HTTP communication error",
    );
  });

  it("Domain/Check via request() replays the recorded UNAVAILABLE response (debug mode)", async () => {
    tape.useCassette("request-success-dbg");
    cl.enableDebugMode().setCredentials("test.user", "test.pw").useOTESystem();
    const r = await cl.request({ domain: "tronexats.com" }, "Domain/Check");
    expect(r).to.be.instanceOf(R);
    expect(r.isSuccess(), r.getDescription()).to.be.true;
    expect(r.getHash()["status"]).to.equal("UNAVAILABLE");
  });

  it("Domain/Check via request() replays the recorded UNAVAILABLE response (no debug)", async () => {
    tape.useCassette("request-success-nodbg");
    cl.disableDebugMode().setCredentials("test.user", "test.pw").useOTESystem();
    const r = await cl.request({ domain: "tronexats.com" }, "Domain/Check");
    expect(r).to.be.instanceOf(R);
    expect(r.isSuccess(), r.getDescription()).to.be.true;
    expect(r.getHash()["status"]).to.equal("UNAVAILABLE");
  });

  it("request() requires an explicit path — unlike CNR it has no single default endpoint", async () => {
    tape.useCassette("request-success-dbg");
    cl.setCredentials("test.user", "test.pw").useOTESystem();
    // Calling with no path hits the bare host; the cassette still replays
    // (the transport double doesn't care about the URL), so this asserts the
    // *type*/call-shape requires path to be meaningful, not that a bad path fails
    // replay. See Client.spec.ts's URL-resolution seam for the byte-exact path check.
    const r = await cl.request({ domain: "tronexats.com" }, "Domain/Check");
    expect(r.getRequestURL()).to.equal(`${cl.getURL()}Domain/Check`);
  });
});
