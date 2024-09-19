import { expect, use } from "chai"; // Using Expect style
import chaiAsPromised from "chai-as-promised";
import "mocha";
import nock from "nock";
import {
  APIClient,
  CNR_CONNECTION_URL_LIVE,
  CNR_CONNECTION_URL_OTE,
  CNR_CONNECTION_URL_PROXY,
} from "../src/apiclient.ts";
import { Response } from "../src/response.ts";
import { ResponseTemplateManager } from "../src/responsetemplatemanager.ts";
use(chaiAsPromised);

const apiScript = "/api/call.cgi";
const oteHost = CNR_CONNECTION_URL_OTE.replace(apiScript, "");
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
      "[RESPONSE]\r\nproperty[expiration date][0] = 2024-09-19 10:52:51\r\nproperty[sessionid][0] = bb7a884b09b9a674fb4a22211758ce87\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0.004\r\nruntime = 0.023\r\nEOF\r\n",
    )
    .addTemplate(
      "login500",
      rtm.generateTemplate("530", "Authentication failed"),
    )
    .addTemplate(
      "OK",
      rtm.generateTemplate("200", "Command completed successfully"),
    )
    .addTemplate(
      "CHECKS",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 0\r\nproperty[domain][0] = cnic-ssl-test1.com\r\nproperty[domain][1] = cnic-ssl-test2.com\r\nproperty[count][0] = 2\r\nproperty[last][0] = 1\r\nproperty[limit][0] = 2\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.007\r\nEOF\r\n",
    )
    .addTemplate(
      "listP0",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 0\r\nproperty[domain][0] = cnic-ssl-test1.com\r\nproperty[domain][1] = cnic-ssl-test2.com\r\nproperty[count][0] = 2\r\nproperty[last][0] = 1\r\nproperty[limit][0] = 2\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.007\r\nEOF\r\n",
    )
    .addTemplate(
      "listP1",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 2\r\nproperty[domain][0] = emailcustomization.com\r\nproperty[domain][1] = test-keysysbe0123.be\r\nproperty[count][0] = 2\r\nproperty[last][0] = 3\r\nproperty[limit][0] = 2\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.006\r\nEOF\r\n",
    )
    .addTemplate(
      "listFP0",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 0\r\nproperty[domain][0] = cnic-ssl-test1.com\r\nproperty[count][0] = 1\r\nproperty[last][0] = 0\r\nproperty[limit][0] = 1\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.009\r\nEOF\r\n",
    )
    .addTemplate(
      "listFP1",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 1\r\nproperty[domain][0] = cnic-ssl-test2.com\r\nproperty[count][0] = 1\r\nproperty[last][0] = 1\r\nproperty[limit][0] = 1\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.007\r\nEOF\r\n",
    )
    .addTemplate(
      "listFP2",
      "[RESPONSE]\r\nproperty[total][0] = 4\r\nproperty[first][0] = 2\r\nproperty[domain][0] = emailcustomization.com\r\nproperty[count][0] = 1\r\nproperty[last][0] = 2\r\nproperty[limit][0] = 1\r\ndescription = Command completed successfully\r\ncode = 200\r\nqueuetime = 0\r\nruntime = 0.007\r\nEOF\r\n",
    )
    .addTemplate(
      "subUserSet",
      "[RESPONSE]\r\nproperty[amount][0] = 670.77\r\nproperty[credit][0] = 0.00\r\nproperty[credit threshold][0] = 0.00\r\nproperty[currency][0] = USD\r\nproperty[registrar][0] = sub1\r\nproperty[vat][0] = 0.00\r\ndescription = Command completed successfully\r\ncode = 200\r\nruntime = 0.008\r\nqueuetime = 0\r\nEOF\r\n",
    )
    .addTemplate(
      "subUserReset",
      "[RESPONSE]\r\nproperty[amount][0] = 670.77\r\nproperty[credit][0] = 0.00\r\nproperty[credit threshold][0] = 0.00\r\nproperty[currency][0] = USD\r\nproperty[registrar][0] = test\r\nproperty[vat][0] = 0.00\r\ndescription = Command completed successfully\r\ncode = 200\r\nruntime = 0.008\r\nqueuetime = 0\r\nEOF\r\n",
    );
});

