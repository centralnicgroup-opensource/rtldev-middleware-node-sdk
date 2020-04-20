"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai = require("chai");
import "mocha";
import { Response } from "../src/response";
import { ResponseParser } from "../src/responseparser";
import { ResponseTemplateManager } from "../src/responsetemplatemanager";

const expect = chai.expect;
const rtm = ResponseTemplateManager.getInstance();
const cmd = { COMMAND: "StatusContact" };

before(() => {
  rtm.addTemplate("listP0", "[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[DOMAIN][1]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n")
    .addTemplate("OK", rtm.generateTemplate("200", "Command completed successfully"));
});

describe("Response class", function () {
  this.slow(1000);

  describe("constructor", () => {
    it("check place holder vars replacment", () => {
      // ensure no vars are returned in response, just in case no place holder replacements are provided
      let r = new Response("", cmd);
      expect(/\{[A-Z_]+\}/.test(r.getDescription())).to.be.false;

      // ensure variable replacements are correctly handled in case place holder replacements are provided
      r = new Response("", { COMMAND: "StatusAccount" }, { CONNECTION_URL: "123HXPHFOUND123" });
      expect(/123HXPHFOUND123/.test(r.getDescription())).to.be.true;
    });
  });

  describe("#.getCommandPlain", () => {
    it("check flattening of command works", () => {
      const r = new Response("", { COMMAND: "QueryDomainOptions", DOMAIN0: "example.com", DOMAIN1: "example.net" });
      const expected = "COMMAND = QueryDomainOptions\nDOMAIN0 = example.com\nDOMAIN1 = example.net\n";
      expect(r.getCommandPlain()).to.equal(expected);
    });

    it("check data being returned secure", () => {
      const r = new Response("", { COMMAND: "CheckAuthentication", SUBUSER: "test.user", PASSWORD: "test.passw0rd" });
      const expected = "COMMAND = CheckAuthentication\nSUBUSER = test.user\nPASSWORD = ***\n";
      expect(r.getCommandPlain()).to.equal(expected);
    });
  });

  describe("#.getCurrentPageNumber", () => {
    it("check return value [w/ entries in response]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      expect(r.getCurrentPageNumber()).to.equal(1);
    });

    it("check return value [w/o entries in response]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getCurrentPageNumber()).to.equal(null);
    });
  });

  describe("#.getFirstRecordIndex", () => {
    it("check return value [w/o FIRST in response, no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getFirstRecordIndex()).to.equal(null);
    });

    it("check return value [w/o FIRST in response, rows]", () => {
      const h = rtm.getTemplate("OK").getHash();
      h.PROPERTY = {
        DOMAIN: ["mydomain1.com", "mydomain2.com"],
      };
      const r = new Response(ResponseParser.serialize(h), cmd);
      expect(r.getFirstRecordIndex()).to.equal(0);
    });
  });

  describe("#.getColumns", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const cols = r.getColumns();
      expect(cols.length).to.equal(6);
    });
  });

  describe("#.getColumnIndex", () => {
    it("check return value [colum exists]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const data = r.getColumnIndex("DOMAIN", 0);
      expect(data).to.equal("0-60motorcycletimes.com");
    });

    it("check return value [colum does not exist]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const data = r.getColumnIndex("COLUMN_NOT_EXISTS", 0);
      expect(data).to.be.null;
    });
  });

  describe("#.getColumnKeys", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const colkeys = r.getColumnKeys();
      expect(colkeys.length).to.equal(6);
      expect(colkeys).to.include.members(["COUNT", "DOMAIN", "FIRST", "LAST", "LIMIT", "TOTAL"]);
    });
  });

  describe("#.getCurrentRecord", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const rec = r.getCurrentRecord();
      expect(rec).not.to.be.null;
      if (rec) {
        expect(rec.getData()).to.eql({
          COUNT: "2",
          DOMAIN: "0-60motorcycletimes.com",
          FIRST: "0",
          LAST: "1",
          LIMIT: "2",
          TOTAL: "2701",
        });
      }
    });

    it("check return value [no records available]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getCurrentRecord()).to.be.null;
    });
  });

  describe("#.getListHash", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const lh = r.getListHash();
      expect(lh.LIST.length).to.equal(2);
      expect(lh.meta.columns).to.eql(r.getColumnKeys());
      expect(lh.meta.pg).to.eql(r.getPagination());
    });
  });

  describe("#.getNextRecord", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      let rec = r.getNextRecord();
      expect(rec).not.to.be.null;
      if (rec) {
        expect(rec.getData()).to.eql({ DOMAIN: "0-be-s01-0.com" });
      }
      rec = r.getNextRecord();
      expect(rec).to.be.null;
    });
  });

  describe("#.getPagination", () => {
    it("check return value [next record]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const pager = r.getPagination();
      expect(pager).to.have.all.keys(["COUNT", "CURRENTPAGE", "FIRST", "LAST", "LIMIT", "NEXTPAGE", "PAGES", "PREVIOUSPAGE", "TOTAL"]);
    });
  });

  describe("#.getPreviousRecord", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      r.getNextRecord();
      const rec = r.getPreviousRecord();
      expect(rec).not.to.be.null;
      if (rec) {
        expect(rec.getData()).to.eql({
          COUNT: "2",
          DOMAIN: "0-60motorcycletimes.com",
          FIRST: "0",
          LAST: "1",
          LIMIT: "2",
          TOTAL: "2701",
        });
        expect(r.getPreviousRecord()).to.be.null;
      }
    });
  });

  describe("#.hasNextPage", () => {
    it("check return value [no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.hasNextPage()).to.be.false;
    });

    it("check return value [rows]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      expect(r.hasNextPage()).to.be.true;
    });
  });

  describe("#.hasPreviousPage", () => {
    it("check return value [no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.hasPreviousPage()).to.be.false;
    });

    it("check return value [rows]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      expect(r.hasPreviousPage()).to.be.false;
    });
  });

  describe("#.getLastRecordIndex", () => {
    it("check return value [no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getLastRecordIndex()).to.be.null;
    });

    it("check return value [w/o LAST in response, rows]", () => {
      const h = rtm.getTemplate("OK").getHash();
      h.PROPERTY = {
        DOMAIN: ["mydomain1.com", "mydomain2.com"],
      };
      const r = new Response(ResponseParser.serialize(h), cmd);
      expect(r.getLastRecordIndex()).to.equal(1);
    });
  });

  describe("#.getNextPageNumber", () => {
    it("check return value [no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getNextPageNumber()).to.be.null;
    });

    it("check return value [rows]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      expect(r.getNextPageNumber()).to.be.equal(2);
    });
  });

  describe("#.getNumberOfPages", () => {
    it("check return value [no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getNumberOfPages()).to.equal(0);
    });
  });

  describe("#.getPreviousPageNumber", () => {
    it("check return value [no rows]", () => {
      const r = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      expect(r.getPreviousPageNumber()).to.be.null;
    });

    it("check return value [rows]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      expect(r.getPreviousPageNumber()).to.be.null;
    });
  });

  describe("#.rewindRecordList", () => {
    it("check return value", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      expect(r.getPreviousRecord()).to.be.null;
      expect(r.getNextRecord()).not.to.be.null;
      expect(r.getNextRecord()).to.be.null;
      expect(r.rewindRecordList().getPreviousRecord()).to.be.null;
    });
  });
});
