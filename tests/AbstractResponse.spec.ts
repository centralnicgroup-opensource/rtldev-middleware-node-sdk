import { expect } from "chai";
import "mocha";
import { Response as R } from "../src/CNR/Response.ts";

/**
 * AbstractResponse — the shared pagination derivations (decision 5: 4
 * per-brand primitives, assembled into a `Paginator` — see
 * `tests/Paginator.spec.ts` for the arithmetic itself, RSRMID-2965) and the
 * sealed iteration contract (RSRMID-2939), exercised through CNR.Response
 * as a concrete vehicle since AbstractResponse itself is abstract.
 */
describe("AbstractResponse (via CNR.Response)", () => {
  function listResponse(
    first: number,
    last: number,
    limit: number,
    total: number,
  ): R {
    return new R(
      `[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\n` +
        `PROPERTY[FIRST][0]=${first}\r\nPROPERTY[LAST][0]=${last}\r\n` +
        `PROPERTY[LIMIT][0]=${limit}\r\nPROPERTY[TOTAL][0]=${total}\r\nEOF\r\n`,
    );
  }

  // The pagination arithmetic itself is exercised directly, as constructor
  // calls with no wire payload, in tests/Paginator.spec.ts (RSRMID-2965).
  // What belongs here is the wiring: getPagination() must assemble the
  // Paginator from exactly this response's own four primitives plus its
  // record count, not from some other reading of the same response.
  it("getPagination() assembles the Paginator from this response's own four primitives and record count", () => {
    const r = listResponse(2, 3, 2, 10);
    const pg = r.getPagination();
    expect(pg.toArray()).to.deep.equal({
      COUNT: r.getRecordsCount(),
      CURRENTPAGE: pg.getCurrentPageNumber(),
      FIRST: r.getFirstRecordIndex(),
      LAST: r.getLastRecordIndex(),
      LIMIT: r.getRecordsLimitation(),
      NEXTPAGE: pg.getNextPageNumber(),
      PAGES: pg.getNumberOfPages(),
      PREVIOUSPAGE: pg.getPreviousPageNumber(),
      TOTAL: r.getRecordsTotalCount(),
    });
    expect(r.getFirstRecordIndex()).to.equal(2);
    expect(r.getLastRecordIndex()).to.equal(3);
    expect(r.getRecordsLimitation()).to.equal(2);
    expect(r.getRecordsTotalCount()).to.equal(10);
  });

  it("getPagination() returns a fresh Paginator each call, over numbers that cannot change on a sealed response", () => {
    const r = listResponse(2, 3, 2, 10);
    expect(r.getPagination()).to.not.equal(r.getPagination());
    expect(r.getPagination().toArray()).to.deep.equal(
      r.getPagination().toArray(),
    );
  });

  describe("getRecord()", () => {
    it("returns the record in range and null out of range (negative or too large)", () => {
      const r = new R(
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[DOMAIN][0]=a.com\r\nPROPERTY[DOMAIN][1]=b.com\r\nEOF\r\n",
      );
      expect(r.getRecord(0)?.getDataByKey("DOMAIN")).to.equal("a.com");
      expect(r.getRecord(-1)).to.be.null;
      expect(r.getRecord(5)).to.be.null;
    });
  });

  it("[Symbol.iterator]() yields a fresh iterator per call over an immutable list", () => {
    const r = new R(
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[DOMAIN][0]=a.com\r\nPROPERTY[DOMAIN][1]=b.com\r\nEOF\r\n",
    );
    const first = [...r].map((rec) => rec.getDataByKey("DOMAIN"));
    const second = [...r].map((rec) => rec.getDataByKey("DOMAIN"));
    expect(first).to.deep.equal(["a.com", "b.com"]);
    expect(second).to.deep.equal(first);
  });

  // Pagination/status metadata is not column data (RSRMID-2965): a key
  // matching CNR.Response's metaKeys never becomes a column at all, so
  // there is nothing left for a filtering parameter to strip.
  it("getColumnKeys() never includes pagination metadata keys", () => {
    const r = listResponse(0, 1, 2, 10);
    expect(r.getColumnKeys()).to.deep.equal([]);
    expect(r.getColumn("FIRST")).to.be.null;
    expect(r.getColumn("TOTAL")).to.be.null;
  });

  it("getCommand()/getCommandPlain() reflect the sorted, sanitized command", () => {
    const r = new R("[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n", {
      COMMAND: "StatusAccount",
    });
    expect(r.getCommand()).to.deep.equal({ COMMAND: "StatusAccount" });
    expect(r.getCommandPlain()).to.equal("COMMAND = StatusAccount\n");
  });

  // PHP's identical `return $this->columns;`/`$this->records;`/`$this->hash;`
  // is safe because PHP arrays are copy-on-write value types; JS arrays and
  // objects are references, so the same code returned the live internal
  // state. Sealed-response (decision 18) means external code must not be
  // able to mutate a Response after construction — confirmed as a real,
  // reachable bug (not just a theoretical one) before being fixed.
  describe("sealed response: getters return copies, not live internal state", () => {
    const raw =
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[DOMAIN][0]=a.com\r\nEOF\r\n";

    it("mutating the array from getColumns() does not add a real column", () => {
      const r = new R(raw);
      const before = r.getColumns().length;
      r.getColumns().push(...r.getColumns());
      expect(r.getColumns()).to.have.lengthOf(before);
    });

    it("mutating the array from getColumnKeys() does not desync getColumn()", () => {
      const r = new R(raw);
      const keys = r.getColumnKeys();
      keys.push("PHANTOM");
      expect(r.getColumnKeys()).to.not.include("PHANTOM");
      expect(r.getColumn("PHANTOM")).to.be.null;
    });

    it("mutating the array from getRecords() does not add a real record", () => {
      const r = new R(raw);
      const before = r.getRecords().length;
      r.getRecords().push(...r.getRecords());
      expect(r.getRecords()).to.have.lengthOf(before);
    });

    it("mutating the object from getHash() does not change the response's own hash", () => {
      const r = new R(raw);
      const hash = r.getHash();
      hash["CODE"] = "500";
      delete hash["DESCRIPTION"];
      expect(r.getHash()["CODE"]).to.equal("200");
      expect(r.getCode()).to.equal(200);
      expect(r.getDescription()).to.equal("OK");
    });
  });
});
