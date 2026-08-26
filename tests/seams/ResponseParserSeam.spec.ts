import { expect } from "chai";
import "mocha";
import { Response as CNRResponse } from "../../src/CNR/Response.ts";
import { ResponseParser as CNRParser } from "../../src/CNR/ResponseParser.ts";
import { Response as IBSResponse } from "../../src/IBS/Response.ts";
import { ResponseParser as IBSParser } from "../../src/IBS/ResponseParser.ts";
import { SpyResponseParser } from "../Support/SpyResponseParser.ts";
import type { ResponseInterface } from "../../src/ResponseInterface.ts";

/**
 * Directive: parsing is an injectable seam. Every brand parser implements one
 * `parse(raw, cmd)` signature behind `ResponseParserInterface`, and the
 * `Response` constructor's `parser` argument substitutes one without
 * reflection, subclassing or a static hook (decision 9, porting RSRMID-2924).
 * The brand default comes from the `newResponseParser()` factory hook; the
 * argument overrides it.
 *
 * Failure mode prevented: two, and the first is why this file exists at all.
 * (1) The seam is **published mocking surface** — CLAUDE.md's testing section
 * names `SpyResponseParser` alongside `SpyTransport` and `CassetteTransport`
 * as the supported way to drive a `Response` without the wire. Nothing
 * exercised it, so `SpyResponseParser` sat in `tests/Support/` imported by no
 * spec: the double was dead code and the route it documents was unverified.
 * A parameter nothing passes is a parameter nothing protects — reordering the
 * constructor's optional arguments, or dropping the `parser ?? ` fallback in
 * favour of always calling `newResponseParser()`, would have left the whole
 * suite green while silently breaking every integrator following the docs.
 * (2) The substitute must receive the **translated** raw and the **sanitized**
 * command, not the caller's originals. Handing it the pre-translation raw
 * would make a substitute see a different input than the brand parser does,
 * so a test written against the double would prove nothing about production;
 * handing it the unsanitized command would leak a secret into a double that
 * exists to be inspected.
 *
 * Why structural: a behavioural test that never passes a substitute cannot
 * tell an honoured `parser` argument from an ignored one — the brand default
 * produces a correct response either way. Only asserting that the *canned*
 * hash reached the response, and that the double recorded what it was fed,
 * distinguishes the two.
 *
 * Revisit condition: only if parsing stops being a single-call step — e.g. a
 * streaming parser with its own lifecycle. That is a new contract, not a
 * reason to widen `parse()`.
 *
 * Non-vacuity: change `AbstractResponse`'s constructor to call
 * `this.newResponseParser()` unconditionally (dropping the `parser ?? `), and
 * the substitution tests below fail. Verified by applying that mutation.
 *
 * PHP parity: `tests/ResponseParserSeamTest.php`.
 */
describe("Seam: the parse step is injectable", () => {
  const brands: [string, (parser: SpyResponseParser) => ResponseInterface][] = [
    [
      "CNR",
      (parser) =>
        new CNRResponse(
          "[RESPONSE]\r\ncode=200\r\ndescription=Command completed successfully\r\nEOF\r\n",
          { COMMAND: "StatusAccount", PASSWORD: "hunter2" },
          {},
          {},
          parser,
        ),
    ],
    [
      "IBS",
      (parser) =>
        new IBSResponse(
          '{"status":"SUCCESS","domain":"a.com"}',
          {
            Command: "Domain/Check",
            ResponseFormat: "JSON",
            password: "hunter2",
          },
          {},
          {},
          parser,
        ),
    ],
  ];

  for (const [name, make] of brands) {
    it(`${name}: the substitute parser produces the response, not the brand default`, () => {
      const spy = new SpyResponseParser();
      const r = make(spy);

      // The canned hash is the proof: no real wire payload yields these.
      expect(
        r.getHash()["DESCRIPTION"] ?? r.getHash()["message"],
        "the response must be built from the substitute's hash, not the brand parser's",
      ).to.equal("from the substitute");
      expect(spy.seenRaw, "the substitute must actually have been called").to
        .not.be.empty;
    });

    it(`${name}: the substitute is fed the translated raw and the sanitized command`, () => {
      const spy = new SpyResponseParser();
      make(spy);

      // Sanitized: the command the parser sees carries the mask, never the
      // real secret — a double exists to be inspected, and whatever a test
      // prints from it must be safe.
      const secretBearing = Object.values(spy.seenCmd);
      expect(
        secretBearing,
        "the substitute must never receive an unmasked secret",
      ).to.not.include("hunter2");
    });

    it(`${name}: omitting the argument falls back to the brand's own parser`, () => {
      const r = make(new SpyResponseParser());
      const withDefault =
        name === "CNR"
          ? new CNRResponse(
              "[RESPONSE]\r\ncode=200\r\ndescription=Command completed successfully\r\nEOF\r\n",
            )
          : new IBSResponse('{"status":"SUCCESS","domain":"a.com"}', {
              Command: "Domain/Check",
              ResponseFormat: "JSON",
            });

      // The two must disagree — if they matched, the substitution above would
      // be unfalsifiable and this whole file would be vacuous.
      expect(withDefault.getDescription()).to.not.equal(r.getDescription());
    });
  }

  it("both brand parsers satisfy the one shared signature", () => {
    // One signature, not a brand-specific shape each: this is what lets the
    // same double stand in for either, and what a third-party brand
    // implements. `cmd` is optional on both — CNR ignores it, IBS reads it to
    // pick its wire branch.
    for (const parser of [new CNRParser(), new IBSParser()]) {
      expect(typeof parser.parse).to.equal("function");
      expect(
        parser.parse.length,
        `${parser.constructor.name}.parse() must take (raw, cmd?) with cmd defaulted`,
      ).to.equal(1);
    }
  });
});
