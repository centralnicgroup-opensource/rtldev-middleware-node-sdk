import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import * as barrel from "../../src/index.ts";
import { CassetteTransport } from "../Support/CassetteTransport.ts";
import { SpyTransport } from "../Support/SpyTransport.ts";

/**
 * Provider response conformance — the structural half (RSRMID-2974 review,
 * §3.3A). What an MCP-style integration needs to know before it can build an
 * adapter over IBS's Domain/Check: that every provider outcome is reachable
 * through the *public* surface, and that a malformed/missing wire shape has
 * a defined answer rather than an undefined one.
 *
 * Directive: `IBS.Client.request()` is the only sanctioned way in; every
 * outcome an adapter needs to branch on — AVAILABLE, UNAVAILABLE, FAILURE, a
 * malformed or missing response — must be distinguishable through
 * `ResponseInterface`'s public methods (`isSuccess()`/`isError()`/
 * `getCode()`/`getHash()`), never by parsing `getPlain()`'s raw wire text.
 *
 * Failure mode prevented: an adapter written against `getPlain()` string
 * matching (because some outcome *looked* unreachable through the typed
 * API) breaks the moment the wire format's whitespace or key order changes,
 * even though nothing about the actual status changed. This file is the
 * check that no such workaround is ever necessary.
 *
 * Why structural: every case here can be constructed by hand — no live
 * traffic is needed to prove a *shape* is reachable through the API, only
 * to prove a *specific provider* actually emits that shape. AVAILABLE and
 * FAILURE below are hand-authored (real captures are blocked — IBS OT&E
 * currently answers every check with error 107015 — and a hand-authored
 * fixture is the sanctioned stand-in for a structural check like this one,
 * never a substitute for the real-traffic conformance work §3.3A still
 * needs). UNAVAILABLE uses the one real capture this repo has
 * (`tests/IBS/cassettes/request-success-{dbg,nodbg}.json`).
 *
 * Revisit condition: once a real AVAILABLE/FAILURE capture exists, this file's
 * hand-authored fixtures for those two should be replaced by (or checked
 * against) it — this guard proves the *shape* is reachable, not that this
 * exact payload is what the live provider actually sends.
 */
describe("Seam: IBS provider response conformance (structural)", () => {
  const AVAILABLE_JSON =
    '{"transactid":"seam-avail","status":"AVAILABLE","domain":"seam-free-example.com","price":{"ispremium":"NO"}}';
  const FAILURE_JSON =
    '{"transactid":"seam-fail","status":"FAILURE","message":"Invalid domain name."}';

  it("an operation is sendable through the public request() — no lower-level API needed", async () => {
    const spy = new SpyTransport(AVAILABLE_JSON);
    const cl = CF.ibs().setTransport(spy).useOTESystem();

    const r = await cl.request(
      { domain: "seam-free-example.com" },
      "Domain/Check",
    );

    expect(spy.url).to.include("Domain/Check");
    expect(r).to.not.be.null;
  });

  describe("AVAILABLE / UNAVAILABLE / FAILURE remain distinguishable through request()", () => {
    it("AVAILABLE (hand-authored — no real capture exists yet)", async () => {
      const cl = CF.ibs()
        .setTransport(new SpyTransport(AVAILABLE_JSON))
        .useOTESystem();
      const r = await cl.request({}, "Domain/Check");

      expect(r.isSuccess()).to.be.true;
      expect(r.isError()).to.be.false;
      expect(r.getHash()["status"]).to.equal("AVAILABLE");
    });

    it("UNAVAILABLE (real capture, replayed via the committed cassette)", async () => {
      const cassetteDir = new URL("../IBS/cassettes", import.meta.url).pathname;
      const tape = new CassetteTransport(null, cassetteDir, false);
      tape.useCassette("request-success-nodbg");
      const cl = CF.ibs().setTransport(tape).useOTESystem();
      const r = await cl.request({}, "Domain/Check");

      expect(r.isSuccess()).to.be.true;
      expect(r.isError()).to.be.false;
      expect(r.getHash()["status"]).to.equal("UNAVAILABLE");
    });

    it("FAILURE (hand-authored — no real capture exists yet)", async () => {
      const cl = CF.ibs()
        .setTransport(new SpyTransport(FAILURE_JSON))
        .useOTESystem();
      const r = await cl.request({}, "Domain/Check");

      expect(r.isSuccess()).to.be.false;
      expect(r.isError()).to.be.true;
      expect(r.getHash()["status"]).to.equal("FAILURE");
    });
  });

  it("the response code is reachable through getCode() alone — getPlain() is never consulted", async () => {
    const available = await CF.ibs()
      .setTransport(new SpyTransport(AVAILABLE_JSON))
      .useOTESystem()
      .request({}, "Domain/Check");
    const failure = await CF.ibs()
      .setTransport(new SpyTransport(FAILURE_JSON))
      .useOTESystem()
      .request({}, "Domain/Check");

    // getCode() only, deliberately — see the file header. Neither branch
    // touches getPlain() to work out what happened.
    expect(available.getCode()).to.equal(200);
    expect(failure.getCode()).to.equal(500);
  });

  it("required fields are reachable through getHash(), not by parsing the raw response", async () => {
    const cl = CF.ibs()
      .setTransport(new SpyTransport(AVAILABLE_JSON))
      .useOTESystem();
    const r = await cl.request({}, "Domain/Check");
    const hash = r.getHash();

    expect(hash["domain"]).to.equal("seam-free-example.com");
    expect(hash["transactid"]).to.equal("seam-avail");
    expect((hash["price"] as { ispremium: string })["ispremium"]).to.equal(
      "NO",
    );
  });

  describe("malformed/missing responses produce a documented, non-throwing outcome", () => {
    const cases: [string, string][] = [
      ["garbage, not JSON at all", "this is not json at all"],
      ["empty body", ""],
      [
        "syntactically valid JSON missing the status field entirely",
        '{"transactid":"x","domain":"foo.com"}',
      ],
    ];

    for (const [label, raw] of cases) {
      it(`${label} → isError() true, getCode() 500, never throws`, async () => {
        const cl = CF.ibs().setTransport(new SpyTransport(raw)).useOTESystem();

        const r = await cl.request({}, "Domain/Check");

        expect(r.isError(), "must be reported as an error, not a success").to.be
          .true;
        expect(r.isSuccess()).to.be.false;
        expect(
          r.getCode(),
          "IBS has no top-level/nested code on this shape, so getCode() derives it from isSuccess() — 500 for the error case",
        ).to.equal(500);
      });
    }
  });

  it("the raw provider response type is reachable from the root barrel, not only from a deep import", () => {
    expect(barrel.IBS.Response).to.be.a("function");
    const r = new barrel.IBS.Response(AVAILABLE_JSON, {
      ResponseFormat: "JSON",
    });
    // Constructed entirely through the barrel's namespaced export; still a
    // full ResponseInterface — no cast, no reach into src/ by relative path.
    expect(r.isSuccess()).to.be.true;
    expect(r.getHash()["status"]).to.equal("AVAILABLE");
  });
});
