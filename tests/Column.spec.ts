import { expect } from "chai";
import "mocha";
import { Column } from "../src/Column.ts";

/**
 * Column — one shared implementation, no brand subclass, no generic type
 * parameter (decision 11). Value-type narrowing lives in getStringByIndex()/
 * getDateTimeByIndex(). The old suite covered only getKey(); this fills in
 * the rest of the surface.
 */
describe("Column", () => {
  it("getKey()/getData()/getLength() reflect the constructor arguments", () => {
    const col = new Column("DOMAIN", ["a.com", "b.com"]);
    expect(col.getKey()).to.equal("DOMAIN");
    expect(col.getData()).to.deep.equal(["a.com", "b.com"]);
    expect(col.getLength()).to.equal(2);
  });

  describe("getDataByIndex()", () => {
    it("returns the raw value in range, including non-string values", () => {
      const col = new Column("META", [{ nested: true }, 42, null]);
      expect(col.getDataByIndex(0)).to.deep.equal({ nested: true });
      expect(col.getDataByIndex(1)).to.equal(42);
      expect(col.getDataByIndex(2)).to.be.null;
    });

    it("returns null for an out-of-range index, negative or too large", () => {
      const col = new Column("DOMAIN", ["a.com"]);
      expect(col.getDataByIndex(-1)).to.be.null;
      expect(col.getDataByIndex(1)).to.be.null;
    });
  });

  describe("getStringByIndex()", () => {
    it("returns the value when it is a string", () => {
      expect(new Column("DOMAIN", ["a.com"]).getStringByIndex(0)).to.equal(
        "a.com",
      );
    });

    it("returns null for a non-string value or an out-of-range index", () => {
      const col = new Column("META", [{ nested: true }]);
      expect(col.getStringByIndex(0)).to.be.null;
      expect(col.getStringByIndex(5)).to.be.null;
    });
  });

  describe("getDateTimeByIndex()", () => {
    it("parses a string cell as an ApiDateTime", () => {
      const col = new Column("EXPIRATIONDATE", ["2030/07/17"]);
      expect(col.getDateTimeByIndex(0)?.date).to.equal("2030-07-17");
    });

    it("returns null for a non-string value, an unparsable string, or an out-of-range index", () => {
      const col = new Column("MIXED", [{ nested: true }, "not a date"]);
      expect(col.getDateTimeByIndex(0)).to.be.null;
      expect(col.getDateTimeByIndex(1)).to.be.null;
      expect(col.getDateTimeByIndex(9)).to.be.null;
    });
  });

  // PHP's identical `return $this->data;` is safe because PHP arrays are
  // copy-on-write value types; JS arrays are references, so the same code
  // would return the live internal state.
  it("mutating the array from getData() does not change the column's own data", () => {
    const col = new Column("DOMAIN", ["a.com"]);
    const data = col.getData();
    data.push("phantom.com");
    expect(col.getData()).to.deep.equal(["a.com"]);
    expect(col.getLength()).to.equal(1);
  });
});
