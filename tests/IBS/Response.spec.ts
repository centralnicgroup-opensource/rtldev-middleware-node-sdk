import { expect } from "chai";
import "mocha";
import { Response as R } from "../../src/IBS/Response.ts";

/**
 * Response-level behaviour for IBS, ported from PHP's IBS/ResponseTest.php.
 * The parser has its own direct tests in ResponseParser.spec.ts — assertions
 * here go through a constructed Response, not the parser in isolation.
 */
describe("IBS.Response", () => {
  it("masks sensitive command fields case-insensitively", () => {
    const r = new R("{}", {
      command: "RegisterDomain",
      password: "secret",
      TransferAuthInfo: "qCg+ic'G1m",
    });
    const cmd = r.getCommand();
    expect(cmd["password"]).to.equal("***");
    expect(cmd["TransferAuthInfo"]).to.equal("***");
  });

  describe("construction and error templates", () => {
    it("an empty raw response resolves to the FAILURE template", () => {
      const r = new R("");
      expect(r.getHash()["status"]).to.equal("FAILURE");
      expect(r.getDescription()).to.equal(
        "423 Empty API response. Probably unreachable API end point",
      );
    });

    it("a transport error travels as the declared error parameter, not encoded into raw", () => {
      const r = new R("", {}, {}, {}, null, "Connection timed out");
      expect(r.isError()).to.be.true;
      expect(r.getHash()["status"]).to.equal("FAILURE");
      expect(r.getDescription()).to.include("Connection timed out");
    });

    it("a raw payload equal to a known template id resolves against the built-in registry", () => {
      const r = new R("notfound");
      expect(r.isError()).to.be.true;
      expect(r.getHash()["status"]).to.equal("FAILURE");
      expect(r.getDescription()).to.include("Response Template not found");
    });

    it("an empty response with ResponseFormat=JSON still resolves to FAILURE", () => {
      const r = new R("", { ResponseFormat: "JSON" });
      expect(r.isError()).to.be.true;
      expect(r.getHash()["status"]).to.equal("FAILURE");
      expect(r.getDescription()).to.include("Empty API response");
    });

    // Regression guard for RSRMID-2945: translate() used to read
    // `raw === "" || raw === "0"`, a transliteration artifact of PHP's falsy
    // check (both "" and "0" are false there), so a real "0" payload was
    // reported as an empty response. "0" matches no registered template id
    // and carries no status field, so it must fall through to the "invalid"
    // template like any other unparseable body — never to "empty".
    it("a literal '0' raw response is not treated as empty", () => {
      const r = new R("0");
      expect(r.getDescription()).to.not.include("Empty API response");
      expect(r.getHash()["status"]).to.equal("FAILURE");
      expect(r.getDescription()).to.equal(
        "423 Invalid API response. Contact Support",
      );
    });
  });

  describe("JSON responses (ResponseFormat=JSON)", () => {
    it("a SUCCESS response reports success and exposes the raw hash", () => {
      const cmd = { ResponseFormat: "JSON" };
      const json =
        '{"transactid":"xyz789","status":"SUCCESS","domain":"ibstest.com","expirationdate":"2026/02/20"}';
      const r = new R(json, cmd);
      expect(r.isSuccess()).to.be.true;
      expect(r.getHash()["status"]).to.equal("SUCCESS");
      expect(r.getHash()["domain"]).to.equal("ibstest.com");
      expect(r.getHash()["expirationdate"]).to.equal("2026/02/20");
    });

    it("a FAILURE response reports an error, surfaces the message, and derives the code", () => {
      const cmd = { ResponseFormat: "JSON" };
      const json =
        '{"transactid":"abc123","status":"FAILURE","message":"Permission denied! \\"available123test.com\\" permission is not granted.","code":100005}';
      const r = new R(json, cmd);
      expect(r.isError()).to.be.true;
      expect(r.getHash()["status"]).to.equal("FAILURE");
      expect(r.getDescription()).to.include("Permission denied!");
      expect(r.getCode()).to.equal(100005);
    });

    // RSRMID-2974's actual deliverable: Domain/Check reports AVAILABLE/UNAVAILABLE
    // as ordinary success statuses. Only FAILURE is an error — asserted
    // explicitly here because it is easy to mistake "not AVAILABLE" for "an error".
    it("Domain/Check AVAILABLE is a success, not an error", () => {
      const cmd = { ResponseFormat: "JSON" };
      const json =
        '{"transactid":"t1","status":"AVAILABLE","domain":"free-example.com","price":{"ispremium":"NO"}}';
      const r = new R(json, cmd);
      expect(r.isError()).to.be.false;
      expect(r.isSuccess()).to.be.true;
      expect(r.getHash()["status"]).to.equal("AVAILABLE");
    });

    it("Domain/Check UNAVAILABLE is a success, not an error", () => {
      const cmd = { ResponseFormat: "JSON" };
      const json =
        '{"transactid":"t2","status":"UNAVAILABLE","domain":"tronexats.com","price":{"ispremium":"NO"}}';
      const r = new R(json, cmd);
      expect(r.isError()).to.be.false;
      expect(r.isSuccess()).to.be.true;
      expect(r.getHash()["status"]).to.equal("UNAVAILABLE");
    });

    it("Domain/Check FAILURE (the only error status) is an error", () => {
      const cmd = { ResponseFormat: "JSON" };
      const json =
        '{"transactid":"t3","status":"FAILURE","message":"Invalid domain name."}';
      const r = new R(json, cmd);
      expect(r.isError()).to.be.true;
      expect(r.isSuccess()).to.be.false;
      expect(r.getDescription()).to.include("Invalid domain name.");
    });

    it("a Domain/Info-shaped response preserves nested objects/arrays and assembles records", () => {
      const cmd = { ResponseFormat: "JSON" };
      const data = {
        transactid: "8986680508b740347a73e339b5c3bd67",
        status: "SUCCESS",
        domain: "ibstest.com",
        expirationdate: "2026/02/20",
        registrationdate: "2025/02/20",
        paiduntil: "2026/02/20",
        domainstatus: "EXPIRED",
        contacts: {
          registrant: { firstname: "Middle", lastname: "Ware" },
          admin: { firstname: "Kai", lastname: "Schwarz" },
        },
        nameserver: ["ns1.ispapi.net", "ns2.ispapi.net"],
        transferauthinfo: "qCg+ic'G1m",
      };
      const r = new R(JSON.stringify(data), cmd);
      expect(r.isSuccess()).to.be.true;
      expect(r.getHash()["domain"]).to.equal("ibstest.com");
      expect(r.getHash()["expirationdate"]).to.equal("2026/02/20");
      expect(r.getHash()["registrationdate"]).to.equal("2025/02/20");
      expect(r.getHash()["paiduntil"]).to.equal("2026/02/20");
      expect(r.getHash()["contacts"]).to.deep.equal(data.contacts);
      const nameserver = r.getHash()["nameserver"] as string[];
      expect(nameserver[0]).to.equal("ns1.ispapi.net");

      // One column per top-level JSON key, except the two metadata keys
      // (transactid, status), which are not columns at all (RSRMID-2965):
      // 10 top-level keys - 2 metadata = 8.
      expect(r.getColumns()).to.have.lengthOf(8);
      const colKeys = r.getColumnKeys();
      expect(colKeys).to.include("domain");
      expect(colKeys).to.include("nameserver");
      expect(colKeys).to.include("contacts");
      expect(colKeys).to.not.include("transactid");
      expect(colKeys).to.not.include("status");

      // Two records: nameserver is the longest column (length 2).
      expect(r.getRecords()).to.have.lengthOf(2);
    });
  });

  // IBS returns its whole result set in one page, so all four pagination
  // primitives are derived from a single wire count key — RSRMID-2965,
  // matching PHP-SDK v33.0.0. The key's name is endpoint-dependent; the scan
  // must recognise all four documented shapes.
  describe("pagination primitives — the endpoint-dependent count key", () => {
    const countKeyShapes: [string, string][] = [
      ["Domain/List", "domaincount"],
      ["Url-/EmailForward/List", "total_rules"],
      ["DnsRecord/List", "total_records"],
      ["Nameserver/List", "total_hosts"],
    ];
    for (const [endpoint, key] of countKeyShapes) {
      it(`recognises ${key} (${endpoint}) and derives all four primitives from it`, () => {
        const r = new R(JSON.stringify({ status: "SUCCESS", [key]: 3 }), {
          ResponseFormat: "JSON",
        });
        expect(r.getFirstRecordIndex()).to.equal(0);
        expect(r.getLastRecordIndex()).to.equal(2);
        expect(r.getRecordsTotalCount()).to.equal(3);
        expect(r.getRecordsLimitation()).to.equal(3);
      });
    }

    it("accepts a numeric string, since the JSON wire is not consistent about quoting counts", () => {
      const r = new R(JSON.stringify({ status: "SUCCESS", domaincount: "5" }), {
        ResponseFormat: "JSON",
      });
      expect(r.getRecordsTotalCount()).to.equal(5);
    });

    it("an empty list (count key present but zero) is a real, valid answer, not absence", () => {
      const r = new R(JSON.stringify({ status: "SUCCESS", domaincount: 0 }), {
        ResponseFormat: "JSON",
      });
      expect(r.getFirstRecordIndex()).to.equal(0);
      expect(r.getLastRecordIndex()).to.be.null;
      expect(r.getRecordsTotalCount()).to.equal(0);
      expect(r.getRecordsLimitation()).to.equal(0);
    });

    it("is null on every primitive when this response carries no count key (not a list)", () => {
      const r = new R(JSON.stringify({ status: "SUCCESS", domain: "a.com" }), {
        ResponseFormat: "JSON",
      });
      expect(r.getFirstRecordIndex()).to.be.null;
      expect(r.getLastRecordIndex()).to.be.null;
      expect(r.getRecordsTotalCount()).to.be.null;
      expect(r.getRecordsLimitation()).to.be.null;
    });

    it("does not mistake a real per-TLD 'discount' key, or Domain/Count's 'totaldomains', for a count key", () => {
      const r = new R(
        JSON.stringify({ status: "SUCCESS", discount: 1, totaldomains: 42 }),
        { ResponseFormat: "JSON" },
      );
      expect(r.getRecordsTotalCount()).to.be.null;
      expect(r.getColumnKeys()).to.include.members([
        "discount",
        "totaldomains",
      ]);
    });
  });

  describe("getCode()", () => {
    it("falls back to a per-product nested code when there is no top-level one", () => {
      const json =
        '{"status":"SUCCESS","product":[{"code":210,"message":"Available"}]}';
      const r = new R(json, { ResponseFormat: "JSON" });
      expect(r.getCode()).to.equal(210);
      expect(r.getDescription()).to.equal("Available");
    });

    it("derives 200/500 from isSuccess() when neither a top-level nor a nested code is present", () => {
      const ok = new R('{"status":"SUCCESS"}', { ResponseFormat: "JSON" });
      expect(ok.getCode()).to.equal(200);

      const failure = new R('{"status":"FAILURE"}', { ResponseFormat: "JSON" });
      expect(failure.getCode()).to.equal(500);
      expect(failure.getDescription()).to.equal("Command failed");
    });

    it("treats a non-numeric top-level code as absent and falls through", () => {
      const json =
        '{"status":"SUCCESS","code":"not-a-number","product":[{"code":210}]}';
      const r = new R(json, { ResponseFormat: "JSON" });
      expect(r.getCode()).to.equal(210);
    });
  });

  describe("ExtendedResponseInterface capabilities are absent (CNR-only, decision 6)", () => {
    it("has no getQueuetime/getRuntime/isTmpError/isPending/getListHash", () => {
      const r = new R('{"status":"SUCCESS"}', {
        ResponseFormat: "JSON",
      }) as unknown as { [key: string]: unknown };
      for (const method of [
        "getQueuetime",
        "getRuntime",
        "isTmpError",
        "isPending",
        "getListHash",
      ]) {
        expect(method in r, `IBS.Response must not carry ${method}`).to.be
          .false;
      }
    });
  });
});
