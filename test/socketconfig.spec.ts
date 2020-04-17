"use strict";

import chai = require("chai");
import dirtyChai = require("dirty-chai");
import "mocha";
import { SocketConfig } from "../src/socketconfig";
chai.use(dirtyChai);
const expect = chai.expect;

describe("SocketConfig class", function () {
  this.slow(1000);

  describe("#.getPOSTData", () => {
    it("check return value [no settings made]", () => {
      const d = new SocketConfig().getPOSTData();
      expect(d).to.be.empty();
    });
  });
});
