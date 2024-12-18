import { expect } from "chai";
import "mocha";
import { Response } from "../src/response.ts";
import { ResponseParser } from "../src/responseparser.ts";
import { ResponseTemplateManager } from "../src/responsetemplatemanager.ts";

const rtm = ResponseTemplateManager.getInstance();
const cmd = { COMMAND: "StatusContact" };

before(() => {
  rtm
    .addTemplate(
      "listP0",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 0\r\nproperty[domain][0] = cnic-ssl-test1.com\r\nproperty[domain][1] = cnic-ssl-test2.com\r\nproperty[count][0] = 2\r\nproperty[last][0] = 1\r\nproperty[limit][0] = 2\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.007\r\nEOF\r\n",
    )
    .addTemplate(
      "pendingRegistration",
      "[RESPONSE]\r\ncode = 200\r\ndescription = Command completed successfully\r\nruntime = 0.44\r\nqueuetime = 0\r\n\r\nproperty[status][0] = REQUESTED\r\nproperty[updated date][0] = 2023-05-22 12:14:31.0\r\nproperty[zone][0] = se\r\nEOF\r\n",
    )
    .addTemplate(
      "OK",
      rtm.generateTemplate("200", "Command completed successfully"),
    );
});

describe("Response class", function () {
  this.slow(1000);

  describe("constructor", () => {
    it("check instance [raw empty string]", () => {
      const tpl = new Response("");
      expect(tpl.getCode()).to.equal(423);
      expect(tpl.getDescription()).to.equal(
        "Empty API response. Probably unreachable API end point",
      );
    });

    it("check template `invalid` being returned", () => {
      const tpl = new Response(
        "[RESPONSE]\r\ncode=200\r\nqueuetime=0\r\nEOF\r\n",
      );
      expect(tpl.getCode()).to.equal(423);
      expect(tpl.getDescription()).to.equal(
        "Invalid API response. Contact Support",
      );
    });

    it("check place holder vars replacment", () => {
      // ensure no vars are returned in response, just in case no place holder replacements are provided
      let r = new Response("", cmd);
      expect(/\{[A-Z_]+\}/.test(r.getDescription())).to.be.false;

      // ensure variable replacements are correctly handled in case place holder replacements are provided
      r = new Response(
        "",
        { COMMAND: "StatusAccount" },
        { CONNECTION_URL: "123HXPHFOUND123" },
      );
      expect(/123HXPHFOUND123/.test(r.getDescription())).to.be.true;
    });
  });

  describe("#.getHash", () => {
    it("check return value", () => {
      const h = new Response("").getHash();
      expect(h.CODE).to.equal("423");
      expect(h.DESCRIPTION).to.equal(
        "Empty API response. Probably unreachable API end point",
      );
    });
  });

  describe("#.getQueuetime", () => {
    it("check return value [n/a in API response]", () => {
      const tpl = new Response("");
      expect(tpl.getQueuetime()).to.equal(0);
    });

    it("check return value [in API response]", () => {
      const tpl = new Response(
        "[RESPONSE]\r\ncode = 423\r\ndescription = Empty API response. Probably unreachable API end point\r\nqueuetime = 0\r\nEOF\r\n",
      );
      expect(tpl.getQueuetime()).to.equal(0);
    });
  });

  describe("#.getRuntime", () => {
    it("check return value [n/a in API response]", () => {
      const tpl = new Response("");
      expect(tpl.getRuntime()).to.equal(0);
    });

    it("check return value [in API response]", () => {
      const tpl = new Response(
        "[RESPONSE]\r\ncode= 423 \r\ndescription = Empty API response. Probably unreachable API end point\r\nruntime = 0.12\r\nEOF\r\n",
      );
      expect(tpl.getRuntime()).to.equal(0.12);
    });
  });

  describe("#.isPending", () => {
    it("check return value [n/a in API response]", () => {
      const tpl = new Response("");
      expect(tpl.isPending()).to.be.false;
    });

    it("check return value [in API response]", () => {
      const tpl = new Response(
        rtm.getTemplate("pendingRegistration").getPlain(),
        {
          COMMAND: "AddDomain",
          DOMAIN: "example.com",
        },
      );
      expect(tpl.isPending()).to.be.true;
    });
  });

  describe("#.getCommandPlain", () => {
    it("check flattening of command works", () => {
      const r = new Response("", {
        COMMAND: "CheckDomains",
        DOMAIN0: "example.com",
        DOMAIN1: "example.net",
      });
      const expected =
        "COMMAND = CheckDomains\nDOMAIN0 = example.com\nDOMAIN1 = example.net\n";
      expect(r.getCommandPlain()).to.equal(expected);
    });

    it("check data being returned secure", () => {
      const r = new Response("", {
        COMMAND: "CheckAuthentication",
        SUBUSER: "test.user",
        PASSWORD: "test.passw0rd",
      });
      const expected =
        "COMMAND = CheckAuthentication\nSUBUSER = test.user\nPASSWORD = ***\n";
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
      expect(data).to.equal("cnic-ssl-test1.com");
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
      expect(colkeys).to.include.members([
        "COUNT",
        "DOMAIN",
        "FIRST",
        "LAST",
        "LIMIT",
        "TOTAL",
      ]);
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
          DOMAIN: "cnic-ssl-test1.com",
          FIRST: "0",
          LAST: "1",
          LIMIT: "2",
          TOTAL: "4",
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
        expect(rec.getData()).to.eql({ DOMAIN: "cnic-ssl-test2.com" });
      }
      rec = r.getNextRecord();
      expect(rec).to.be.null;
    });
  });

  describe("#.getPagination", () => {
    it("check return value [next record]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), cmd);
      const pager = r.getPagination();
      expect(pager).to.have.all.keys([
        "COUNT",
        "CURRENTPAGE",
        "FIRST",
        "LAST",
        "LIMIT",
        "NEXTPAGE",
        "PAGES",
        "PREVIOUSPAGE",
        "TOTAL",
      ]);
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
          DOMAIN: "cnic-ssl-test1.com",
          FIRST: "0",
          LAST: "1",
          LIMIT: "2",
          TOTAL: "4",
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
