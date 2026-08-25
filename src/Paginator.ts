/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

/**
 * Pagination arithmetic over one list window (RSRMID-2965).
 *
 * A response answers five questions about its window from its own wire
 * metadata — where it starts, where it ends, how many rows exist in total,
 * how many were requested, and how many arrived. Everything else a caller
 * asks about paging is arithmetic over those five numbers, and it lives
 * here rather than on `AbstractResponse`: it needs no wire payload, no
 * columns and no records, so tying it to a Response only meant that testing
 * an offset grid required hand-authoring an API response to carry four
 * integers.
 *
 * **This is a value object, and deliberately has no reference to a
 * Response.** Every input is a primitive, so any grid — including ones no
 * brand emits yet — is one constructor call away. Do not add a
 * `fromResponse()` convenience constructor or a `ResponseInterface`
 * parameter: that would re-couple the two and put us back where
 * hand-authored payloads were the only way to exercise the arithmetic
 * (guarded by `tests/seams/ResponsePaginationSeam.spec.ts`).
 *
 * **Everything is computed in the constructor**, and the getters return
 * what was computed. That is not an optimisation — seven integer
 * operations need none — it is where the null handling lives. Each "is
 * this grid usable?" check happens exactly once, in the branch that also
 * produces the value, so no getter has to repeat a check another method
 * has already made.
 *
 * **Offsets, not page numbers, are the grid.** Every predicate and every
 * page number is answered from the offset a request would actually start
 * at, so a predicate and its corresponding getter cannot drift apart, and
 * an unaligned window (FIRST=50, LIMIT=100 — "page 1", whose next request
 * starts at 150, not 200) is handled rather than rounded away. Page
 * numbers stay a derived view: the request offsets are exact, and the
 * number reported is the page that offset lands on.
 *
 * Intended as a `final` value object (no PHP-equivalent language
 * enforcement in TS) — do not subclass it.
 */
export class Paginator {
  private readonly currentPage: number | null;
  private readonly hasNext: boolean;
  private readonly nextPage: number | null;
  private readonly hasPrevious: boolean;
  private readonly previousPage: number | null;
  private readonly pages: number;

  /**
   * @param first offset this window starts at (`FIRST`), null when the response carries no pagination metadata
   * @param last offset this window ends at (`LAST`); an empty window may echo `first` here rather than a row offset
   * @param total rows available for the whole query (`TOTAL`), null when unknown
   * @param limit rows requested (`LIMIT`); `0` is a real request and stays distinct from null
   * @param count rows this response actually holds
   */
  public constructor(
    private readonly first: number | null,
    private readonly last: number | null,
    private readonly total: number | null,
    private readonly limit: number | null,
    private readonly count: number,
  ) {
    // The usable window size, or null when there is not one. A non-positive
    // limit is not a window: it was requested, so it is not "absent" — the
    // limit property keeps that distinction for toArray() — but nothing can
    // be paged through in steps of zero, and treating it as a grid is what
    // let a walk restart from the beginning of the list (see hasNextPage()).
    // A local, because every derivation below is made here and nothing
    // afterwards needs it.
    const window = limit !== null && limit > 0 ? limit : null;

    // Every division below is `Math.trunc`, never `Math.floor`: PHP's
    // `intdiv()` truncates toward zero and `Math.floor` rounds toward -Inf,
    // so the two disagree the moment an offset goes negative — `first = -5`
    // with a window of 2 is page -1 in PHP and page -2 with `Math.floor`.
    // Nothing clamps on the way in (`FIRST` is read straight off the wire
    // and only cast, exactly as PHP casts it), so a malformed response is
    // enough to reach it. A fourth transliteration trap, in the same family
    // as the three in CLAUDE.md: correct-looking, and silent when wrong.
    this.currentPage =
      window !== null && first !== null ? Math.trunc(first / window) + 1 : null;

    // "There is a next page" and "which page is it" are one decision, so
    // they are made together: the second cannot be asked in a state the
    // first has not already accepted.
    let hasNext = false;
    let nextPage: number | null = null;
    if (
      window !== null &&
      first !== null &&
      last !== null &&
      total !== null &&
      last >= first &&
      last + 1 < total
    ) {
      hasNext = true;
      nextPage = Math.trunc((last + 1) / window) + 1;
    }
    this.hasNext = hasNext;
    this.nextPage = nextPage;

    let hasPrevious = false;
    let previousPage: number | null = null;
    if (window !== null && first !== null && first > 0) {
      hasPrevious = true;
      previousPage = Math.trunc(Math.max(0, first - window) / window) + 1;
    }
    this.hasPrevious = hasPrevious;
    this.previousPage = previousPage;

    // Note this reads `limit`, not `window`: a response that carries no
    // limit at all is an implicit single page when it holds rows (mirroring
    // a single-page brand's model), whereas a requested limit of 0 is a
    // window of nothing and pages through nothing.
    if (total === null || limit === null) {
      this.pages = count === 0 ? 0 : 1;
    } else if (total > 0 && limit > 0) {
      this.pages = Math.ceil(total / limit);
    } else {
      this.pages = 0;
    }
  }

  /**
   * Get Page Number of the current window, or null when it has no usable
   * offset grid (no metadata, or a non-positive limit — a window of no
   * rows has no meaningful page number).
   */
  public getCurrentPageNumber(): number | null {
    return this.currentPage;
  }

