"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai = require("chai");
import chaiPromised = require("chai-as-promised");
import "mocha";
import nock = require("nock");
import {
  APIClient,
  ISPAPI_CONNECTION_URL,
  ISPAPI_CONNECTION_URL_PROXY,
} from "../src/apiclient";
import { Response } from "../src/response";
import { ResponseTemplateManager } from "../src/responsetemplatemanager";
chai.use(chaiPromised);

const expect = chai.expect;
const rtm = ResponseTemplateManager.getInstance();
const cmd = { COMMAND: "StatusAccount" };
let cl: APIClient;

after(() => {
  nock.cleanAll();
});

before(() => {
  cl = new APIClient();
  rtm
    .addTemplate(
      "login200",
      "[RESPONSE]\r\nPROPERTY[SESSION][0]=h8JLZZHdF2WgWWXlwbKWzEG3XrzoW4yshhvtqyg0LCYiX55QnhgYX9cB0W4mlpbx\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.169\r\nEOF\r\n"
    )
    .addTemplate(
      "login500",
      rtm.generateTemplate("530", "Authentication failed")
    )
    .addTemplate(
      "OK",
      rtm.generateTemplate("200", "Command completed successfully")
    )
    .addTemplate(
      "CHECKS",
      "[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[DOMAIN][1]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n"
    )
    .addTemplate(
      "listP0",
      "[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[DOMAIN][1]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n"
    )
    .addTemplate(
      "listP1",
      "[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=2\r\nPROPERTY[DOMAIN][0]=0-qas-ao17-0.org\r\nPROPERTY[DOMAIN][1]=0-sunnyda222y.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=3\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.032\r\nEOF\r\n"
    )
    .addTemplate(
      "listFP0",
      "[RESPONSE]\r\nPROPERTY[TOTAL][0]=3\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[COUNT][0]=1\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=1\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n"
    )
    .addTemplate(
      "listFP1",
      "[RESPONSE]\r\nPROPERTY[TOTAL][0]=3\r\nPROPERTY[FIRST][0]=1\r\nPROPERTY[DOMAIN][0]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=1\r\nPROPERTY[LAST][0]=2\r\nPROPERTY[LIMIT][0]=1\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.032\r\nEOF\r\n"
    )
    .addTemplate(
      "listFP2",
      "[RESPONSE]\r\nPROPERTY[TOTAL][0]=3\r\nPROPERTY[FIRST][0]=2\r\nPROPERTY[DOMAIN][0]=0-qas-ao17-0.org\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=3\r\nPROPERTY[LIMIT][0]=1\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.032\r\nEOF\r\n"
    );
});

