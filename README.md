# @team-internet/apiconnector

[![npm version](https://img.shields.io/npm/v/@team-internet/apiconnector.svg?style=flat)](https://www.npmjs.com/package/@team-internet/apiconnector)
[![node](https://img.shields.io/node/v/@team-internet/apiconnector.svg)](https://www.npmjs.com/package/@team-internet/apiconnector)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Build Status](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/workflows/Release/badge.svg?branch=master)](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/workflows/Release/badge.svg?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/CONTRIBUTING.md)

This module is a connector library for the insanely fast Team Internet backend APIs — **CentralNic Reseller** (fka RRPproxy), **Internet.bs** and **Moniker**. Do not hesitate to [contact us](https://www.centralnicreseller.com/contact) in case of questions.

## Resources

- Documentation:
  - [CentralNic Reseller (CNR)](https://support.centralnicreseller.com/hc/en-gb/articles/5714403954333-Self-Development-Kit-for-NodeJS)
  - Internet.bs (IBS) / Moniker — dedicated Node guides aren't published yet; the [PHP SDK's Internet.bs](https://faq.internetbs.net/hc/en-gb/articles/24953916500381-Self-Development-Kit-for-PHP) and [Moniker](https://support.moniker.com/hc/en-gb/articles/24954146333981-Self-Development-Kit-for-PHP) guides describe the same underlying API and wire behaviour this SDK talks to.
- [Release Notes](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/releases)
- [Migration Guide](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/MIGRATION.md) — how to upgrade across major versions

## Usage

```sh
pnpm add @team-internet/apiconnector
```

Idiomatic code for the **current** major, whatever that is when you read this — this section is kept up to date rather than pinned to the version that introduced the factory:

```ts
import { ClientFactory } from "@team-internet/apiconnector";

// --- CNR (CentralNic Reseller, fka RRPproxy) ---
const cl = ClientFactory.cnr(); // returns a fully-typed CNR.Client
cl.useOTESystem() // omit for LIVE (the default)
  .setCredentials(user, password); // or .setRoleCredentials(acct, role, pw)
// CNR has one fixed script path, so request() defaults it — pass a command only.
const r = await cl.request({ COMMAND: "StatusAccount" });
if (r.isSuccess()) {
  console.log(r.getHash());
}
await cl.close(); // release the underlying connection

// --- IBS / Moniker (JSON API) ---
const ibsCl = ClientFactory.ibs(); // or ClientFactory.moniker()
ibsCl.useOTESystem().setCredentials(user, password);
// This platform exposes many endpoints under one host and the *path* selects the
// operation, so pass it as the second argument — there is no default that works.
const ibsResponse = await ibsCl.request(
  { domain: "example.com" },
  "Domain/Check",
);
if (ibsResponse.isSuccess()) {
  console.log(ibsResponse.getHash());
}
await ibsCl.close();
```

Two brand differences the snippet is deliberately explicit about:

- **The `path` argument.** `request(cmd?, path?)` is symmetric across all brands, but only CNR has a meaningful default (`api/call.cgi`). On IBS/Moniker the path _is_ the operation, so omitting it sends the request to the bare host.
- **Sessions and role logins are CNR-only, by type.** `login()`, `logout()`, `saveSession()`, `getSession()`/`setSession()` and `setRoleCredentials()` exist on the CNR client and **do not exist** on `IBS.Client`/`MONIKER.Client` — calling one is a compile-time error at the call site, not a runtime surprise. See [Migration Guide → v11.0.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/MIGRATION.md#-v1100).

**Type against the interfaces, not the concrete classes.** Depending on `ResponseInterface`, `ColumnInterface`, `RecordInterface` and `LoggerInterface` — all exported from the package root — is what keeps future majors from breaking you; code that reaches for a concrete `CNR.Response` or duck-types with `"getSession" in client` is what does not survive them.

### Reading the rows of a list response

A response is fully assembled by the time you hold one, and read-only from then on. Walk its records with `for...of` — the response is iterable — or address them by index:

```ts
const r = await cl.request({ COMMAND: "QueryDomainList", LIMIT: "100" });

for (const [index, rec] of r.getRecords().entries()) {
  console.log(`${index}: ${rec.getStringByKey("DOMAIN")}`);
}

r.getRecord(0); // RecordInterface | null — by index, or null if out of range
r.getRecords(); // RecordInterface[] — the whole list
r.getColumn("DOMAIN"); // ColumnInterface | null — column-wise instead of row-wise
r.getPagination(); // Paginator — hasNextPage()/getNumberOfPages()/... or .toArray() for the plain COUNT/FIRST/LAST/LIMIT/TOTAL/PAGES/... hash
```

**Ask for the type you want.** `getDataByKey()`/`getDataByIndex()` return `unknown`, because an IBS/Moniker cell may legitimately carry a nested array or object. When you expect a plain value, the typed accessors save you the check — each returns `null` for a missing key, an out-of-range index, or a value of the wrong type, so there is nothing to narrow by hand:

```ts
const name = rec.getStringByKey("DOMAIN"); // string | null
const expiry = rec.getDateTimeByKey("expirationdate"); // ApiDateTime | null

const nameByColumn = r.getColumn("DOMAIN")?.getStringByIndex(0); // same, by column
```

Iterating (`for...of` or `[...r]`) gives you a fresh pass every time — no rewind step, and two loops over the same response cannot interfere with each other. If you are coming from a version with `getNextRecord()`/`rewindRecordList()`, see [Migration Guide → v11.0.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/MIGRATION.md#-v1100) — a loop ported mechanically from the old cursor can yield one extra row.

### Debug output

`enableDebugMode()` writes one record per request to standard output. Two seams let you take it somewhere else, and they are independent:

```ts
import { AbstractLogger } from "@team-internet/apiconnector";
import type {
  LogSinkInterface,
  ResponseInterface,
} from "@team-internet/apiconnector";

// 1. Keep the brand's format, change the destination.
class FileSink implements LogSinkInterface {
  constructor(private readonly path: string) {}
  write(message: string): void {
    // append to this.path — see examples/CustomLogSinkClass.ts for a full,
    // non-blocking implementation using node:fs/promises
  }
}

cl.enableDebugMode().setLogSink(new FileSink("/var/log/cnic.log"));

// 2. Change the format too: extend AbstractLogger and implement one method —
//    the sink wiring comes with it.
class MyLogger extends AbstractLogger {
  override format(
    post: string,
    response: ResponseInterface,
    error: string | null = null,
  ): string {
    return `[${response.getCode()}] ${post}\n`;
  }
}

cl.setCustomLogger(new MyLogger(new FileSink("/var/log/cnic.log")));
```

**Order matters between the two:** `setLogSink()` rebuilds the **brand** logger around your sink, so call it before `setCustomLogger()`, not after — whichever runs last wins.

`format()` **returns** the record rather than printing it, so you can route SDK debug output into your own logging without reimplementing a brand's format — and assert on it in your own tests with no output capturing needed. Sensitive command values (`PASSWORD`, `AUTH`, `transferAuthInfo`) are already masked before they reach the formatter.

### Testing your integration offline

Nothing in the request lifecycle needs a network. `setTransport()` swaps the HTTP layer for anything implementing `TransportInterface`, so you can hand the client a canned API response and still exercise the real command building, parsing and logging:

```ts
import type { TransportInterface } from "@team-internet/apiconnector";

class CannedTransport implements TransportInterface {
  constructor(private readonly raw: string) {}

  async post(): Promise<[string, string | null]> {
    return [this.raw, null]; // element [1] is the transport error; non-null means [0] is unusable
  }

  async close(): Promise<void> {}
}

cl.setTransport(
  new CannedTransport(
    "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nEOF\r\n",
  ),
);
const r = await cl.request({ COMMAND: "StatusAccount" }); // no network touched
```

Each of the client's three collaborators has a matching reader, so your own tests can assert the wiring took effect rather than reaching into the client: `getTransport()`, `getLogger()` and `getSocketConfig()`. That is how you confirm a custom logger survived the `setLogSink()`/`setCustomLogger()` ordering rule above, or that the transport double is the one in place:

```ts
const transport = new CannedTransport(raw);
console.assert(cl.setTransport(transport).getTransport() === transport);
console.assert(cl.setCustomLogger(myLogger).getLogger() === myLogger);
```

This is also exactly how this SDK's own test suite runs fully offline — see `tests/Support/CassetteTransport.ts` for a record/replay transport built on the same seam.

For working, runnable examples per brand — including the CNR session flow (`saveSession()`/`reuseSession()` across two stateless requests) — see [`examples/app_CNR.ts`](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/examples/app_CNR.ts), [`examples/app_IBS.ts`](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/examples/app_IBS.ts) and [`examples/app_MONIKER.ts`](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/examples/app_MONIKER.ts). Those are not part of the published npm package (`files` ships only `dist/`) — clone the repository to run them, as described under [Running the Demo Application](#running-the-demo-application).

## Date & time values

The APIs declare their date columns in **UTC** and emit two shapes: a full timestamp (`2026-07-25 07:46:34`, optionally with a fractional-second part, as CNR sends) and a bare calendar date (`2030/07/17`, as Internet.bs/Moniker send). `ApiDateTime` parses both into one flat, immutable struct, and accepts **either** `-` or `/` as the date separator — consistently within one value, so `2026-02/20` is refused. `date`/`dateTime` always come back with `-`, regardless of which one the source used:

```ts
import { ApiDateTime } from "@team-internet/apiconnector";

const dt = ApiDateTime.from("2026-07-25 07:46:34");
dt.ts; // 1784965594
dt.date; // "2026-07-25"
dt.dateTime; // "2026-07-25 07:46:34"
dt.tz; // "UTC"
dt.raw; // "2026-07-25 07:46:34" — the input, verbatim
dt.isDateOnly(); // false
dt.toArray(); // ready for JSON.stringify()
```

| Field      | Type             | CNR `2026-07-25 07:46:34` | Internet.bs / Moniker `2030/07/17`   |
| ---------- | ---------------- | ------------------------- | ------------------------------------ |
| `ts`       | `number \| null` | `1784965594`              | **`null`** — exact instant unknown   |
| `date`     | `string`         | `2026-07-25`              | `2030-07-17` — always `-`, even here |
| `dateTime` | `string \| null` | `2026-07-25 07:46:34`     | **`null`**                           |
| `tz`       | `string`         | `UTC`                     | `UTC`                                |
| `raw`      | `string`         | `2026-07-25 07:46:34`     | `2030/07/17` — verbatim input        |

A bare calendar date names no instant, so `ts` and `dateTime` are **both null** for one — deliberately, rather than defaulting to midnight, which would be a fabricated instant indistinguishable from a real one. `date` is always populated, so there is unconditionally something to print; `dt.ts === null` (or `isDateOnly()`) is the unambiguous test.

`raw` keeps whatever the source sent, including a fractional-second part `dateTime` discards. It is for display, logging and round-trip fidelity only — **compare and sort on `ts` or `date`, never on `raw`**, since `"2026/02/20"` sorts wrong against `"2026-03-01"` as plain strings.

Parsing is strict. Values that would otherwise silently roll over into a _different_ instant — `2026-02-30` becoming `2026-03-02`, `0000-00-00` becoming a negative year — are refused with an `InvalidDateTimeException`, as are offset-bearing values (never silently relabelled UTC). Use `ApiDateTime.tryFrom()` when a `null` is preferable to a thrown exception:

```ts
ApiDateTime.tryFrom(null); // null
ApiDateTime.tryFrom("2026-02-30"); // null — refused, not coerced
```

> [!NOTE]
> This is a **parser, not a formatter**. Responses are not rewritten: `getPlain()`, `getHash()` and `getListHash()` keep returning the raw API strings verbatim — Internet.bs/Moniker dates keep their `/` separator — and this type is opt-in at the point where a value is actually used. There is no locale formatting and no timezone-conversion dependency — presenting a value in the viewer's timezone is a display concern for the consuming application:
>
> ```ts
> new Intl.DateTimeFormat("de-DE", {
>   timeZone: "Europe/Berlin",
>   dateStyle: "medium",
>   timeStyle: "medium",
> }).format(new Date(dt.ts! * 1000));
> ```

`Record.getDateTimeByKey()` and `Column.getDateTimeByIndex()` do that narrowing for you, right where you already read a value — no separate check for a non-string, missing, or unparsable value needed beyond the returned `ApiDateTime | null` itself:

```ts
const rec = response.getRecord(0);
const expiry = rec?.getDateTimeByKey("expirationdate"); // ApiDateTime | null — works for "-" or "/" input
expiry?.date; // "2030-07-17"
expiry?.isDateOnly(); // true

const col = response.getColumn("expirationdate");
col?.getDateTimeByIndex(0); // same parsing, by column index instead of record key
```

Run `pnpm demo:datetime` for a runnable tour — it needs no credentials and makes no API calls.

## Running the Demo Application

To run the demo applications, follow these steps:

1. **Set your credentials** — copy [`.env.example`](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/.env.example) to `.env` in the workspace root and fill in the values, or replace the placeholders inside the demo file directly.

2. **Run the demo** for the brand you want:

   ```sh
   pnpm demo:cnr        # CentralNic Reseller  → examples/app_CNR.ts
   pnpm demo:ibs        # Internet.bs           → examples/app_IBS.ts
   pnpm demo:moniker    # Moniker               → examples/app_MONIKER.ts
   pnpm demo:datetime   # ApiDateTime parser    → examples/datetime.ts (no credentials, no network)
   ```

   These are thin wrappers around plain TypeScript run through `tsx` — edit the file listed on the right to change a demo, or run it directly without any tooling (`npx tsx examples/app_CNR.ts`).

## CI / Testing

CI is powered by [reusable GitHub Actions workflows](https://github.com/centralnicgroup-opensource/rtldev-middleware-shareable-workflows). The Node version matrix is configured via the shared workflow's `RTLDEV_MW_CI_NODE_MATRIX` repository variable and tracks the actively-maintained Node versions.

> [!NOTE]
> `package.json`'s `engines` field (`^22.14.0 || >=24.10.0`) sets the supported range. `pnpm test` runs fully offline — committed cassette recordings plus `nock.disableNetConnect()` mean no credentials and no network are needed for the default test run; see [Testing your integration offline](#testing-your-integration-offline) for the same seam applied to your own integration.

## Maintainers

- **Kai Schwarz** - [KaiSchwarz-cnic](https://github.com/kaischwarz-cnic)
- **Asif Nawaz** - [AsifNawaz-cnic](https://github.com/AsifNawaz-cnic)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
