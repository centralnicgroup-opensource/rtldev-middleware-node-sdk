/**
 * ApiDateTime demo — mirrors `examples/datetime.php`.
 *
 * Run with `pnpm demo:datetime`. Needs no credentials and makes no API calls:
 * ApiDateTime is a pure parser for the date/time strings the APIs return.
 */

import { ApiDateTime, Column, Exception, Record } from "../src/index.js";

console.log("--- CNR: full timestamp ----\n");
const cnr = ApiDateTime.from("2026-07-25 07:46:34");
console.dir(cnr.toArray(), { depth: null });
console.log(`isDateOnly(): ${String(cnr.isDateOnly())}`);

console.log("\n--- IBS / Moniker: date-only value ----\n");
// A bare calendar date names no instant, so ts and dateTime are BOTH null
// rather than defaulting to midnight — that would be an invented instant.
// date is always populated, so there is unconditionally something to print.
//
// IBS/Moniker actually send "/" as the separator (e.g. "2030/07/17"), which is
// what this demo parses; date always comes back with "-" regardless.
const ibs = ApiDateTime.from("2030/07/17");
console.dir(ibs.toArray(), { depth: null });
console.log(`isDateOnly(): ${String(ibs.isDateOnly())}`);

console.log(
  "\n--- CNR: fractional seconds are discarded from dateTime, but kept in raw ----\n",
);
const frac = ApiDateTime.from("2024-12-10 13:17:55.813");
console.log(`dateTime: ${String(frac.dateTime)}`); // "2024-12-10 13:17:55" — whole seconds only
console.log(`raw:      ${frac.raw}`); // "2024-12-10 13:17:55.813" — the input, verbatim

console.log(
  "\n--- raw: display/logging only — never compare or sort on it ----\n",
);
// A plain string comparison of "/"-separated against "-"-separated values gives
// the wrong order; date is always normalised to ISO for exactly this reason.
// raw preserves the source's own separator, so it must not be used for that.
console.log(`raw:  ${ibs.raw}`); // "2030/07/17" — verbatim, whatever the API sent
console.log(`date: ${ibs.date}`); // "2030-07-17" — always ISO, safe to compare/sort

console.log(
  "\n--- Rejected: a non-existent date is refused, not coerced ----\n",
);
// `new Date("2026-02-30")` would roll over rather than refuse.
try {
  ApiDateTime.from("2026-02-30");
  console.log("UNEXPECTED: no exception thrown.");
} catch (err) {
  if (err instanceof Exception.InvalidDateTimeException) {
    console.log(`InvalidDateTimeException: ${err.message}`);
  } else {
    throw err;
  }
}

console.log("\n--- tryFrom(): null instead of an exception ----\n");
console.log(ApiDateTime.tryFrom(null));
console.log(ApiDateTime.tryFrom("2026-02-30"));

console.log(
  "\n--- Presenting a value in another timezone is the caller's job ----\n",
);
// The SDK deliberately stays UTC-only; localisation belongs in the frontend.
// Node ships full ICU, so Intl handles this without any extra dependency —
// no PHP DateTimeZone equivalent is needed.
if (cnr.ts !== null) {
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    dateStyle: "short",
    timeStyle: "long",
  }).format(new Date(cnr.ts * 1000));
  console.log(`UTC:            ${String(cnr.dateTime)}`);
  console.log(`Europe/Berlin:  ${local}`);
}

console.log(
  "\n--- Record/Column: opt-in accessors, instead of parsing getDataByKey() yourself ----\n",
);
// getDateTimeByKey()/getDateTimeByIndex() do the typeof+tryFrom() narrowing for
// you, right where a value is already being read out of a Record/Column.
// Response data itself is never rewritten — these are read-time helpers.
const rec = new Record({ expirationdate: "2030/07/17", note: "n/a" });
console.log(rec.getDateTimeByKey("expirationdate")?.date); // "2030-07-17"
console.log(rec.getDateTimeByKey("note")); // null — not parsable, not thrown
console.log(rec.getDateTimeByKey("missing")); // null — key absent

const col = new Column("expirationdate", ["2030/07/17"]);
console.log(col.getDateTimeByIndex(0)?.isDateOnly()); // true
console.log(col.getDateTimeByIndex(1)); // null — out of range
