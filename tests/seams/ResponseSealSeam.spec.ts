import { expect } from "chai";
import "mocha";
import { Response as CNRResponse } from "../../src/CNR/Response.ts";
import { Response as IBSResponse } from "../../src/IBS/Response.ts";
import { ResponseTemplateManager as CNRTemplates } from "../../src/CNR/ResponseTemplateManager.ts";
import type { RecordInterface } from "../../src/RecordInterface.ts";
import type { ResponseInterface } from "../../src/ResponseInterface.ts";

/**
 * Directive: a `Response` is fully assembled by its constructor and read-only
 * afterwards. `ResponseInterface` declares no mutator and no record cursor;
 * rows are walked with `for…of` through `[Symbol.iterator]()`. Six methods
 * came off the interface — `addColumn()`, `addRecord()`, `getCurrentRecord()`,
 * `getNextRecord()`, `getPreviousRecord()`, `rewindRecordList()` — and must
 * not come back.
 *
 * Failure mode prevented: the cursor four were hidden mutable state shared by
 * every holder of the response — one consumer's `getNextRecord()` advanced the
 * position another consumer was about to read, and nothing in either call site
 * revealed the coupling. The mutator two let a response be edited after the
 * constructor had already derived the column list, the record list and the
 * pagination numbers from it, so the object could be left describing a shape
 * it no longer held. Re-adding any of the six as a *convenience* — "just for
 * tests", "just internally" — restores exactly the state this seals off.
 *
 * Why structural: re-adding a method is behaviour-preserving on the day it
 * lands. Nothing existing calls it, every current test keeps passing, and the
 * damage only appears later when a second consumer starts using it against a
 * response someone else is also holding. No behavioural test can catch the
 * addition; only reflecting over the public surface can refuse it on arrival.
 *
 * Revisit condition: none expected. If streaming assembly of very large lists
 * ever becomes a real requirement, that is a different type with its own
 * contract — not a mutator bolted back onto the sealed one.
 *
 * Non-vacuity: change `AbstractResponse.addRecord()` from `protected` to
 * `public`, or add any of the four cursor methods to a brand `Response`, and
 * the second test below fails. Verified by applying exactly that mutation.
 *
 * PHP parity: `tests/ResponseSealSeamTest.php`. The `protected`-stays-protected
 * half is checked differently: TypeScript erases `protected` at runtime, so
 * where PHP reflects over the modifier this uses a `@ts-expect-error` line,
 * which fails `pnpm run typecheck` as an unused directive the moment the
 * method is widened to public.
 */
describe("Seam: a Response is sealed by its constructor", () => {
  // Only the cursor four are checkable by reflection. `addColumn()`/
  // `addRecord()` still exist as `protected` members — each brand's
  // `populate()` is their one caller — and TypeScript erases `protected` at
  // runtime, so they answer to `typeof r[name] === "function"` exactly as a
  // public method would. Their half of this seam is the `@ts-expect-error`
  // block below, which is where the guarantee actually lives; asserting their
  // runtime absence would fail against correct code, which is how this list
  // was found to be wrong in the first place.
  const CURSOR_METHODS = [
    "getCurrentRecord",
    "getNextRecord",
    "getPreviousRecord",
    "rewindRecordList",
  ];

  const responses: [string, () => ResponseInterface][] = [
    [
      "CNR",
      () =>
        new CNRResponse(
          "[RESPONSE]\r\ncode=200\r\ndescription=Command completed successfully\r\n" +
            "property[domain][0]=a.com\r\nproperty[domain][1]=b.com\r\nEOF\r\n",
        ),
    ],
    [
      "IBS",
      () =>
        new IBSResponse(
          '{"status":"SUCCESS","domain":["a.com","b.com"],"transactid":"t1"}',
          // ResponseFormat=JSON is what IBS.Client.buildCommand() injects on
          // every request; without it the parser takes its plain-text branch
          // and this JSON body yields no columns at all.
          { Command: "Domain/List", ResponseFormat: "JSON" },
        ),
    ],
  ];

  for (const [name, make] of responses) {
    it(`${name}.Response has no record cursor, by any route`, () => {
      const r = make() as unknown as { [key: string]: unknown };
      for (const method of CURSOR_METHODS) {
        expect(
          method in r,
          `${name}.Response must not expose "${method}" — the cursor was hidden mutable state shared by ` +
            "every holder of the response. Rows are walked with for…of.",
        ).to.be.false;
      }
    });

    it(`${name}.Response iterates its records, freshly on every call`, () => {
      const r = make();

      const first = [...r].map((rec: RecordInterface) =>
        rec.getStringByKey(name === "CNR" ? "DOMAIN" : "domain"),
      );
      const second = [...r].map((rec: RecordInterface) =>
        rec.getStringByKey(name === "CNR" ? "DOMAIN" : "domain"),
      );

      expect(first).to.deep.equal(["a.com", "b.com"]);
      expect(
        second,
        "a second walk must see the same rows — a one-shot iterator field would return [] here, " +
          "which is why [Symbol.iterator]() is a generator",
      ).to.deep.equal(first);
    });
  }

  it("the sealed-off names are absent from the interface too, not just the classes", () => {
    // The classes are what a consumer holds, but the interface is what the
    // contract promises. A method re-added to only one of the two is the
    // halfway state that makes re-adding it to the other look consistent.
    const r: ResponseInterface = new CNRResponse(
      "empty",
      {},
      {},
      {},
      null,
      null,
      new CNRTemplates(),
    );

    // @ts-expect-error — addRecord() is protected on AbstractResponse and absent from ResponseInterface.
    void r.addRecord;
    // @ts-expect-error — addColumn() is protected on each brand Response, called only by its populate().
    void r.addColumn;
    // @ts-expect-error — the record cursor was removed; iterate with for…of instead.
    void r.getNextRecord;
    // @ts-expect-error — same, and rewinding is meaningless once iteration is a fresh generator.
    void r.rewindRecordList;
  });

  it("assembly happens once — the record list is not doubled by a second read", () => {
    const r = new CNRResponse(
      "[RESPONSE]\r\ncode=200\r\ndescription=Command completed successfully\r\n" +
        "property[domain][0]=a.com\r\nproperty[domain][1]=b.com\r\nEOF\r\n",
    );

    expect(r.getRecordsCount()).to.equal(2);
    void [...r];
    void r.getRecords();
    expect(
      r.getRecordsCount(),
      "reading the records must not re-run assembly",
    ).to.equal(2);
  });
});
