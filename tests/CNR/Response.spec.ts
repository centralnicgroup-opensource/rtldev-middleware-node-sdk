import { expect } from "chai";
import "mocha";
import { Response as R } from "../../src/CNR/Response.ts";

/**
 * CNR.Response — the ExtendedResponseInterface capabilities that are CNR-only
 * (decision 6: getQueuetime/getRuntime/isTmpError/isPending/getListHash),
 * the code-derived isError()/isSuccess()/isTmpError() classification, and the
 * pagination primitives' column-present vs. column-absent branches.
 */
describe("CNR.Response", () => {
  const success =
    "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nQUEUETIME=1.5\r\nRUNTIME=0.25\r\nEOF\r\n";

  it("classifies 2xx/4xx/5xx codes as success/temporary-error/error respectively", () => {
    const ok = new R("[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n");
    expect(ok.isSuccess()).to.be.true;
    expect(ok.isError()).to.be.false;
    expect(ok.isTmpError()).to.be.false;

    const tmp = new R(
      "[RESPONSE]\r\nCODE=421\r\nDESCRIPTION=Temporary\r\nEOF\r\n",
    );
    expect(tmp.isTmpError()).to.be.true;
    expect(tmp.isSuccess()).to.be.false;
    expect(tmp.isError()).to.be.false;

    const err = new R("[RESPONSE]\r\nCODE=505\r\nDESCRIPTION=Error\r\nEOF\r\n");
    expect(err.isError()).to.be.true;
    expect(err.isSuccess()).to.be.false;
  });

  it("getQueuetime()/getRuntime() read the wire values, or 0 when absent", () => {
    const r = new R(success);
    expect(r.getQueuetime()).to.equal(1.5);
    expect(r.getRuntime()).to.equal(0.25);

    const bare = new R("[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n");
    expect(bare.getQueuetime()).to.equal(0);
    expect(bare.getRuntime()).to.equal(0);
  });

  it('isPending() keys off PENDING === "1", not a COMMAND/STATUS heuristic (behaviour gap #4)', () => {
    const pending = new R(
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPENDING=1\r\nEOF\r\n",
    );
    expect(pending.isPending()).to.be.true;

    const notPending = new R(
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPENDING=0\r\nEOF\r\n",
    );
    expect(notPending.isPending()).to.be.false;

    const absent = new R(success);
    expect(absent.isPending()).to.be.false;
  });

  // Pagination counters are read straight off the wire, not derived from
  // the record list, and are not registered as columns at all (RSRMID-2965
  // — PHP-SDK v33.0.0's identical change). No brand ever falls back to
  // getRecordsCount() for these four.
  describe("pagination primitives — counter present vs. absent", () => {
    it("getFirstRecordIndex()/getLastRecordIndex() read FIRST/LAST counters when present", () => {
      const r = new R(
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[FIRST][0]=4\r\nPROPERTY[LAST][0]=9\r\nEOF\r\n",
      );
      expect(r.getFirstRecordIndex()).to.equal(4);
      expect(r.getLastRecordIndex()).to.equal(9);
    });

    it("is null when FIRST/LAST counters are absent, even though records exist", () => {
      const r = new R(
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[DOMAIN][0]=a.com\r\nPROPERTY[DOMAIN][1]=b.com\r\nEOF\r\n",
      );
      expect(r.getFirstRecordIndex()).to.be.null;
      expect(r.getLastRecordIndex()).to.be.null;
      // The two data rows are still there — only the pagination reading changed.
      expect(r.getRecordsCount()).to.equal(2);
    });

    it("is null when there are neither FIRST/LAST counters nor any records", () => {
      const r = new R(success);
      expect(r.getFirstRecordIndex()).to.be.null;
      expect(r.getLastRecordIndex()).to.be.null;
    });

    it("getRecordsTotalCount()/getRecordsLimitation() are null (not a record-count fallback) when absent", () => {
      const r = new R(
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[DOMAIN][0]=a.com\r\nEOF\r\n",
      );
      expect(r.getRecordsTotalCount()).to.be.null;
      expect(r.getRecordsLimitation()).to.be.null;
    });

    it("getRecordsLimitation() distinguishes a real LIMIT=0 from absent (RSRMID-2943)", () => {
      const r = new R(
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nPROPERTY[LIMIT][0]=0\r\nEOF\r\n",
      );
      expect(r.getRecordsLimitation()).to.equal(0);
    });
  });

  // RSRMID-2965's actual defect: a one-cell TOTAL/COUNT/FIRST/LAST/LIMIT
  // "column" beside real data columns made assembleRecords() size the row
  // list as the max over every column, so an empty window carrying nothing
  // but pagination metadata reported one phantom record — pure metadata,
  // no real data — instead of zero. Reverting the populate() skip (or the
  // metaKeys match) makes this report 1, not 0.
  it("an empty window reports 0 records, not a phantom metadata record", () => {
    const r = new R(
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\n" +
        "PROPERTY[COUNT][0]=0\r\nPROPERTY[FIRST][0]=20\r\nPROPERTY[LAST][0]=20\r\n" +
        "PROPERTY[LIMIT][0]=10\r\nPROPERTY[TOTAL][0]=15\r\nEOF\r\n",
    );
    expect(r.getRecordsCount()).to.equal(0);
    expect(r.getColumnKeys()).to.deep.equal([]);
    expect([...r]).to.have.lengthOf(0);
  });

  it("getListHash() never carries pagination metadata as row data, and includes meta", () => {
    const r = new R(
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\n" +
        "PROPERTY[DOMAIN][0]=a.com\r\nPROPERTY[DOMAIN][1]=b.com\r\n" +
        "PROPERTY[TOTAL][0]=2\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[LAST][0]=1\r\nEOF\r\n",
    );
    const lh = r.getListHash() as {
      LIST: { [k: string]: unknown }[];
      meta: { columns: string[]; pg: { [key: string]: number | null } };
    };
    expect(lh.LIST).to.have.lengthOf(2);
    expect(lh.LIST[0]).to.deep.equal({ DOMAIN: "a.com" });
    expect(lh.meta.columns).to.deep.equal(["DOMAIN"]);

    // meta.pg must be the flat object Paginator.toArray() produces, not the
    // Paginator instance itself — a table renderer's payload, whose key set
    // is consumer-facing and stays byte-identical to the pre-RSRMID-2965
    // shape. An exact deep.equal, not key-presence checks, because a raw
    // Paginator would still be "an object with the right keys" if the
    // getters were public own-enumerable properties — the shape has to be
    // pinned exactly.
    expect(lh.meta.pg).to.deep.equal({
      COUNT: 2,
      CURRENTPAGE: null,
      FIRST: 0,
      LAST: 1,
      LIMIT: null,
      NEXTPAGE: null,
      PAGES: 1,
      PREVIOUSPAGE: null,
      TOTAL: 2,
    });
  });
});