describe("APIClient class", function () {
  this.timeout(APIClient.socketTimeout);
  this.slow(1000);

  describe("#.getPOSTData", () => {
    it("test object input with special chars", () => {
      const validate =
        "s_command=AUTH%3Dgwrgwqg%25%26%5C44t3%2A%0ACOMMAND%3DModifyDomain";
      const enc = cl.getPOSTData({
        AUTH: "gwrgwqg%&\\44t3*",
        COMMAND: "ModifyDomain",
      });
      expect(enc).to.equal(validate);
    });

    it("test string input", () => {
      const enc = cl.getPOSTData("gregergege");
      expect(enc).to.equal("s_command=gregergege");
    });

    it("test object input with null value in parameter", () => {
      const validate = "s_command=COMMAND%3DModifyDomain";
      const enc = cl.getPOSTData({
        AUTH: null,
        COMMAND: "ModifyDomain",
      });
      expect(enc).to.equal(validate);
    });

    it("test object input with undefined value in parameter", () => {
      const validate = "s_command=COMMAND%3DModifyDomain";
      const enc = cl.getPOSTData({
        AUTH: undefined,
        COMMAND: "ModifyDomain",
      });
      expect(enc).to.equal(validate);
    });

    it("test data getting secured correctly", () => {
      const encodedTestUserName = encodeURIComponent(process.env.CNR_TEST_USER || '');
      const validate =
        "s_login=" + encodedTestUserName + "&s_pw=***&s_command=COMMAND%3DCheckAuthentication%0APASSWORD%3D%2A%2A%2A%0ASUBUSER%3D" + encodedTestUserName;
      cl.setCredentials(process.env.CNR_TEST_USER || '', process.env.CNR_TEST_PASSWORD || '');
      const enc = cl.getPOSTData(
        {
          COMMAND: "CheckAuthentication",
          PASSWORD: "test.passw0rd",
          SUBUSER: process.env.CNR_TEST_USER,
        },
        true,
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

  describe("#.getURL", () => {
    it("validate default socket url", () => {
      const url = cl.getURL();
      expect(url).to.equal(CNR_CONNECTION_URL_LIVE);
    });
  });

  describe("#.getUserAgent", () => {
    it("validate response", () => {
      const ua = cl.getUserAgent();
      expect(ua).to.equal(
        `NODE-SDK (${process.platform}; ${process.arch
        }; rv:${cl.getVersion()}) node/${process.version}`,
      );
    });
  });

  describe("#.setUserAgent", () => {
    it("validate response", () => {
      const cls = cl.setUserAgent("WHMCS", "7.7.0");
      const ua = cl.getUserAgent();
      expect(cls).to.be.instanceOf(APIClient);
      expect(ua).to.equal(
        `WHMCS (${process.platform}; ${process.arch
        }; rv:7.7.0) node-sdk/${cl.getVersion()} node/${process.version}`,
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
        `WHMCS (${process.platform}; ${process.arch
        }; rv:7.7.0) reg/2.6.2 ssl/7.2.2 dc/8.2.2 node-sdk/${cl.getVersion()} node/${process.version
        }`,
      );
    });
  });

  describe("#.setURL", () => {
    it("validate http socket url", () => {
      const url = cl.setURL(CNR_CONNECTION_URL_PROXY).getURL();
      expect(url).to.equal(CNR_CONNECTION_URL_PROXY);
      cl.setURL(CNR_CONNECTION_URL_LIVE);
    });
  });

  describe("#.saveSession/reuseSession", () => {
    after(() => {
      cl.reuseSession({});
    });

    it("validate correct settings", async () => {
      const sessionobj = {};
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock(oteHost).post(apiScript).reply(200, tpl.getPlain());
      cl.useOTESystem().setCredentials(process.env.CNR_TEST_USER || '', process.env.CNR_TEST_PASSWORD || '');
      const r = await cl.login();
      cl.saveSession(sessionobj);
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).not.to.be.null;
      const cl2 = new APIClient();
      cl2.reuseSession(sessionobj);
      const tmp = cl2.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.include("s_sessionid");
    });
  });

  describe("#.setCredentials", () => {
    it("validate getPOSTData response [credentials set] ", () => {
      cl.setCredentials("myaccountid", "mypassword");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_login=myaccountid&s_pw=mypassword&s_command=COMMAND%3DStatusAccount",
      );
    });

    it("validate getPOSTData response [session reset]", () => {
      cl.setCredentials("", "");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.setRoleCredentials", () => {
    it("validate getPOSTData response [role credentials set] ", () => {
      cl.setRoleCredentials("myaccountid", "myroleid", "mypassword");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal(
        "s_login=myaccountid%3Amyroleid&s_pw=mypassword&s_command=COMMAND%3DStatusAccount",
      );
    });

    it("validate getPOSTData response [role credentials reset]", () => {
      cl.setRoleCredentials("", "", "");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusAccount",
      });
      expect(tmp).to.equal("s_command=COMMAND%3DStatusAccount");
    });
  });

  describe("#.login", () => {
    it("validate against mocked API response [login succeeded; no role used]", async () => {
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock(oteHost).post(apiScript).reply(200, tpl.getPlain());
      cl.useOTESystem().setCredentials(process.env.CNR_TEST_USER || '', process.env.CNR_TEST_PASSWORD || '');
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).not.to.be.null;
      if (rec) {
        const rec2 = tpl.getRecord(0);
        expect(rec2).not.to.be.null;
        if (rec2) {
          expect(rec.getDataByKey("SESSIONID")).to.equal(
            rec2.getDataByKey("SESSIONID"),
          );
        }
      }
    });

    it("validate against mocked API response [login failed; wrong credentials]", async () => {
      nock(oteHost)
        .post(apiScript)
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
      nock(oteHost)
        .post(apiScript)
        .delayConnection(APIClient.socketTimeout + 1000)
        .reply(200, tpl.getPlain());
      cl.setCredentials("test.user", "WRONGPASSWORD");
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isTmpError()).to.be.true;
      expect(r.getDescription()).to.equal(tpl.getDescription());
    });

    it("validate against mocked API response [login succeeded; no session returned] ", async () => {
      // this case cannot really happen as the api always returns SESSIONID property.
      // this case is just to increase coverage
      const tpl = new Response(rtm.getTemplate("OK").getPlain(), cmd);
      nock(oteHost).post(apiScript).reply(200, tpl.getPlain());
      cl.useOTESystem().setCredentials(process.env.CNR_TEST_USER || '', process.env.CNR_TEST_PASSWORD || '');
      const r = await cl.login();
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
      const rec = r.getRecord(0);
      expect(rec).to.be.null;
    });
  });

  describe("#.logout", () => {
    it("validate against mocked API response [logout succeeded]", async () => {
      nock(oteHost)
        .post(apiScript)
        .reply(200, rtm.getTemplate("OK").getPlain());

      // Perform login to establish a session
      cl.reuseSession({ socketconfig: { login: "myaccountid", session: "12345678" } });
      // Perform logout
      const logoutResponse = await cl.logout();
      console.log("Logout Response:", cl.getPOSTData({ COMMAND: "StatusAccount" }));
      expect(logoutResponse).to.be.instanceOf(Response);
      expect(logoutResponse.isSuccess()).to.be.true;
    });

    it("validate against mocked API response [logout failed; session no longer exists]", async () => {
      const tpl = new Response(rtm.getTemplate("login200").getPlain(), cmd);
      nock(oteHost)
        .post(apiScript)
        .reply(200, rtm.getTemplate("login500").getPlain());

      const rec2 = tpl.getRecord(0);
      expect(rec2).not.to.be.null;
      if (rec2) {
        const sessid = rec2.getDataByKey("SESSIONID");
        expect(sessid).not.to.be.null;
        if (sessid) {
          cl.enableDebugMode();
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
      nock(oteHost)
        .post(apiScript)
        .reply(404, rtm.getTemplate("404").getPlain());
      cl.enableDebugMode()
        .setCredentials(process.env.CNR_TEST_USER || '', process.env.CNR_TEST_PASSWORD || '')
        .useOTESystem();
      const r = await cl.request(cmd);
      expect(r).to.be.instanceOf(Response);
      expect(r.isTmpError()).to.be.true;
      expect(r.getCode()).to.equal(tpl2.getCode());
      expect(r.getDescription()).to.equal(tpl2.getDescription());
    });

    it("validate against mocked API response [200 < r.statusCode > 299, no debug]", async () => {
      const tpl2 = new Response(rtm.getTemplate("httperror").getPlain(), cmd);
      nock(oteHost)
        .post(apiScript)
        .reply(404, rtm.getTemplate("404").getPlain());
      cl.disableDebugMode();
      const r = await cl.request(cmd);
      expect(r).to.be.instanceOf(Response);
      expect(r.isTmpError()).to.be.true;
      expect(r.getCode()).to.equal(tpl2.getCode());
      expect(r.getDescription()).to.equal(tpl2.getDescription());
    });

    it("test if flattening of nested array / bulk parameters works", async () => {
      nock(oteHost)
        .post(apiScript)
        .reply(200, rtm.getTemplate("OK").getPlain());
        cl.enableDebugMode();
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

    it("test if auto-idn convert works on domains", async () => {
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
      expect(mycmd.DOMAIN1).to.equal("dömäin.example");
      expect(mycmd.DOMAIN2).to.equal("example.net");
    });

    it("test if auto-idn convert works on dnszone", () => {
      cl.setRoleCredentials("myaccountid", "myroleid", "mypassword");
      const tmp = cl.getPOSTData({
        COMMAND: "StatusDNSZone",
        DNSZONE: "hallööö.com",
      });
      expect(tmp).to.equal(
        "s_login=myaccountid%3Amyroleid&s_pw=mypassword&s_command=COMMAND%3DStatusDNSZone%0ADNSZONE%3Dhall%C3%B6%C3%B6%C3%B6.com",
      );
    });
  });

  describe("#.requestNextResponsePage", () => {
    it("validate against mocked API response [no LAST set]", async () => {
      nock(oteHost)
        .post(apiScript)
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
        "Parameter LAST in use. Please remove it to avoid issues in requestNextPage.",
      );
    });

    it("validate against mocked API response [no FIRST set]", async () => {
      nock(oteHost)
        .post(apiScript)
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
      const scope = nock(oteHost)
        .persist()
        .post(apiScript)
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
      expect(nr.length).to.equal(4);
      scope.persist(false);
    });
  });

  describe("#.setUserView", () => {
    it("validate against mocked API response", async () => {
      nock(oteHost)
        .post(apiScript)
        .reply(200, rtm.getTemplate("subUserSet").getPlain());
      cl.setUserView("sub1");
      cl.enableDebugMode();
      const r = await cl.request({ COMMAND: "StatusAccount" });
      console.log("Response:", r);
      expect(r).to.be.instanceOf(Response);
      expect(r.isSuccess()).to.be.true;
    });
  });

  describe("#.resetUserView", () => {
    it("validate against mocked API response", async () => {
      nock(oteHost)
        .post(apiScript)
        .reply(200, rtm.getTemplate("subUserReset").getPlain());
      cl.resetUserView();
      const r = await cl.request({ COMMAND: "StatusAccount" });
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
      cl.setReferer("https://www.centralnicreseller.com");
      expect(cl.getReferer()).to.equal("https://www.centralnicreseller.com");
      cl.setReferer("");
    });
  });

  describe("#.useHighPerformanceConnectionSetup", () => {
    it("test setting high performance connection setup works", () => {
      cl.useHighPerformanceConnectionSetup();
      expect(cl.getURL()).to.equal(CNR_CONNECTION_URL_PROXY);
    });
  });

  describe("#.useDefaultConnectionSetup", () => {
    it("test setting default connection setup works", () => {
      cl.useDefaultConnectionSetup();
      expect(cl.getURL()).to.equal(CNR_CONNECTION_URL_LIVE);
    });
  });
});