describe("APIClient class", function () {
  this.timeout(APIClient.socketTimeout);
  this.slow(1000);

  describe("#.getPOSTData", () => {
    it("test object input with special chars", () => {
      const validate =
        "s_entity=54cd&s_command=AUTH%3Dgwrgwqg%25%26%5C44t3%2A%0ACOMMAND%3DModifyDomain";
      const enc = cl.getPOSTData({
        AUTH: "gwrgwqg%&\\44t3*",
        COMMAND: "ModifyDomain",
      });
      expect(enc).to.equal(validate);
    });

    it("test string input", () => {
      const enc = cl.getPOSTData("gregergege");
      expect(enc).to.equal("s_entity=54cd&s_command=gregergege");
    });

    it("test object input with null value in parameter", () => {
      const validate = "s_entity=54cd&s_command=COMMAND%3DModifyDomain";
      const enc = cl.getPOSTData({
        AUTH: null,
        COMMAND: "ModifyDomain",
      });
      expect(enc).to.equal(validate);
    });

    it("test object input with undefined value in parameter", () => {
      const validate = "s_entity=54cd&s_command=COMMAND%3DModifyDomain";
      const enc = cl.getPOSTData({
        AUTH: undefined,
        COMMAND: "ModifyDomain",
      });
      expect(enc).to.equal(validate);
    });

    it("test data getting secured correctly", () => {
      const validate =
        "s_entity=54cd&s_login=test.user&s_pw=***&s_command=COMMAND%3DCheckAuthentication%0APASSWORD%3D%2A%2A%2A%0ASUBUSER%3Dtest.user";
      cl.setCredentials("test.user", "test.passw0rd");
      const enc = cl.getPOSTData(
        {
          COMMAND: "CheckAuthentication",
          PASSWORD: "test.passw0rd",
          SUBUSER: "test.user",
        },
        true
      );
      cl.setCredentials("", "");
      expect(enc).to.equal(validate);
    });
  });

  describe("#.enableDebugMode", () => {
    it("activate debug mode", () => {
      cl.enableDebugMode();
    });
  });

  describe("#.disableDebugMode", () => {
    it("deactivate debug mode", () => {
      cl.disableDebugMode();
    });
  });

  describe("#.getSession", () => {
    it("validate response", () => {
      const session = cl.getSession();
      expect(session).to.be.null;
    });
  });

  describe("#.getSession", () => {
    it("validate response", () => {
      const sessid = "testSessionID12345678";
      cl.setSession(sessid);
      const session = cl.getSession();
      expect(session).to.be.equal(sessid);
      cl.setSession("");
    });
  });

  describe("#.getURL", () => {
    it("validate default socket url", () => {
      const url = cl.getURL();
      expect(url).to.equal(ISPAPI_CONNECTION_URL);
    });
  });

  describe("#.getUserAgent", () => {
    it("validate response", () => {
      const ua = cl.getUserAgent();
      expect(ua).to.equal(
        `NODE-SDK (${process.platform}; ${
          process.arch
        }; rv:${cl.getVersion()}) node/${process.version}`
      );
    });
  });

  describe("#.setUserAgent", () => {
    it("validate response", () => {
      const cls = cl.setUserAgent("WHMCS", "7.7.0");
      const ua = cl.getUserAgent();
      expect(cls).to.be.instanceOf(APIClient);
      expect(ua).to.equal(
        `WHMCS (${process.platform}; ${
          process.arch
        }; rv:7.7.0) node-sdk/${cl.getVersion()} node/${process.version}`
      );
    });

    it("validate agent string including modules", () => {
      const cls = cl.setUserAgent("WHMCS", "7.7.0", [
        "reg/2.6.2",
        "ssl/7.2.2",
        "dc/8.2.2",
      ]);
      const ua = cl.getUserAgent();
      expect(cls).to.be.instanceOf(APIClient);
      expect(ua).to.equal(
        `WHMCS (${process.platform}; ${
          process.arch
        }; rv:7.7.0) reg/2.6.2 ssl/7.2.2 dc/8.2.2 node-sdk/${cl.getVersion()} node/${
          process.version
        }`
      );
    });
  });

  describe("#.setURL", () => {
    it("validate http socket url", () => {
      const url = cl.setURL(ISPAPI_CONNECTION_URL_PROXY).getURL();
      expect(url).to.equal(ISPAPI_CONNECTION_URL_PROXY);
      cl.setURL(ISPAPI_CONNECTION_URL);
    });
  });

  describe("#.setOTP", () => {
    it("validate getPOSTData response [otp set] ", () => {
      cl.setOTP("12345678");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_otp=12345678&s_command=COMMAND%3DStatusAccount"
      );
    });

    it("validate getPOSTData response [otp reset]", () => {
      cl.setOTP("");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_entity=54cd&s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.setSession", () => {
    it("validate getPOSTData response [session set] ", () => {
      cl.setSession("12345678");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_session=12345678&s_command=COMMAND%3DStatusAccount"
      );
    });

    it("validate getPOSTData response [credentials and session set] ", () => {
      // credentials and otp code have to be unset when session id is set
      cl.setRoleCredentials("myaccountid", "myrole", "mypassword")
        .setOTP("12345678")
        .setSession("12345678");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_session=12345678&s_command=COMMAND%3DStatusAccount"
      );
    });

    it("validate getPOSTData response [session reset]", () => {
      cl.setSession("");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_entity=54cd&s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.saveSession/reuseSession", () => {
    after(() => {
      cl.setSession("");
    });

    it("validate correct settings", () => {
      const sessionobj = {};
      cl.setSession("12345678").saveSession(sessionobj);
      const cl2 = new APIClient();
      cl2.reuseSession(sessionobj);
      const tmp = cl2.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_session=12345678&s_command=COMMAND%3DStatusAccount"
      );
    });
  });

  describe("#.setRemoteIPAddress", () => {
    it("validate getPOSTData response [ip set] ", () => {
      cl.setRemoteIPAddress("10.10.10.10");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_remoteaddr=10.10.10.10&s_command=COMMAND%3DStatusAccount"
      );
    });

    it("validate getPOSTData response [ip reset]", () => {
      cl.setRemoteIPAddress("");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_entity=54cd&s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.setCredentials", () => {
    it("validate getPOSTData response [credentials set] ", () => {
      cl.setCredentials("myaccountid", "mypassword");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_login=myaccountid&s_pw=mypassword&s_command=COMMAND%3DStatusAccount"
      );
    });

    it("validate getPOSTData response [session reset]", () => {
      cl.setCredentials("", "");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_entity=54cd&s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.setRoleCredentials", () => {
    it("validate getPOSTData response [role credentials set] ", () => {
      cl.setRoleCredentials("myaccountid", "myroleid", "mypassword");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_entity=54cd&s_login=myaccountid%21myroleid&s_pw=mypassword&s_command=COMMAND%3DStatusAccount"
      );
    });

    it("validate getPOSTData response [role credentials reset]", () => {
      cl.setRoleCredentials("", "", "");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_entity=54cd&s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.login", () => {
    it("validate against mocked API response [login succeeded; no role used]", async () => {
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, tpl.getPlain());
      cl.useOTESystem().setCredentials("test.user", "test.passw0rd");
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).not.to.be.null;
      if (rec) {
        const rec2 = tpl.getRecord(0);
        expect(rec2).not.to.be.null;
        if (rec2) {
          expect(rec.getDataByKey("SESSION")).to.equal(
            rec2.getDataByKey("SESSION")
          );
        }
      }
    });

    // skipping test using public accessible role user; we need to review here
    it.skip("validate against mocked API response [login succeeded; role used]", async () => {
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, tpl.getPlain());
      cl.useOTESystem().setRoleCredentials(
        "test.user",
        "testrole",
        "test.passw0rd"
      );
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).not.to.be.null;
      if (rec) {
        const rec2 = tpl.getRecord(0);
        expect(rec2).not.to.be.null;
        if (rec2) {
          expect(rec.getDataByKey("SESSION")).to.equal(
            rec2.getDataByKey("SESSION")
          );
        }
      }
    });

    it("validate against mocked API response [login failed; wrong credentials]", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("login500").getPlain());
      cl.setCredentials("test.user", "WRONGPASSWORD");
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isError()).to.be.true;
    });

    // deactivated as delayConnection is not working together with node-fetch
    it.skip("validate against mocked API response [login failed; http timeout]", async () => {
      nock.cleanAll();
      const tpl = rtm.getTemplate("httperror");
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .delayConnection(APIClient.socketTimeout + 1000)
        .reply(200, tpl.getPlain());
      cl.setCredentials("test.user", "WRONGPASSWORD");
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isTmpError()).to.be.true;
      expect(r.getDescription()).to.equal(tpl.getDescription());
    });

    it("validate against mocked API response [login succeeded; no session returned] ", async () => {
      // this case cannot really happen as the api always returns SESSION property.
      // this case is just to increase coverage
      const tpl = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, tpl.getPlain());
      cl.useOTESystem().setCredentials("test.user", "test.passw0rd");
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).to.be.null;
    });
  });

  describe("#.loginExtended", () => {
    it("validate against mocked API response [login succeeded; no role used] ", async () => {
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, tpl.getPlain());
      cl.useOTESystem().setCredentials("test.user", "test.passw0rd");
      const r = await cl.loginExtended({
        TIMEOUT: 60,
      });
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).not.to.be.null;
      if (rec) {
        const rec2 = tpl.getRecord(0);
        expect(rec2).not.to.be.null;
        if (rec2) {
          expect(rec.getDataByKey("SESSION")).to.equal(
            rec2.getDataByKey("SESSION")
          );
        }
      }
    });
  });

  describe("#.logout", () => {
    it("validate against mocked API response [logout succeeded]", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("OK").getPlain());
      const r = await cl.logout();
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
    });

    it("validate against mocked API response [logout failed; session no longer exists]", async () => {
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("login500").getPlain());

      const rec2 = tpl.getRecord(0);
      expect(rec2).not.to.be.null;
      if (rec2) {
        const sessid = rec2.getDataByKey("SESSION");
        expect(sessid).not.to.be.null;
        if (sessid) {
          cl.enableDebugMode().setSession(sessid);
          const r = await cl.logout();
          expect(r).to.be.instanceOf(Response);
          expect(r.isError()).to.be.true;
        }
      }
    });
  });

  describe("#.request", () => {
    // TODO additional test for statusMessage - not supported through nock [https://github.com/nock/nock/issues/558]
    it("validate against mocked API response [200 < r.statusCode > 299]", async () => {
      const tpl2 = new Response(rtm.getTemplate("httperror").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(404, rtm.getTemplate("404").getPlain());
      cl.enableDebugMode()
        .setCredentials("test.user", "test.passw0rd")
        .useOTESystem();
      const r = await cl.request(cmd);
      expect(r).to.be.instanceOf(Response);
      expect(r.isTmpError()).to.be.true;
      expect(r.getCode()).to.equal(tpl2.getCode());
      expect(r.getDescription()).to.equal(tpl2.getDescription());
    });

    it("validate against mocked API response [200 < r.statusCode > 299, no debug]", async () => {
      const tpl2 = new Response(rtm.getTemplate("httperror").getPlain(), cmd);
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(404, rtm.getTemplate("404").getPlain());
      cl.disableDebugMode();
      const r = await cl.request(cmd);
      expect(r).to.be.instanceOf(Response);
      expect(r.isTmpError()).to.be.true;
      expect(r.getCode()).to.equal(tpl2.getCode());
      expect(r.getDescription()).to.equal(tpl2.getDescription());
    });

    it("test if flattening of nested array / bulk parameters works", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("OK").getPlain());
      const r = await cl.request({
        COMMAND: "CheckDomains",
        DOMAIN: ["example.com", "example.net"],
      });
      expect(r).to.be.instanceOf(Response);
      const mycmd = r.getCommand();
      const keys = Object.keys(mycmd);
      expect(keys.includes("DOMAIN")).to.be.false;
      expect(keys.includes("DOMAIN0")).to.be.true;
      expect(keys.includes("DOMAIN1")).to.be.true;
      expect(mycmd.DOMAIN0).to.equal("example.com");
      expect(mycmd.DOMAIN1).to.equal("example.net");
    });

    it("test if auto-idn convert works", async () => {
      nock.cleanAll();
      const r = await cl.request({
        COMMAND: "CheckDomains",
        DOMAIN: ["example.com", "dömäin.example", "example.net"],
      });
      expect(r).to.be.instanceOf(Response);
      const mycmd = r.getCommand();
      const keys = Object.keys(mycmd);
      expect(keys.includes("DOMAIN")).to.be.false;
      expect(keys.includes("DOMAIN0")).to.be.true;
      expect(keys.includes("DOMAIN1")).to.be.true;
      expect(keys.includes("DOMAIN2")).to.be.true;
      expect(mycmd.DOMAIN0).to.equal("example.com");
      expect(mycmd.DOMAIN1).to.equal("xn--dmin-moa0i.example");
      expect(mycmd.DOMAIN2).to.equal("example.net");
    });
  });

  describe("#.requestNextResponsePage", () => {
    it("validate against mocked API response [no LAST set]", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("listP1").getPlain());
      const r = new Response(rtm.getTemplate("listP0").getPlain(), {
        COMMAND: "QueryDomainList",
        LIMIT: 2,
        FIRST: 0,
      });
      const nr = await cl.requestNextResponsePage(r);
      expect(r.isSuccess()).to.be.true;
      expect(r.getRecordsLimitation()).to.equal(2);
      expect(r.getRecordsCount()).to.equal(2);
      expect(r.getFirstRecordIndex()).to.equal(0);
      expect(r.getLastRecordIndex()).to.equal(1);
      expect(nr).not.to.be.null;
      if (nr) {
        expect(nr.isSuccess()).to.be.true;
        expect(nr.getRecordsLimitation()).to.equal(2);
        expect(nr.getRecordsCount()).to.equal(2);
        expect(nr.getFirstRecordIndex()).to.equal(2);
        expect(nr.getLastRecordIndex()).to.equal(3);
      }
    });

    it("validate against mocked API response [LAST set]", () => {
      const r = new Response(rtm.getTemplate("listP0").getPlain(), {
        COMMAND: "QueryDomainList",
        LIMIT: 2,
        FIRST: 0,
        LAST: 1,
      });
      return expect(cl.requestNextResponsePage(r)).to.be.rejectedWith(
        Error,
        "Parameter LAST in use. Please remove it to avoid issues in requestNextPage."
      );
    });

    it("validate against mocked API response [no FIRST set]", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("listP1").getPlain());
      cl.disableDebugMode();
      const r = new Response(rtm.getTemplate("listP0").getPlain(), {
        COMMAND: "QueryDomainList",
        LIMIT: 2,
      });
      const nr = await cl.requestNextResponsePage(r);
      expect(r.isSuccess()).to.be.true;
      expect(r.getRecordsLimitation()).to.equal(2);
      expect(r.getRecordsCount()).to.equal(2);
      expect(r.getFirstRecordIndex()).to.equal(0);
      expect(r.getLastRecordIndex()).to.equal(1);
      expect(nr).not.to.be.null;
      if (nr) {
        expect(nr.isSuccess()).to.be.true;
        expect(nr.getRecordsLimitation()).to.equal(2);
        expect(nr.getRecordsCount()).to.equal(2);
        expect(nr.getFirstRecordIndex()).to.equal(2);
        expect(nr.getLastRecordIndex()).to.equal(3);
      }
    });
  });

  describe("#.requestAllResponsePages", () => {
    it("validate against mocked API response [success case]", async () => {
      let reqcount = 0;
      const scope = nock("https://api.ispapi.net")
        .persist()
        .post("/api/call.cgi")
        .reply(200, () => {
          reqcount++;
          if (reqcount === 1) {
            return rtm.getTemplate("listFP0").getPlain();
          }
          if (reqcount === 2) {
            return rtm.getTemplate("listFP1").getPlain();
          }
          return rtm.getTemplate("listFP2").getPlain();
        });
      const nr = await cl.requestAllResponsePages({
        COMMAND: "QueryDomainList",
        FIRST: 0,
        LIMIT: 1,
      });
      expect(nr.length).to.equal(3);
      scope.persist(false);
    });
  });

  describe("#.setUserView", () => {
    it("validate against mocked API response", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("OK").getPlain());
      cl.setUserView("hexotestman.com");
      const r = await cl.request({ COMMAND: "GetUserIndex" });
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
    });
  });

  describe("#.resetUserView", () => {
    it("validate against mocked API response", async () => {
      nock("https://api.ispapi.net")
        .post("/api/call.cgi")
        .reply(200, rtm.getTemplate("OK").getPlain());
      cl.resetUserView();
      const r = await cl.request({ COMMAND: "GetUserIndex" });
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
    });
  });

  describe("#.setProxy", () => {
    it("test setting proxy works", () => {
      cl.setProxy("127.0.0.1");
      expect(cl.getProxy()).to.equal("127.0.0.1");
      cl.setProxy("");
    });
  });

  describe("#.setReferer", () => {
    it("test setting referer works", () => {
      cl.setReferer("https://www.hexonet.net");
      expect(cl.getReferer()).to.equal("https://www.hexonet.net");
      cl.setReferer("");
    });
  });

  describe("#.useHighPerformanceConnectionSetup", () => {
    it("test setting high performance connection setup works", () => {
      cl.useHighPerformanceConnectionSetup();
      expect(cl.getURL()).to.equal(ISPAPI_CONNECTION_URL_PROXY);
    });
  });

  describe("#.useDefaultConnectionSetup", () => {
    it("test setting default connection setup works", () => {
      cl.useDefaultConnectionSetup();
      expect(cl.getURL()).to.equal(ISPAPI_CONNECTION_URL);
    });
  });
});
