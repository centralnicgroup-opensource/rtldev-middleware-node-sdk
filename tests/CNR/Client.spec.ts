import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { PaginationException } from "../../src/Exception/PaginationException.ts";
import { Client } from "../../src/CNR/Client.ts";
import { Response as R } from "../../src/CNR/Response.ts";
import { ResponseTemplateManager as RTM } from "../../src/CNR/ResponseTemplateManager.ts";
import { SocketConfig } from "../../src/CNR/SocketConfig.ts";
import { System } from "../../src/System.ts";
import { Cassettes } from "../Support/Cassettes.ts";
import { CassetteTransport } from "../Support/CassetteTransport.ts";
import { SpyTransport } from "../Support/SpyTransport.ts";
import type { TransportInterface } from "../../src/TransportInterface.ts";

/**
 * CNR.Client — the request() lifecycle (command building and sorting, URL
 * resolution, POST serialisation, translation/parsing, pagination,
 * login()/logout()), ported from PHP's CNR/ClientTest.php against the same
 * committed cassettes. Replay is fully offline: dummy credentials, no
 * network.
 */
describe("CNR.Client", () => {
  const cassetteDir = new URL("./cassettes", import.meta.url).pathname;
  const user = "test.user";
  const pw = "test.pw";
  let cl: Client;
  let tape: CassetteTransport;

  beforeEach(() => {
    cl = CF.cnr();
    tape = Cassettes.attach(cl, cassetteDir);
  });

  it("request() resolves the connection URL to host + default script path", async () => {
    tape.useCassette("resolve-connection-url");
    cl.setCredentials(user, pw).useOTESystem();
    const r = await cl.request({ COMMAND: "StatusAccount" });
    expect(r.getRequestURL()).to.equal(
      "https://api-ote.rrpproxy.net/api/call.cgi",
    );
  });

  it("getSystem()/isOTE() agree with the configured URL", () => {
    expect(cl.getSystem()).to.equal(System.LIVE);
    expect(cl.isOTE()).to.be.false;

    cl.useOTESystem();
    expect(cl.getSystem()).to.equal(System.OTE);
    expect(cl.isOTE()).to.be.true;

    cl.useLIVESystem();
    expect(cl.getSystem()).to.equal(System.LIVE);
    expect(cl.isOTE()).to.be.false;
  });

  it("setContext() propagates into every Response built from that client", async () => {
    tape.useCassette("set-context");
    const context = { traceId: "abc123", attempt: 1 };
    expect(cl.setContext(context)).to.equal(cl);

    cl.setCredentials(user, pw).useOTESystem();
    const r = await cl.request({
      COMMAND: "CheckDomains",
      DOMAIN: ["example.com"],
    });
    expect(r.getContext()).to.deep.equal(context);
  });

  // The session lifecycle lives on CNR.Client itself (RSRMID-2969) — there
  // is no separate SessionClient subclass to inherit it from. Own-property
  // check, not just "the method is callable", so a future re-split (a
  // trait-like mixin, a reinstated subclass) would fail here even if it
  // still made every behavioural call site work.
  it("declares the session lifecycle itself, not through any other type", () => {
    for (const method of ["login", "logout", "saveSession", "reuseSession"]) {
      expect(
        Object.prototype.hasOwnProperty.call(Client.prototype, method),
        `CNR.Client.prototype must own ${method}() itself`,
      ).to.be.true;
    }
  });

  it("setRoleCredentials() with no arguments resets to a plain login", () => {
    cl.setRoleCredentials();
    expect(cl.getPOSTData({ COMMAND: "StatusAccount" })).to.equal(
      "s_command=COMMAND%3DStatusAccount",
    );
  });

  it("login() with plain credentials succeeds and stores the returned session id", async () => {
    tape.useCassette("login-creds-ok");
    cl.useOTESystem().setCredentials(user, pw);
    const r = await cl.login();
    expect(r).to.be.instanceOf(R);
    expect(r.isSuccess(), r.getPlain()).to.be.true;
    const rec = r.getRecord(0);
    expect(rec).to.not.be.null;
    expect(rec?.getDataByKey("SESSIONID")).to.not.be.null;
    expect(cl.getSession()).to.not.be.null;
  });

  it("login() with role credentials succeeds", async () => {
    tape.useCassette("login-role-creds-ok");
    cl.setRoleCredentials("test.user", "role", "role.pw");
    const r = await cl.login();
    expect(r.isSuccess(), r.getPlain()).to.be.true;
    const rec = r.getRecord(0);
    expect(rec).to.not.be.null;
    expect(rec?.getDataByKey("SESSIONID")).to.not.be.null;
  });

  it("login() resets persistent even when request() throws (RSRMID-2974 review)", async () => {
    cl.setCredentials(user, pw);
    cl.setTransport({
      post: async (): Promise<[string, string | null]> => {
        throw new Error("transport exploded");
      },
      close: async () => {
        // no-op
      },
    });

    let threw: unknown = null;
    try {
      await cl.login();
    } catch (err) {
      threw = err;
    }
    expect(threw).to.be.instanceOf(Error);
    // Without the try/finally in SessionClient.login(), this stays true
    // forever after the throw, silently sending persistent=1 on every later
    // request from this client.
    expect(cl.getSocketConfig().getPersistent()).to.be.false;
  });

  // The credentials-clear-session rule lives entirely on SocketConfig
  // (setLogin()/setPassword() each clear the session id); adopting a
  // caller's pre-built config at construction (RSRMID-2966) must neither
  // pre-empt it nor reorder it. Both directions, since adopt-by-reference is
  // what makes the second one work.
  it("setCredentials() still discards an active session when the config was supplied pre-built", () => {
    const cfg = new SocketConfig()
      .setLogin("myaccountid")
      .setSession("sess-123");
    const client = CF.cnr(cfg);
    expect(client.getSession()).to.equal("sess-123");

    client.setCredentials("myaccountid", "mypassword");
    expect(
      client.getSession(),
      "setting credentials must still discard the active session when the config was supplied pre-built — a session and a password are alternative credentials on the wire",
    ).to.be.null;

    cfg.setSession("sess-456");
    expect(
      client.getSession(),
      "a write through the caller's own config must be visible through the client it was handed to",
    ).to.equal("sess-456");
  });

  it("logout() succeeds after a successful login and clears the session", async () => {
    tape.useCassette("logout-ok");
    cl.setCredentials(user, pw);
    const loginResponse = await cl.login();
    expect(loginResponse.isSuccess(), loginResponse.getPlain()).to.be.true;

    const r = await cl.logout();
    expect(r.isSuccess(), r.getPlain()).to.be.true;
    expect(cl.getSession()).to.be.null;
  });

  it("logout() without an active session reports an error", async () => {
    tape.useCassette("logout-fail");
    const r = await cl.logout();
    expect(r.isError()).to.be.true;
  });

  it("a failed logout() leaves the session id exactly as it was — not cleared", async () => {
    tape.useCassette("logout-fail");
    cl.setSession("stale-session-id");
    const r = await cl.logout();
    expect(r.isSuccess(), "this cassette must model a failed StopSession").to.be
      .false;
    expect(cl.getSession()).to.equal("stale-session-id");
  });

  it("logout() closes the transport even when request() throws (transport-leak sibling of the login() persistent leak)", async () => {
    let closed = false;
    const throwing: TransportInterface = {
      post(): Promise<[string, string | null]> {
        return Promise.reject(new Error("transport exploded"));
      },
      async close(): Promise<void> {
        closed = true;
      },
    };
    const c = CF.cnr().setTransport(throwing).useOTESystem();

    let thrown: unknown = null;
    try {
      await c.logout();
    } catch (err) {
      thrown = err;
    }
    expect(thrown, "logout() must propagate request()'s throw, not swallow it")
      .to.not.be.null;
    expect(
      closed,
      "the transport must still be closed even though request() threw",
    ).to.be.true;
  });

  it("a transport (HTTP communication) failure maps to code 421", async () => {
    const replayOnly = new CassetteTransport(null, cassetteDir, false);
    const c = CF.cnr();
    c.setTransport(replayOnly);
    replayOnly.useCassette("conn-error");
    c.useOTESystem();
    const r = await c.request({ COMMAND: "StatusAccount" });
    expect(r.isSuccess()).to.be.false;
    expect(r.getCode()).to.equal(421);
    expect(r.getDescription()).to.equal(
      "Command failed due to HTTP communication error (Could not resolve host: gregeragregaegaegag.com).",
    );
  });

  it("request() flattens a nested array command parameter", async () => {
    tape.useCassette("flatten-command");
    cl.setCredentials(user, pw).useOTESystem();
    const r = await cl.request({
      COMMAND: "CheckDomains",
      DOMAIN: ["example.com", "example.net"],
    });
    expect(r.isSuccess(), r.getCommandPlain()).to.be.true;
  });

  it("request() auto-converts IDN domain values to punycode without altering the API command shape", async () => {
    tape.useCassette("idn-convert");
    cl.setCredentials(user, pw).useOTESystem();
    const r = await cl.request({
      COMMAND: "CheckDomains",
      DOMAIN: ["example.com", "dömäin.example", "example.net"],
    });
    expect(r.isSuccess()).to.be.true;
    expect(r.getCode()).to.equal(200);
    expect(r.getColumn("DOMAINCHECK")).to.not.be.null;

    const cmd = r.getCommand();
    const keys = Object.keys(cmd);
    expect(keys).to.include.members(["DOMAIN0", "DOMAIN1", "DOMAIN2"]);
    expect(keys).to.not.include("DOMAIN");
    expect(cmd["DOMAIN0"]).to.equal("example.com");
    expect(cmd["DOMAIN2"]).to.equal("example.net");
  });

  it("request() replays a temporary-error response identically in debug and non-debug mode", async () => {
    tape.useCassette("code-tmperror-dbg");
    cl.enableDebugMode().setCredentials(user, pw).useOTESystem();
    const r1 = await cl.request({ COMMAND: "StatusAccount" });
    expect(r1.isSuccess()).to.be.true;
    expect(r1.getCode()).to.equal(200);

    tape.useCassette("code-tmperror-nodbg");
    cl.disableDebugMode();
    const r2 = await cl.request({ COMMAND: "StatusAccount" });
    expect(r2.isSuccess()).to.be.true;
    expect(r2.getCode()).to.equal(200);
  });

  describe("POST body encoding", () => {
    // PHP's http_build_query() defaults to RFC1738 and encodes "*" as %2A;
    // URLSearchParams keeps it literal. The predecessor of this SDK carried a
    // fixedURLEnc() helper for exactly this class of mismatch, and the port
    // initially lost the "*" case, so the encoded body diverged from the PHP
    // SDK on any command carrying a wildcard.
    //
    // Failure mode: a CNR wildcard query (DOMAIN=*.com) goes on the wire with
    // different bytes than the PHP SDK sends for the same command.
    // Non-vacuity: drop the `.replace(/\*/g, "%2A")` in
    // AbstractSocketConfig.getPOSTData() and this fails.
    it("percent-encodes the same characters as PHP http_build_query()", () => {
      const cfg = new SocketConfig();
      cfg.setLogin("u");
      cfg.setPassword("p");
      // Verbatim output of the PHP SDK for the identical command.
      expect(
        cfg.getPOSTData({ COMMAND: "X", V: "a*b!c(d)e~f'g" }, false),
      ).to.equal(
        "s_login=u&s_pw=p&s_command=COMMAND%3DX%0AV%3Da%2Ab%21c%28d%29e%7Ef%27g",
      );
    });

    it("encodes a wildcard command value the way the API expects", () => {
      const cfg = new SocketConfig();
      expect(
        cfg.getPOSTData({ COMMAND: "QueryDomainList", DOMAIN: "*.com" }, false),
      ).to.contain("DOMAIN%3D%2A.com");
    });
  });

  describe("pagination", () => {
    it("requestNextResponsePage() advances FIRST/LIMIT and returns the next page", async () => {
      tape.useCassette("next-page-no-last");
      const r = await cl.request({
        COMMAND: "QueryDomainList",
        LIMIT: 2,
        FIRST: 0,
      });
      expect(r.isSuccess()).to.be.true;

      const nr = await cl.requestNextResponsePage(r);
      expect(nr).to.not.be.null;
      expect(nr?.isSuccess()).to.be.true;
      expect(nr?.getRecordsLimitation()).to.equal(2);
      expect(nr?.getFirstRecordIndex()).to.equal(2);
      expect(nr?.getLastRecordIndex()).to.equal(3);
      expect(r.getFirstRecordIndex()).to.equal(0);
      expect(r.getLastRecordIndex()).to.equal(1);
    });

    it("requestNextResponsePage() refuses a command that already carries LAST", async () => {
      tape.useCassette("next-page-last");
      const r = await cl.request({
        COMMAND: "QueryDomainList",
        LIMIT: 2,
        FIRST: 0,
        LAST: 1,
      });
      expect(r).to.be.instanceOf(R);
      let threw: unknown = null;
      try {
        await cl.requestNextResponsePage(r);
      } catch (err) {
        threw = err;
      }
      expect(threw).to.be.instanceOf(PaginationException);
      expect((threw as Error).message).to.include("Parameter LAST in use");
    });

    it("requestNextResponsePage() works without an explicit FIRST in the original command", async () => {
      tape.useCassette("next-page-no-first");
      cl.disableDebugMode();
      const r = await cl.request({ COMMAND: "QueryDomainList", LIMIT: 2 });
      expect(r.isSuccess()).to.be.true;

      const nr = await cl.requestNextResponsePage(r);
      expect(nr).to.not.be.null;
      expect(nr?.getFirstRecordIndex()).to.equal(2);
      expect(nr?.getLastRecordIndex()).to.equal(3);
    });

    it("a LIMIT=0 list response stops pagination instead of looping forever (RSRMID-2943)", () => {
      // Real CNR response shape for QueryDomainList with LIMIT=0: count/limit
      // come back as 0 while total reflects the full list size. Without the
      // guard, `first` never advances and requestAllResponsePages() would spin.
      const tpls = new RTM().addTemplate(
        "listLimitZero",
        "[RESPONSE]\r\nPROPERTY[COUNT][0]=0\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[LAST][0]=0\r\n" +
          "PROPERTY[LIMIT][0]=0\r\nPROPERTY[TOTAL][0]=1725494\r\n" +
          "DESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.286\r\nEOF\r\n",
      );
      const r = new R(
        "listLimitZero",
        { COMMAND: "QueryDomainList", FIRST: "0", LIMIT: "0" },
        {},
        {},
        null,
        null,
        tpls,
      );
      expect(r.isSuccess()).to.be.true;
      expect(r.getRecordsLimitation()).to.equal(0);
      expect(r.getRecordsTotalCount()).to.equal(1725494);
    });

    it("the final page of a multi-page list has no next page", () => {
      const tpls = new RTM().addTemplate(
        "listLastPage",
        "[RESPONSE]\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[FIRST][0]=8\r\nPROPERTY[LAST][0]=9\r\n" +
          "PROPERTY[LIMIT][0]=2\r\nPROPERTY[TOTAL][0]=10\r\n" +
          "DESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.286\r\nEOF\r\n",
      );
      const r = new R(
        "listLastPage",
        { COMMAND: "QueryDomainList", FIRST: "8", LIMIT: "2" },
        {},
        {},
        null,
        null,
        tpls,
      );
      expect(r.isSuccess()).to.be.true;
      expect(r.getPagination().hasNextPage()).to.be.false;
      expect(r.getPagination().getNextPageNumber()).to.be.null;
    });

    it("a window requested past the end of the list also has no next page (RSRMID-2943)", () => {
      const tpls = new RTM().addTemplate(
        "listPastTheEnd",
        "[RESPONSE]\r\nPROPERTY[COLUMN][0]=domain\r\nPROPERTY[COUNT][0]=0\r\nPROPERTY[FIRST][0]=20000000\r\n" +
          "PROPERTY[LAST][0]=20000000\r\nPROPERTY[LIMIT][0]=10\r\nPROPERTY[TOTAL][0]=1825824\r\n" +
          "DESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=15.892\r\nEOF\r\n",
      );
      const r = new R(
        "listPastTheEnd",
        { COMMAND: "QueryDomainList", FIRST: "20000000", LIMIT: "10" },
        {},
        {},
        null,
        null,
        tpls,
      );
      expect(r.isSuccess()).to.be.true;
      expect(r.getPagination().hasNextPage()).to.be.false;
    });

    it("requestAllResponsePages() walks every page and each is a success", async () => {
      tape.useCassette("all-pages");
      cl.setCredentials(user, pw).useOTESystem();
      const pages = await cl.requestAllResponsePages({
        COMMAND: "QueryDomainList",
        FIRST: 0,
        LIMIT: 100,
      });
      expect(pages.length).to.be.greaterThan(0);
      for (const p of pages) {
        expect(p).to.be.instanceOf(R);
        expect(p.isSuccess()).to.be.true;
      }
    });

    // getCommand() masks AUTH/PASSWORD (RSRMID-2938); requestNextResponsePage()
    // used to rebuild page 2+ from that masked copy, sending the literal "***"
    // as the real value (RSRMID-2975). SpyTransport exposes the exact wire
    // bytes of the second request, which a cassette (recorded raw responses
    // only) cannot.
    it("requestNextResponsePage() resends the real AUTH value, not the masked one", async () => {
      const raw =
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\n" +
        "PROPERTY[FIRST][0]=0\r\nPROPERTY[LAST][0]=1\r\n" +
        "PROPERTY[LIMIT][0]=2\r\nPROPERTY[TOTAL][0]=10\r\nEOF\r\n";
      const spy = new SpyTransport(raw);
      cl.setCredentials(user, pw).setTransport(spy);

      const r1 = await cl.request({
        COMMAND: "QueryDomainList",
        AUTH: "topsecret",
        LIMIT: 2,
        FIRST: 0,
      });
      // getCommand() itself must stay masked — this fix must not weaken
      // RSRMID-2938's guarantee for the response's own public accessor.
      expect(r1.getCommand()["AUTH"]).to.equal("***");

      const r2 = await cl.requestNextResponsePage(r1);
      expect(r2).to.not.be.null;
      expect(spy.data).to.include("AUTH%3Dtopsecret");
      expect(spy.data).to.not.include("AUTH%3D%2A%2A%2A");
    });

    // A Response this client did not produce is not in unmaskedCommands.
    // continuationCommand() detects a masked value by content, not by key,
    // so this holds even for a subclass widening sensitiveFields.
    it("requestNextResponsePage() throws rather than resend a masked value for a Response this client did not produce", async () => {
      const tpls = new RTM().addTemplate(
        "foreignPage",
        "[RESPONSE]\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[LAST][0]=1\r\n" +
          "PROPERTY[LIMIT][0]=2\r\nPROPERTY[TOTAL][0]=10\r\n" +
          "DESCRIPTION=OK\r\nCODE=200\r\nEOF\r\n",
      );
      const foreign = new R(
        "foreignPage",
        {
          COMMAND: "QueryDomainList",
          AUTH: "topsecret",
          FIRST: "0",
          LIMIT: "2",
        },
        {},
        {},
        null,
        null,
        tpls,
      );

      let threw: unknown = null;
      try {
        await cl.requestNextResponsePage(foreign);
      } catch (err) {
        threw = err;
      }
      expect(threw).to.be.instanceOf(PaginationException);
      expect((threw as Error).message).to.include("redaction mask");
    });

    it("requestNextResponsePage() still works for a Response this client did not produce when nothing in its command is masked", async () => {
      const tpls = new RTM().addTemplate(
        "foreignCleanPage",
        "[RESPONSE]\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[LAST][0]=1\r\n" +
          "PROPERTY[LIMIT][0]=2\r\nPROPERTY[TOTAL][0]=10\r\n" +
          "DESCRIPTION=OK\r\nCODE=200\r\nEOF\r\n",
      );
      const foreign = new R(
        "foreignCleanPage",
        { COMMAND: "QueryDomainList", FIRST: "0", LIMIT: "2" },
        {},
        {},
        null,
        null,
        tpls,
      );

      const spy = new SpyTransport(
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n",
      );
      cl.setCredentials(user, pw).setTransport(spy);

      const next = await cl.requestNextResponsePage(foreign);
      expect(next).to.not.be.null;
    });
  });

  it("sorts command parameters by CommandFormatter's priority map", async () => {
    tape.useCassette("sort-command-params");
    cl.setCredentials(user, pw).useOTESystem();
    const r = await cl.request({
      ZZZLAST: "z",
      COMMAND: "StatusAccount",
      AAAFIRST: "a",
    });
    const keys = Object.keys(r.getCommand());
    expect(keys.indexOf("COMMAND")).to.be.lessThan(keys.indexOf("AAAFIRST"));
    expect(keys.indexOf("COMMAND")).to.be.lessThan(keys.indexOf("ZZZLAST"));
  });

  describe("session persistence (saveSession/reuseSession)", () => {
    it("saveSession() writes login+session into a session-like object", async () => {
      tape.useCassette("login-creds-ok");
      cl.setCredentials(user, pw).useOTESystem();
      await cl.login();

      const session: { socketcfg?: unknown } = {};
      expect(cl.saveSession(session)).to.equal(cl);
      expect(session["socketcfg"]).to.deep.equal({
        login: cl.getSocketConfig().getLogin(),
        session: cl.getSocketConfig().getSession(),
      });
    });

    it("reuseSession() restores credentials then the session, in that order", () => {
      const session = {
        socketcfg: { login: "restored.user", session: "SESSION-XYZ" },
      };
      const fresh = CF.cnr();

      expect(fresh.reuseSession(session)).to.equal(fresh);
      expect(fresh.getSocketConfig().getLogin()).to.equal("restored.user");
      expect(fresh.getSession()).to.equal("SESSION-XYZ");
    });

    it("reuseSession() is a no-op for a malformed or absent session object", () => {
      const fresh = CF.cnr();
      expect(fresh.reuseSession({})).to.equal(fresh);
      expect(fresh.getSession()).to.be.null;

      expect(
        fresh.reuseSession({ socketcfg: { login: "only-login" } }),
      ).to.equal(fresh);
      expect(fresh.getSession()).to.be.null;
    });
  });
});
