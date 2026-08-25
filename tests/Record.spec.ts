import { expect } from "chai";
import "mocha";
import { Record } from "../src/Record.ts";

/**
 * Record — one shared implementation, no brand subclass, no generic type
 * parameter (decision 11).
 */
describe("Record", () => {
  it("getData() returns the constructor's hash", () => {
    const rec = new Record({ DOMAIN: "a.com", COUNT: 3 });
    expect(rec.getData()).to.deep.equal({ DOMAIN: "a.com", COUNT: 3 });
  });

  describe("getDataByKey()", () => {
    it("returns the raw value for a present key, including non-string values", () => {
      const rec = new Record({ DOMAIN: "a.com", NESTED: { x: 1 } });
      expect(rec.getDataByKey("DOMAIN")).to.equal("a.com");
      expect(rec.getDataByKey("NESTED")).to.deep.equal({ x: 1 });
    });

    it("returns null for a missing key", () => {
      expect(new Record({ DOMAIN: "a.com" }).getDataByKey("MISSING")).to.be
        .null;
    });
  });

  describe("getStringByKey()", () => {
    it("returns the value when it is a string", () => {
      expect(new Record({ DOMAIN: "a.com" }).getStringByKey("DOMAIN")).to.equal(
        "a.com",
      );
    });

    it("returns null for a non-string value or a missing key", () => {
      const rec = new Record({ NESTED: { x: 1 } });
      expect(rec.getStringByKey("NESTED")).to.be.null;
      expect(rec.getStringByKey("MISSING")).to.be.null;
    });
  });

  describe("getDateTimeByKey()", () => {
    it("parses a string value as an ApiDateTime", () => {
      const rec = new Record({ EXPIRATIONDATE: "2030/07/17" });
      expect(rec.getDateTimeByKey("EXPIRATIONDATE")?.date).to.equal(
        "2030-07-17",
      );
    });

    it("returns null for a non-string value, an unparsable string, or a missing key", () => {
      const rec = new Record({ NESTED: { x: 1 }, GARBAGE: "not a date" });
      expect(rec.getDateTimeByKey("NESTED")).to.be.null;
      expect(rec.getDateTimeByKey("GARBAGE")).to.be.null;
      expect(rec.getDateTimeByKey("MISSING")).to.be.null;
    });
  });

  // PHP's identical `return $this->data;` is safe because PHP arrays are
  // copy-on-write value types; JS objects are references, so the same code
  // would return the live internal state.
  it("mutating the object from getData() does not change the record's own data", () => {
    const rec = new Record({ DOMAIN: "a.com" });
    const data = rec.getData();
    data["DOMAIN"] = "phantom.com";
    data["EXTRA"] = "injected";
    expect(rec.getDataByKey("DOMAIN")).to.equal("a.com");
    expect(rec.getDataByKey("EXTRA")).to.be.null;
  });
});
