"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai = require("chai");
import "mocha";
import { SocketConfig } from "../src/socketconfig";
const expect = chai.expect;

describe("SocketConfig class", function () {
  this.slow(1000);

  describe("#.getPOSTData", () => {
    it("check return value [no settings made]", () => {
      const d = new SocketConfig().getPOSTData();
      expect(d).to.be.empty;
    });
  });
});
