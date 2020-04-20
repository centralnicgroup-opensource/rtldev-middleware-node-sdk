"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai = require("chai");
import "mocha";
import { ResponseParser } from "../src/responseparser";
import { ResponseTemplateManager } from "../src/responsetemplatemanager";

const expect = chai.expect;
const rtm = ResponseTemplateManager.getInstance();

before(() => {
  rtm.addTemplate("OK", rtm.generateTemplate("200", "Command completed successfully"));
});

describe("ResponseParser namespace", function () {
  this.slow(1000);

  describe("#.serialize", () => {
    it("check return value [w/ PROPERTY]", () => {
      const r = rtm.getTemplate("OK").getHash();
      r.PROPERTY = {
        DOMAIN: ["mydomain1.com", "mydomain2.com", "mydomain3.com"],
        RATING: ["1", "2", "3"],
        SUM: [3],
      };
      expect(ResponseParser.serialize(r)).to.equal("[RESPONSE]\r\nPROPERTY[DOMAIN][0]=mydomain1.com\r\nPROPERTY[DOMAIN][1]=mydomain2.com\r\nPROPERTY[DOMAIN][2]=mydomain3.com\r\nPROPERTY[RATING][0]=1\r\nPROPERTY[RATING][1]=2\r\nPROPERTY[RATING][2]=3\r\nPROPERTY[SUM][0]=3\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nEOF\r\n");
    });

    it("check return value [w/o PROPERTY]", () => {
      const tpl = rtm.getTemplate("OK");
      expect(ResponseParser.serialize(tpl.getHash())).to.equal(tpl.getPlain());
    });

    it("check return value [w/o CODE, w/o DESCRIPTION]", () => {
      // this case shouldn"t happen, otherwise we have an API-side issue
      const h = rtm.getTemplate("OK").getHash();
      delete h.CODE;
      delete h.DESCRIPTION;
      expect(ResponseParser.serialize(h)).to.equal("[RESPONSE]\r\nEOF\r\n");
    });

    it("check return value [w/ QUEUETIME, w/ RUNTIME]", () => {
      const h = rtm.getTemplate("OK").getHash();
      h.QUEUETIME = "0";
      h.RUNTIME = "0.12";
      expect(ResponseParser.serialize(h)).to.equal("[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nQUEUETIME=0\r\nRUNTIME=0.12\r\nEOF\r\n");
    });
  });
});
