import { expect } from "chai";
import "mocha";
import { Record } from "../src/record.js";

let rec: Record;
const data: any = {
  DOMAIN: "mydomain.com",
  RATING: "1",
  RNDINT: "321",
  SUM: "1",
};

before(() => {
  rec = new Record(data);
});

describe("Record class", function () {
  this.slow(1000);

  describe("#.getData", () => {
    it("check return value", () => {
      expect(rec.getData()).to.equal(data);
    });
  });

  describe("#.getDataByKey", () => {
    it("check return value [column key not found]", () => {
      expect(rec.getDataByKey("KEYNOTEXISTING")).to.be.null;
    });
  });
});
