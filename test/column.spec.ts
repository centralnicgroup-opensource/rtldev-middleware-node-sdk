"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai = require("chai");
import "mocha";
import { Column } from "../src/column";
const expect = chai.expect;

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
