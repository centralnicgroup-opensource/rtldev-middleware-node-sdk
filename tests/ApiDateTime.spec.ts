import { expect } from "chai";
import "mocha";
import { ApiDateTime } from "../src/ApiDateTime.ts";
import { InvalidDateTimeException } from "../src/Exception/InvalidDateTimeException.ts";

/**
 * ApiDateTime — dates are parsed on demand from raw API strings and never
 * rewritten into the stored response (decision 15). Covers both accepted
 * shapes (CNR's "-"-separated timestamp, IBS/Moniker's "/"-separated bare
 * date), rejection of mixed separators and non-existent calendar dates, and
 * the null-tolerant tryFrom() counterpart.
 */
describe("ApiDateTime", () => {
  describe("from() — full timestamp", () => {
    it("parses a CNR-style timestamp", () => {
      const dt = ApiDateTime.from("2026-07-25 07:46:34");
      expect(dt.date).to.equal("2026-07-25");
      expect(dt.dateTime).to.equal("2026-07-25 07:46:34");
      expect(dt.ts).to.equal(
        Math.floor(Date.UTC(2026, 6, 25, 7, 46, 34) / 1000),
      );
      expect(dt.tz).to.equal("UTC");
      expect(dt.raw).to.equal("2026-07-25 07:46:34");
      expect(dt.isDateOnly()).to.be.false;
    });

    it("discards a fractional-second part", () => {
      const dt = ApiDateTime.from("2026-07-25 07:46:34.123456");
      expect(dt.dateTime).to.equal("2026-07-25 07:46:34");
      expect(dt.raw).to.equal("2026-07-25 07:46:34.123456");
    });

    it("normalises a '/'-separated timestamp's output to '-', preserving raw", () => {
      const dt = ApiDateTime.from("2026/07/25 07:46:34");
      expect(dt.date).to.equal("2026-07-25");
      expect(dt.dateTime).to.equal("2026-07-25 07:46:34");
      expect(dt.raw).to.equal("2026/07/25 07:46:34");
    });
  });

  describe("from() — bare calendar date (IBS/Moniker shape)", () => {
    it("parses a '/'-separated date with ts/dateTime both null", () => {
      const dt = ApiDateTime.from("2030/07/17");
      expect(dt.date).to.equal("2030-07-17");
      expect(dt.ts).to.be.null;
      expect(dt.dateTime).to.be.null;
      expect(dt.raw).to.equal("2030/07/17");
      expect(dt.isDateOnly()).to.be.true;
    });

    it("parses a '-'-separated bare date the same way", () => {
      const dt = ApiDateTime.from("2030-07-17");
      expect(dt.date).to.equal("2030-07-17");
      expect(dt.ts).to.be.null;
    });
  });

  describe("from() — rejections", () => {
    it("rejects a mixed separator", () => {
      expect(() => ApiDateTime.from("2026-02/20")).to.throw(
        InvalidDateTimeException,
      );
      expect(() => ApiDateTime.from("2026/02-20")).to.throw(
        InvalidDateTimeException,
      );
    });

    it("rejects a non-existent calendar date instead of silently rolling over", () => {
      expect(() => ApiDateTime.from("2026-02-30")).to.throw(
        InvalidDateTimeException,
      );
    });

    it("rejects 0000-00-00", () => {
      expect(() => ApiDateTime.from("0000-00-00")).to.throw(
        InvalidDateTimeException,
      );
    });

    it("rejects an ISO 'T' separator and a 'Z'/offset suffix", () => {
      expect(() => ApiDateTime.from("2026-07-25T07:46:34")).to.throw(
        InvalidDateTimeException,
      );
      expect(() => ApiDateTime.from("2026-07-25 07:46:34Z")).to.throw(
        InvalidDateTimeException,
      );
      expect(() => ApiDateTime.from("2026-07-25 07:46:34+00:00")).to.throw(
        InvalidDateTimeException,
      );
    });

    it("rejects garbage and a trailing newline", () => {
      expect(() => ApiDateTime.from("not a date")).to.throw(
        InvalidDateTimeException,
      );
      expect(() => ApiDateTime.from("2026-07-25\n")).to.throw(
        InvalidDateTimeException,
      );
    });

    it("rejects a non-existent time of day", () => {
      expect(() => ApiDateTime.from("2026-07-25 25:00:00")).to.throw(
        InvalidDateTimeException,
      );
    });
  });

  describe("tryFrom()", () => {
    it("returns null for a null input", () => {
      expect(ApiDateTime.tryFrom(null)).to.be.null;
    });

    it("returns null for anything from() would reject, without throwing", () => {
      expect(ApiDateTime.tryFrom("garbage")).to.be.null;
      expect(ApiDateTime.tryFrom("2026-02-30")).to.be.null;
    });

    it("returns the parsed value for valid input", () => {
      const dt = ApiDateTime.tryFrom("2030/07/17");
      expect(dt).to.not.be.null;
      expect(dt?.date).to.equal("2030-07-17");
    });
  });

  describe("toArray()", () => {
    it("returns a plain, JSON-serialisable object with the same fields", () => {
      const dt = ApiDateTime.from("2026-07-25 07:46:34");
      expect(dt.toArray()).to.deep.equal({
        ts: dt.ts,
        date: "2026-07-25",
        dateTime: "2026-07-25 07:46:34",
        tz: "UTC",
        raw: "2026-07-25 07:46:34",
      });
    });
  });
});