  /**
   * Check if this list query has a next page.
   *
   * Answered from the offset grid directly — `LAST + 1 < TOTAL` — rather
   * than from page numbers, so it agrees with {@link getNextPageNumber}
   * even when the current window is not aligned to a page boundary.
   *
   * An **empty** window is the case to keep in mind, and the reason the
   * non-positive-limit gate exists. CNR answers one by echoing
   * `LAST = FIRST` (with `COUNT = 0`) rather than by omitting LAST or
   * reporting a row offset. Observed shapes, all `QueryDomainList`:
   *
   *   FIRST=0,        LIMIT=0  -> count=0, first=0,        last=0,        total=1825820
   *   FIRST=2000000,  LIMIT=0  -> count=0, first=2000000,  last=2000000,  total=1825824
   *   FIRST=20000000, LIMIT=10 -> count=0, first=20000000, last=20000000, total=1825824
   *
   * The third self-terminates on the arithmetic, because LAST echoes an
   * offset far past TOTAL. The first two do not: `LAST + 1 < TOTAL` holds,
   * and without a gate `CNR.Client.requestNextResponsePage()` would advance
   * to `FIRST = 1` and re-walk the list from near the start. What stops
   * them is the non-positive LIMIT gate — the older of the two guards here,
   * which `CNR.Client` has relied on to terminate since before the offset
   * grid existed.
   *
   * The `LAST < FIRST` gate is **defensive only** — no observed CNR
   * response does it, precisely because an empty window echoes
   * `LAST = FIRST`. It pins the invariant the client's advance depends on:
   * since `LAST >= FIRST` always, `FIRST = LAST + 1` strictly increases and
   * the walk is monotonic. A future wire change (or a substitute parser)
   * that broke that would send pagination backwards rather than failing,
   * so it is refused here.
   *
   * The row count is NOT the gate to use, however much "an empty window
   * has no next page" sounds like the same statement: it describes the
   * rows in hand, not whether more exist beyond them, so a server
   * answering an empty window mid-list would terminate a walk that should
   * have continued.
   */
  public hasNextPage(): boolean {
    return this.hasNext;
  }

  /**
   * Check if this list query has a previous page.
   *
   * Answered from the offset grid directly — `FIRST > 0` — for the same
   * reason as {@link hasNextPage}: an unaligned window still has a
   * well-defined "before it" even though it does not sit on a page
   * boundary. The same non-positive-limit gate applies, because a window
   * of no rows cannot page backward either.
   */
  public hasPreviousPage(): boolean {
    return this.hasPrevious;
  }

  /**
   * Get Page Number of the next list query, or null when there is none.
   *
   * Computed from the *offset* the next request will actually start at
   * (`LAST + 1`) rather than from the current page number plus one. The
   * two agree on every window this can be asked about — for a full window
   * LAST + 1 is FIRST + LIMIT — but the offset form is used anyway because
   * it is the same grid the predicate answers from, and because it mirrors
   * {@link getPreviousPageNumber}, where the offset form and "current - 1"
   * genuinely do differ on an unaligned window.
   */
  public getNextPageNumber(): number | null {
    return this.nextPage;
  }

  /**
   * Get Page Number of the previous list query, or null when there is
   * none.
   *
   * Computed from the offset the previous request would start at
   * (`max(0, FIRST - LIMIT)`), not from the current page number minus one:
   * for an unaligned window the two disagree, and the offset form is the
   * one that matches what would actually be requested.
   */
  public getPreviousPageNumber(): number | null {
    return this.previousPage;
  }

  /**
   * Get the number of pages available for this list query.
   *
   * `0` when total or limit is unavailable and the response holds no rows
   * (nothing to page through); `1` when it holds rows but is not a
   * paginated list at all (an implicit single page). Otherwise the
   * ceiling of total/limit.
   */
  public getNumberOfPages(): number {
    return this.pages;
  }

  /**
   * Get all paging data in one hash.
   *
   * The keys and their order are the wire-facing projection this replaced
   * (`ResponseInterface.getPagination()` returned exactly this shape
   * before RSRMID-2965), because it is what `CNR.Response.getListHash()`
   * publishes under `meta.pg` — a table renderer's payload, not an
   * internal shape.
   */
  public toArray(): { [key: string]: number | null } {
    return {
      COUNT: this.count,
      CURRENTPAGE: this.currentPage,
      FIRST: this.first,
      LAST: this.last,
      LIMIT: this.limit,
      NEXTPAGE: this.nextPage,
      PAGES: this.pages,
      PREVIOUSPAGE: this.previousPage,
      TOTAL: this.total,
    };
  }

  /**
   * `JSON.stringify(response.getPagination())` must publish the same
   * wire-facing shape {@link toArray} does, not this class's internal
   * field names — a Node-only trap PHP does not force a decision on the
   * same way. TS's `private` is compile-time-only: the backing fields
   * (`currentPage`, `hasNext`, `nextPage`, ...) are ordinary own-enumerable
   * instance properties at runtime, so `JSON.stringify` would otherwise
   * walk *those* instead of calling any accessor — silently publishing
   * differently-named, differently-shaped internal state to anyone who
   * logs or returns this object directly, with no compiler warning. `
   * JSON.stringify()`/`JSON.parse()` call `.toJSON()` first when present,
   * which is what this method exists to give it.
   */
  public toJSON(): { [key: string]: number | null } {
    return this.toArray();
  }
}
