import { expect } from "chai";
import "mocha";
import { Column } from "../src/column.js";

let col: Column;

before(() => {
  col = new Column("DOMAIN", [
    "mydomain1.com",
    "mydomain2.com",
    "mydomain3.com",
  ]);
});

describe("Column class", function () {
  this.slow(1000);

  describe("#.getKey", () => {
    it("check return value", () => {
      expect(col.getKey()).to.equal("DOMAIN");
    });
  });
});
