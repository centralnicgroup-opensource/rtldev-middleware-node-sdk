import { expect } from "chai";
import "mocha";
import { Paginator } from "../src/Paginator.ts";

/**
 * The pagination arithmetic, exercised directly (RSRMID-2965).
 *
 * Every case here is a constructor call. That is the point of extracting the
 * derivation off `AbstractResponse`: the same coverage used to require a
 * hand-authored API response per case, and offset grids no brand emits
 * could not be expressed at all. The wire-shape cases below (the three
 * observed empty CNR windows, the IBS single page) are stated as the tuple
 * a brand's primitives would answer with, so this file documents the grids
 * the SDK has actually met without depending on a parser to reproduce them
 * — the brand tests (`tests/CNR/Response.spec.ts`, `tests/IBS/Response.spec.ts`)
 * still assert that each brand reads those numbers off its own wire format.
 */
describe("Paginator", () => {
  it("an aligned first page: page 1, a next page, no previous one", () => {
    const pg = new Paginator(0, 9, 100, 10, 10);

    expect(pg.getCurrentPageNumber()).to.equal(1);
    expect(pg.hasNextPage()).to.be.true;
    expect(pg.getNextPageNumber()).to.equal(2);
    expect(pg.hasPreviousPage()).to.be.false;
    expect(pg.getPreviousPageNumber()).to.be.null;
    expect(pg.getNumberOfPages()).to.equal(10);
  });

  it("an aligned middle page pages in both directions", () => {
    const pg = new Paginator(10, 19, 100, 10, 10);

    expect(pg.getCurrentPageNumber()).to.equal(2);
    expect(pg.getNextPageNumber()).to.equal(3);
    expect(pg.hasPreviousPage()).to.be.true;
    expect(pg.getPreviousPageNumber()).to.equal(1);
  });

  it("the last page has no next one, reported as false/null rather than a page beyond the end", () => {
    const pg = new Paginator(90, 99, 100, 10, 10);

    expect(pg.getCurrentPageNumber()).to.equal(10);
    expect(pg.hasNextPage()).to.be.false;
    expect(pg.getNextPageNumber()).to.be.null;
    expect(pg.getPreviousPageNumber()).to.equal(9);
  });

  it("a short tail window is still the last page: fewer rows than the limit does not invent a further page", () => {
    const pg = new Paginator(20, 24, 25, 10, 5);

    expect(pg.getCurrentPageNumber()).to.equal(3);
    expect(pg.hasNextPage()).to.be.false;
    expect(pg.getNumberOfPages()).to.equal(3);
  });

  // FIRST=50 with LIMIT=100 is "page 1" by page arithmetic, but its next
  // request starts at offset 150, which lands on page 2, and it genuinely
  // has something before it even though it does not sit on a page
  // boundary. A page-number implementation reports "no previous page"
  // here; an offset one does not.
  it("an unaligned window pages from the offset grid", () => {
    const pg = new Paginator(50, 149, 1000, 100, 100);

    expect(pg.getCurrentPageNumber()).to.equal(1);
    expect(pg.hasNextPage()).to.be.true;
    expect(
      pg.getNextPageNumber(),
      "the next request starts at offset 150",
    ).to.equal(2);
    expect(
      pg.hasPreviousPage(),
      "FIRST > 0, so there is something before this window",
    ).to.be.true;
    expect(pg.getPreviousPageNumber()).to.equal(1);
  });

  // The first two observed empty CNR windows: a non-positive limit.
  // `LAST + 1 < TOTAL` holds for both, so the offset arithmetic alone would
  // report a next page and a walk would restart near the beginning of the
  // list. The non-positive-limit gate is what refuses them.
  it("an empty window with a non-positive limit has no next page", () => {
    const atStart = new Paginator(0, 0, 1825820, 0, 0);
    const farOut = new Paginator(2000000, 2000000, 1825824, 0, 0);

    for (const pg of [atStart, farOut]) {
      expect(pg.hasNextPage(), "a window of no rows cannot advance").to.be
        .false;
      expect(pg.getNextPageNumber()).to.be.null;
      expect(pg.hasPreviousPage(), "nor page backwards").to.be.false;
      expect(pg.getCurrentPageNumber(), "and has no meaningful page number").to
        .be.null;
      expect(pg.getNumberOfPages()).to.equal(0);
    }
  });

  // The third observed empty CNR window: a positive limit at an offset past
  // the end. This one self-terminates on the arithmetic, because LAST
  // echoes FIRST.
  it("an empty window past the end has no next page", () => {
    const pg = new Paginator(20000000, 20000000, 1825824, 10, 0);

    expect(pg.hasNextPage()).to.be.false;
    expect(pg.hasPreviousPage(), "there is a whole list before this offset").to
      .be.true;
    expect(pg.getNumberOfPages(), "ceil(1825824 / 10)").to.equal(182583);
  });

  // The defensive LAST < FIRST gate: a window that ends before it starts is
  // refused rather than sending the walk backwards. No observed CNR
  // response does this — an empty window echoes LAST = FIRST — so this
  // pins the invariant CNR.Client's FIRST = LAST + 1 advance depends on
  // for monotonicity, against a future wire change or a substitute parser.
  it("a window ending before it starts has no next page", () => {
    const pg = new Paginator(100, 50, 1000, 10, 0);

    expect(pg.hasNextPage()).to.be.false;
    expect(pg.getNextPageNumber()).to.be.null;
  });

  it("a single-page brand (IBS): total == limit == the wire count answers 'one page, no next page' from arithmetic", () => {
    const pg = new Paginator(0, 2, 3, 3, 3);

    expect(pg.getCurrentPageNumber()).to.equal(1);
    expect(pg.hasNextPage()).to.be.false;
    expect(pg.hasPreviousPage()).to.be.false;
    expect(pg.getNumberOfPages()).to.equal(1);
  });

  it("an empty single-page list (IBS domaincount: 0): a count key is present, so the grid exists, but pages through nothing", () => {
    const pg = new Paginator(0, null, 0, 0, 0);

    expect(pg.getNumberOfPages()).to.equal(0);
    expect(pg.hasNextPage()).to.be.false;
    expect(pg.getCurrentPageNumber()).to.be.null;
  });

  // A response that carries no pagination metadata at all but does hold
  // rows is an implicit single page — the rule that lets a non-list
  // response answer every pagination question honestly instead of with
  // stand-ins.
  it("no metadata with rows is an implicit single page", () => {
    const pg = new Paginator(null, null, null, null, 1);

    expect(pg.getNumberOfPages()).to.equal(1);
    expect(pg.getCurrentPageNumber()).to.be.null;
    expect(pg.hasNextPage()).to.be.false;
    expect(pg.hasPreviousPage()).to.be.false;
    expect(pg.getNextPageNumber()).to.be.null;
    expect(pg.getPreviousPageNumber()).to.be.null;
  });

  it("no metadata and no rows has no pages", () => {
    const pg = new Paginator(null, null, null, null, 0);

    expect(pg.getNumberOfPages()).to.equal(0);
  });

  // 0 and null stay different answers all the way through: a requested
  // limit of zero is a fact about the request, an absent one is the
  // absence of a list.
  it("0 is not null", () => {
    const requested = new Paginator(0, 0, 0, 0, 0).toArray();
    const absent = new Paginator(null, null, null, null, 0).toArray();

    expect(requested["LIMIT"]).to.equal(0);
    expect(requested["TOTAL"]).to.equal(0);
    expect(absent["LIMIT"]).to.be.null;
    expect(absent["TOTAL"]).to.be.null;
  });

  // toArray() is the published projection: CNR.Response.getListHash() puts
  // it under meta.pg, so its keys and their order are consumer-facing.
  it("toArray() is the wire-facing projection, exact shape", () => {
    const pg = new Paginator(10, 19, 100, 10, 10);

    expect(pg.toArray()).to.deep.equal({
      COUNT: 10,
      CURRENTPAGE: 2,
      FIRST: 10,
      LAST: 19,
      LIMIT: 10,
      NEXTPAGE: 3,
      PAGES: 10,
      PREVIOUSPAGE: 1,
      TOTAL: 100,
    });
  });

  it("the row count reported is the one it was given, not re-derived from the offsets", () => {
    const pg = new Paginator(0, 9, 100, 10, 3);

    expect(pg.toArray()["COUNT"]).to.equal(3);
  });

  // The Node-only trap: TS `private` fields are ordinary own-enumerable
  // instance properties at runtime, so JSON.stringify() would otherwise
  // walk internal field names (currentPage, hasNext, nextPage, ...)
  // instead of the wire-facing shape toArray() publishes, with no compiler
  // warning. toJSON() is what JSON.stringify()/JSON.parse() call first.
  it("JSON.stringify() publishes the same shape as toArray(), not internal field names", () => {
    const pg = new Paginator(10, 19, 100, 10, 10);

    const serialized = JSON.parse(JSON.stringify(pg));
    expect(serialized).to.deep.equal(pg.toArray());
    expect(serialized).to.not.have.property("currentPage");
    expect(serialized).to.not.have.property("hasNext");
    expect(serialized).to.not.have.property("nextPage");
  });

  // A second Node-only trap in the same family. PHP divides these offsets
  // with intdiv(), which truncates toward zero; Math.floor rounds toward
  // -Inf, so the two agree on every non-negative offset and silently
  // disagree below zero. Nothing clamps FIRST on the way in — CNR's
  // metaInt() casts what the wire sent, exactly as PHP casts it — so a
  // malformed response is all it takes to reach this. Pinned against the
  // value PHP's own Paginator returns for the same arguments.
  it("a negative offset truncates toward zero, as PHP's intdiv() does, not toward -Inf", () => {
    const pg = new Paginator(-5, 10, 100, 2, 5);

    expect(pg.getCurrentPageNumber()).to.equal(-1);
  });

  it("a negative next-page offset truncates the same way", () => {
    const pg = new Paginator(-9, -6, 100, 2, 3);

    expect(pg.getNextPageNumber()).to.equal(-1);
  });
});
