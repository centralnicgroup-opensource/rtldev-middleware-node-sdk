import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { UnsupportedFeatureException } from "../../src/Exception/UnsupportedFeatureException.ts";
import { HttpTransport } from "../../src/HttpTransport.ts";
import { SpyTransport } from "../Support/SpyTransport.ts";
import type {
  TransportInterface,
  TransportOptions,
} from "../../src/TransportInterface.ts";

/**
 * Directive: the request() lifecycle must run against any TransportInterface,
 * not only the hard-wired HttpTransport, so it is exercisable offline
 * (RSRMID-2910). Verified without a network: a canned in-memory transport is
 * injected and its bytes are asserted to flow back through the brand's
 * translate()/newResponse() pipeline.
 *
 * Failure mode prevented: without this seam, offline testing of request()
 * would require mocking `fetch` globally (nock-level), which cannot assert
 * what the *client* handed the transport (timeout, options, the encoded
 * body) independently of what HttpTransport does with it. SpyTransport
 * exists precisely to split those two concerns; this file's
 * `TheBytesOnTheWireAreWhatGetPostDataProduced` test is what would have
 * caught B2 (setProxy/setReferer stored correctly but never reaching
 * `post()`) had it existed before that regression shipped.
 *
 * Revisit condition: none expected — this is a foundational seam.
 */
describe("Seam: transport injection", () => {
  it("the default transport is a real HttpTransport", () => {
    expect(CF.cnr().getTransport()).to.be.instanceOf(HttpTransport);
    expect(CF.ibs().getTransport()).to.be.instanceOf(HttpTransport);
    expect(CF.moniker().getTransport()).to.be.instanceOf(HttpTransport);
  });

  it("setTransport() is fluent and readable back via getTransport()", () => {
    const cl = CF.cnr();
    const spy = new SpyTransport();
    expect(cl.setTransport(spy)).to.equal(cl);
    expect(cl.getTransport()).to.equal(spy);
  });

  it("the bytes handed to the transport are exactly what getPOSTData() produces for the same command", async () => {
    const cl = CF.cnr();
    cl.setCredentials("test.user", "test.pw");
    const spy = new SpyTransport();
    cl.setTransport(spy).useOTESystem();

    await cl.request({ COMMAND: "StatusAccount" });

    expect(spy.data).to.equal(cl.getPOSTData({ COMMAND: "StatusAccount" }));
    // Unmasked: masking is for the debug log, never for the wire.
    expect(spy.data).to.include("test.pw");
  });

  it("AbstractClient.close() delegates to the injected transport", async () => {
    const spy = new SpyTransport();
    const cl = CF.cnr().setTransport(spy);
    expect(spy.closed).to.be.false;

    await cl.close();

    expect(spy.closed).to.be.true;
  });

  it("close() is idempotent — three consecutive calls on a fresh client, no request ever made, all resolve without throwing", async () => {
    const cl = CF.cnr();
    await cl.close();
    await cl.close();
    await cl.close();
  });

  it("a bespoke TransportInterface drives the full request() lifecycle end to end", async () => {
    const fake: TransportInterface = {
      async post(): Promise<[string, string | null]> {
        const raw =
          "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\n" +
          "PROPERTY[DOMAINCHECK][0]=210 Domain name is available\r\nQUEUETIME=0\r\nRUNTIME=0.1\r\nEOF\r\n";
        return [raw, null];
      },
      async close(): Promise<void> {},
    };

    const cl = CF.cnr();
    expect(cl.setTransport(fake)).to.equal(cl, "setTransport() must be fluent");
    cl.useOTESystem();

    const r = await cl.request({
      COMMAND: "CheckDomains",
      DOMAIN: ["example.com"],
    });
    expect(r.isSuccess()).to.be.true;
    expect(r.getCode()).to.equal(200);
    expect(r.getColumn("DOMAINCHECK")).to.not.be.null;
  });

  it("a transport error discards parseable bytes — [1] !== null means [0] is unusable", async () => {
    // Against the TransportInterface contract's spirit but not forbidden by
    // the type system: a transport returning real bytes AND an error. The
    // httperror template must still win.
    const fake: TransportInterface = {
      async post(): Promise<[string, string | null]> {
        return [
          "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nEOF\r\n",
          "Could not resolve host: example.invalid",
        ];
      },
      async close(): Promise<void> {},
    };

    const cl = CF.cnr().setTransport(fake).useOTESystem();
    const r = await cl.request({ COMMAND: "StatusAccount" });

    expect(r.getCode()).to.equal(421);
    expect(r.getDescription()).to.include(
      "Could not resolve host: example.invalid",
    );
  });

  it("MANAGED/PROTECTED keys are refused by HttpTransport even for a plain-JS caller bypassing the type system", async () => {
    const transport = new HttpTransport();
    for (const key of ["signal", "method", "body"] as const) {
      const options = { [key]: undefined } as unknown as TransportOptions;
      let threw = false;
      try {
        await transport.post("https://example.test/", "", 1, "ua", options);
      } catch (err) {
        threw = true;
        expect(err).to.be.instanceOf(UnsupportedFeatureException);
        expect(
          (err as UnsupportedFeatureException).getRejectedOption(),
        ).to.equal(key);
      }
      expect(threw, `HttpTransport must reject the "${key}" option`).to.be.true;
    }
  });
});
