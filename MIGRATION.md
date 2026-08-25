# Migration Guide

This guide explains how to upgrade **`@team-internet/apiconnector`** across its major versions, step by step, with before/after code.

Semantic versioning applies: **only major bumps (`X.0.0`) can break your code.** Minor and patch releases are backward compatible — you can take them freely. The per-release detail (every fix and feature) lives in [CHANGELOG.md](CHANGELOG.md); this document focuses only on the changes that require you to _do something_ when upgrading.

> **Golden rule:** upgrade one major at a time and run your own test suite between each. This guide starts at v10.0.0 as the baseline — the SDK's history before that point is not reconstructed here; see [CHANGELOG.md](CHANGELOG.md) for anything older.

---

## Version compatibility at a glance

| From → To | Node required             | Headline breaking change                                                                                                                                                                                                                                                                                                   | Consumer action                                                                                                                          |
| --------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| → v10.0.0 | `^22.14.0 \|\| >=24.10.0` | Baseline for this guide — CNR-only, a single `APIClient` class, `dist/`-based ESM package                                                                                                                                                                                                                                  | None (starting point)                                                                                                                    |
| → v11.0.0 | `^22.14.0 \|\| >=24.10.0` | Full PHP-SDK parity port: `ClientFactory` + `CNR`/`IBS`/`MONIKER` namespaces replace the single `APIClient`; `request(cmd, path)`; sessions are CNR-only; templates are per-instance; loggers format instead of print; response iteration replaces the record cursor; HTTP goes through an injectable `TransportInterface` | Construct via `ClientFactory`; retype any brand-agnostic code against the shared interfaces; see the full section below before upgrading |

Two things to respect throughout:

- **Type against interfaces, not concretes.** The clean upgrade path is to depend on `ResponseInterface`, `LoggerInterface`, `TransportInterface`, etc., all exported from the package root. Code that reaches for a concrete class (e.g. what used to be `CNR.Response`) or duck-types with `"getSession" in client` is what breaks across majors.
- **Upgrade one major at a time.** There is only one major jump documented here today (v10 → v11), but the rule stands for whatever comes after it — breaking changes accumulate, and skipping a major means absorbing several sections' worth of change at once with no clean checkpoint in between.

---

<a id="-v1100"></a>

## → v11.0.0 — IBS/Moniker added; the whole SDK is a namespaced barrel now

This is the whole PHP v9 → v32 delta arriving at once for Node consumers — the Node SDK had drifted to roughly PHP's v8-era design (CNR-only, no factory, no interfaces, no transport seam, a singleton template manager, a mutable cursor-navigated `Response`) and this release closes that gap in a single major. Read this section in full before upgrading; it is long because the change is genuinely broad, not because any one part of it is complicated.

### Before → after, at a glance

| Area        | v10                                                                                        | v11                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Entry point | `new APIClient()`                                                                          | `ClientFactory.cnr()`                                                                                          |
| Brands      | CNR only                                                                                   | `+ ibs()` / `moniker()`; `request(cmd, path)`                                                                  |
| Exports     | `{ APIClient, Response, ResponseTemplateManager }`                                         | Namespaced barrel: `{ ClientFactory, CNR, IBS, MONIKER, ... }`; deep imports no longer resolve (`exports` map) |
| Templates   | `ResponseTemplateManager.getInstance()` singleton                                          | Per-instance registry, passed to the `Response`; registry/Response-production are two interfaces               |
| Logging     | `setCustomLogger(new Logger())`, `log()` prints                                            | `format()` returns a string, a `LogSink` writes it; call `setLogSink()` **before** `setCustomLogger()`         |
| Records     | `getNextRecord()` / `rewindRecordList()`                                                   | `for...of` / `getRecord(i)`                                                                                    |
| HTTP        | Hard-wired `cross-fetch`                                                                   | `TransportInterface` + `setTransport()`                                                                        |
| Sessions    | On the single client                                                                       | CNR only, **absent by type** on IBS/Moniker                                                                    |
| Removed     | `setUserView()`/`resetUserView()`, `useDefaultConnectionSetup()`, `CustomLogger` in `src/` | No equivalent — pass `SUBUSER` in the command; `CustomLogger` moved to `examples/`                             |

### 1. Entry point: `ClientFactory` replaces `new APIClient()`

**What changed:** the default export is gone. Construct a client through `ClientFactory`'s typed named constructors, one per brand.

```ts
// BEFORE (v10)
import { APIClient } from "@team-internet/apiconnector";
const cl = new APIClient();

// AFTER (v11)
import { ClientFactory } from "@team-internet/apiconnector";
const cl = ClientFactory.cnr(); // -> CNR.Client
```

**What to respect:** `ClientFactory.cnr()` returns a fully-typed `CNR.Client`, so CNR capabilities (sessions, role credentials) are available directly with no narrowing on the normal path — the session lifecycle (`login()`/`logout()`/`saveSession()`/`reuseSession()`) lives on `CNR.Client` itself, not on a separate subclass. `ClientFactory.ibs()`/`ClientFactory.moniker()` return the plain brand client — those platforms have no session concept, so those methods are genuinely absent rather than present-and-throwing.

### 2. Brands: Internet.bs and Moniker added; `request()` takes a path

**What changed:** two new brands, and every brand's `request()` now takes an optional `path` argument selecting the endpoint.

```ts
// AFTER (v11) — new brands
const ibs = ClientFactory.ibs();
ibs.setCredentials(apiKey, password).useOTESystem();
const r = await ibs.request({ domain: "example.com" }, "Domain/Check"); // path required — no useful default
const available =
  r.getHash()["status"] === "AVAILABLE" ||
  r.getHash()["status"] === "UNAVAILABLE";

// CNR keeps working with no path argument — it defaults to the single fixed script path
const cnr = ClientFactory.cnr();
await cnr.request({ COMMAND: "StatusAccount" }); // path defaults to "api/call.cgi"
```

**What to respect:** IBS/Moniker have no single default endpoint the way CNR does — the path argument is not optional in practice for those two brands, only in the type signature.

### 3. Exports: single namespaced barrel, deep imports no longer resolve

**What changed:** the package now has one entry point. `package.json#exports` resolves only `"."`, so anything that imported a deep path (`@team-internet/apiconnector/dist/response.js`, for instance) will fail to resolve entirely — that was never public API, but nothing enforced it before.

```ts
// AFTER (v11)
import {
  ClientFactory,
  CNR,
  IBS,
  MONIKER,
  ResponseInterface,
  System,
} from "@team-internet/apiconnector";

const cnrClient: CNR.Client = ClientFactory.cnr();
const record = someResponse.getRecord(0); // typed via ResponseInterface
```

**What to respect:** if you were importing `Response`/`ResponseTemplateManager` directly from the root in v10, those exist now as `CNR.Response`/`CNR.ResponseTemplateManager` (and their IBS/Moniker counterparts) under the namespace, not as flat root exports.

### 4. Templates: per-instance registry, not a singleton

**What changed:** `ResponseTemplateManager.getInstance()` is gone. There is no process-wide registry — a `Response` is built with the registry it was actually given, or the brand's built-in defaults.

```ts
// BEFORE (v10) — mutating the shared singleton affected every later response
const rtm = ResponseTemplateManager.getInstance();
rtm.addTemplate("mine", "200", "custom");

// AFTER (v11) — the registry is instance state, threaded through explicitly
const registry = new CNR.ResponseTemplateManager().addTemplate(
  "mine",
  "200",
  "custom",
);
const r = new CNR.Response(
  raw,
  cmd,
  placeholders,
  context,
  null,
  null,
  registry,
);
```

**What to respect:** if you relied on registering a template once and having every later response in the process see it, that behaviour is gone by design — it was the exact defect this change closes (test-suite order-dependence, one integration's registration leaking into another's). Pass the registry explicitly wherever you need a non-default template.

### 5. Templates: the registry and Response-production are two interfaces now

**What changed:** `ResponseTemplateManagerInterface` no longer declares `getTemplate()`, `getTemplates()`, `isTemplateMatchHash()` or `isTemplateMatchPlain()`. Those four moved to a new `ResponseTemplateFactoryInterface`. Every concrete registry (`CNR.ResponseTemplateManager`, `IBS.ResponseTemplateManager`) still implements both, so calling any of the four on an actual registry instance is unaffected — this only matters if your own code declares a variable or parameter typed as `ResponseTemplateManagerInterface` and then calls one of the four on it.

```ts
// BEFORE (v10/early v11) — the registry type carried both roles
function describeTemplate(
  registry: ResponseTemplateManagerInterface,
  id: string,
) {
  return registry.getTemplate(id).getDescription(); // compiled
}

// AFTER (v11) — declare the narrower type you actually need, or the wider one if you build Responses
import type { ResponseTemplateFactoryInterface } from "@team-internet/apiconnector";

function describeTemplate(
  registry: ResponseTemplateFactoryInterface,
  id: string,
) {
  return registry.getTemplate(id).getDescription(); // still compiles, now against the right type
}
```

**Why:** the single interface let `AbstractResponseTranslator.translate()` — which only ever calls `getRawTemplates()` on the registry it holds — reach `getTemplate()` too, one call away from re-entering itself (`getTemplate()` builds a `Response`, whose constructor calls `translate()` again). It also hid a real bug: the internal hook that builds a Response from a template took one `raw` parameter that meant a template id in one caller and that entry's own wire text in the other, so a template whose wire text happened to equal a different template's id resolved to the wrong Response through `getTemplates()` specifically. Matches PHP-SDK v33.0.0's identical split (RSRMID-2968).

**What to respect:** if you implement `ResponseTemplateManagerInterface` yourself (rather than only consuming the built-in registries), add `ResponseTemplateFactoryInterface`'s four methods to a separate implementation, or implement both on the same class the way `AbstractResponseTemplateManager` does. If you only ever called `addTemplate()`/`hasTemplate()`/`getRawTemplates()`/`generateTemplate()` on a registry-typed value, nothing changes for you.

### 6. Logging: `format()` returns a string, a sink writes it

**What changed:** `AbstractLogger` splits format from destination. Implement `format()` and return the record; `log()` (final — do not override it) hands the result to a `LogSinkInterface`, `EchoSink` (stdout) by default.

```ts
// BEFORE (v10)
class MyLogger extends Logger {
  override log(post: string, response: Response, error: string | null): void {
    console.log(`${post} -> ${response.getPlain()}`);
  }
}
client.setCustomLogger(new MyLogger());

// AFTER (v11)
import { AbstractLogger } from "@team-internet/apiconnector";
class MyLogger extends AbstractLogger {
  override format(
    post: string,
    response: ResponseInterface,
    error: string | null,
  ): string {
    return `${post} -> ${response.getPlain()}`; // return it — do not print here
  }
}
client
  .setLogSink(myCustomSink) // set the destination first...
  .setCustomLogger(new MyLogger(myCustomSink)); // ...then the format, if you need both
```

**What to respect — the ordering matters.** `setLogSink()` and `setCustomLogger()` both assign `client`'s logger; whichever runs **last** wins. If you only need to change where debug output goes (not its shape), call `setLogSink()` alone and skip `setCustomLogger()` entirely.

### 7. Records: iteration replaces the cursor

**What changed:** `Response` is sealed after construction. The mutable cursor methods (`getNextRecord()`, `hasNext()`, `rewindRecordList()`) are gone, replaced by `[Symbol.iterator]()` and `getRecord(i)`.

```ts
// BEFORE (v10)
let rec;
while ((rec = response.getNextRecord())) {
  console.log(rec.getDataByKey("DOMAIN"));
}

// AFTER (v11)
for (const rec of response) {
  console.log(rec.getDataByKey("DOMAIN"));
}
// or, for a specific row:
const first = response.getRecord(0);
```

> **Silent behaviour change, not a compile error — read this before you port a loop mechanically.** The old cursor **pre-incremented**, so `getNextRecord()`'s first call already skipped past row 0 in some call patterns. A `for...of` ported literally from `while ((rec = getNextRecord()))` can legitimately yield **one more row** than the old loop did, because iteration starts at the true first record with no pre-increment to lose one. Compare row counts against your old output rather than assuming a mechanical translation is behaviour-preserving.

**What to respect:** `[Symbol.iterator]()` returns a fresh iterator on every call — two separate `for...of` loops over the same `Response` each see every row, independently, with no shared cursor state between them.

### 8. Pagination/status metadata is no longer column data

**What changed:** a response's pagination counters (CNR: `TOTAL`, `FIRST`, `LAST`, `COUNT`, `LIMIT`) and, on IBS, its transaction-level status fields (`transactid`, `status`, `message`, `code`, plus the endpoint-dependent count key) are no longer registered as columns. `getColumnKeys()` no longer takes a boolean parameter — with nothing left to filter, there is nothing left for it to strip.

```ts
// BEFORE (v10/early v11) — metadata reachable through getColumn(), and a bool to strip it
const total = response.getColumn("TOTAL")?.getStringByIndex(0);
const dataOnlyKeys = response.getColumnKeys(true);

// AFTER (v11) — read metadata through the pagination/status accessors instead
const total = response.getRecordsTotalCount();
const dataOnlyKeys = response.getColumnKeys(); // already data-only
```

**Why:** the counters were being modelled as data. `assembleRecords()` sizes the row list as the maximum length over every column, so a one-cell `TOTAL` "column" sitting beside a 200-cell `DOMAIN` column made an empty result window report **one phantom record consisting entirely of metadata**, and put IBS's `status` on row 0 of an n-row list and nowhere else. Both were consequences of the modelling error, not of row assembly itself, which needed no change once the column set became correct.

> **Silent behaviour change, not a compile error.** If you counted records with `response.getRecordsCount()` (or iterated the response) on a response carrying no real data — an empty list window, or an IBS status-only reply — you previously got `1`; you now get `0`, honestly. If your code special-cased "exactly one metadata-only record" as its empty-result signal, switch to checking `getRecordsCount() === 0` directly.

**What to respect:** `getFirstRecordIndex()`, `getLastRecordIndex()`, `getRecordsTotalCount()`, `getRecordsLimitation()` are now pure reads of the brand's own wire metadata, with no `getRecordsCount()` fallback of any kind — a response that is not itself a paginated list answers `null` on all four, distinguishable from "this is an empty but real page." `getListHash()`'s row shape is unaffected in the common case (it already excluded pagination columns from its rows), but its `meta.columns` list can no longer include a pagination key either.

### 9. Pagination arithmetic moved to `Paginator`

**What changed:** `getCurrentPageNumber()`, `hasNextPage()`, `hasPreviousPage()`, `getNextPageNumber()`, `getPreviousPageNumber()` and `getNumberOfPages()` are no longer on `Response`. `getPagination()` now returns a `Paginator` instead of a plain object — call `.toArray()` on it for the former shape.

```ts
// BEFORE (v10/early v11)
if (response.hasNextPage()) {
  const page = response.getCurrentPageNumber();
  const of = response.getNumberOfPages();
}
const pg = response.getPagination(); // { [key: string]: number | null }

// AFTER (v11) — ask the response for its paginator, once
const pg = response.getPagination(); // Paginator
if (pg.hasNextPage()) {
  const page = pg.getCurrentPageNumber();
  const of = pg.getNumberOfPages();
}
pg.toArray(); // the identical { [key: string]: number | null }, same keys, same order
```

**Why:** none of the six reads a column, holds state, or needs a wire payload — they are pure arithmetic over the four primitives above plus the record count. Keeping them on `Response` meant an offset grid could only be exercised by hand-authoring an API response that carried four integers; `Paginator` takes five plain numbers, so the full grid (including shapes no brand emits yet) is one constructor call away — see `tests/Paginator.spec.ts`.

**What to respect:** `Paginator.toJSON()` returns the same shape as `.toArray()`, so `JSON.stringify(response.getPagination())` keeps working exactly as it did when `getPagination()` returned a plain object — you do not have to change a logging or serialization call site that already does this. `CNR.Response.getListHash()["meta"]["pg"]` is unaffected: it was already the `.toArray()` shape and stays that way.

### 10. HTTP: injectable `TransportInterface`

**What changed:** the client no longer hard-wires `cross-fetch`. `HttpTransport` is the production implementation of `TransportInterface`, and `setTransport()`/`getTransport()` let you swap it — this is what offline testing is built on.

```ts
// AFTER (v11) — drive a client with no network at all
import type { TransportInterface } from "@team-internet/apiconnector";

const fake: TransportInterface = {
  async post() {
    return ["[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n", null];
  },
  async close() {},
};
const cl = ClientFactory.cnr().setTransport(fake);
const r = await cl.request({ COMMAND: "StatusAccount" }); // never touches the network
```

**What to respect:** if you were monkey-patching `cross-fetch` or `globalThis.fetch` to test against this SDK, `setTransport()` is the supported seam now — it is faster, does not touch global state, and is exactly what this SDK's own test suite uses.

### 11. Sessions: CNR-only, absent by type

**What changed:** `login()`, `logout()`, `saveSession()`, `reuseSession()`, `getSession()`, `setSession()` and `setRoleCredentials()` exist **only** on `CNR.Client` (what `ClientFactory.cnr()` returns — there is no separate `SessionClient` subclass). They are not present on `IBS.Client`/`MONIKER.Client` at all — not stubbed, not throwing, absent.

```ts
// BEFORE (v10) — every client had these methods, CNR-only concept or not
declare const anyClient: APIClient;
anyClient.setSession("..."); // compiled and ran regardless of brand

// AFTER (v11) — a compile-time error at the call site, not a runtime surprise
const ibs = ClientFactory.ibs();
// ibs.setSession("..."); // TS2339: Property 'setSession' does not exist on type 'Client'

const cnr = ClientFactory.cnr();
cnr.setSession("..."); // fine — CNR.Client has it directly
```

**What to respect:** if you had brand-agnostic code that called a session method speculatively, narrow to `CNR.Client` first (an `instanceof` check, or keep two code paths).

### 12. `Column.length` is gone — use `getLength()`

**What changed:** `Column`'s public `readonly length: number` field is removed. Read the same count through `ColumnInterface.getLength()`, which every `Column` still implements.

```ts
// BEFORE (v10) — a public field, unreachable if you typed against ColumnInterface
const n: number = column.length;

// AFTER (v11) — a method, declared on ColumnInterface
const n: number = column.getLength();
```

**Why:** a public field on `Column` had no counterpart on `ColumnInterface` — CLAUDE.md tells consumers to type against the interface, but nothing on it could reach the count, so an interface-typed caller had to narrow to the concrete `Column` class just to read it. Matches PHP-SDK v33.0.0's identical fix (RSRMID-2971). Guarded structurally by `tests/seams/ColumnInterfaceCoverageSeam.spec.ts`, which fails to typecheck if `Column` ever grows another public member absent from `ColumnInterface`.

**What to respect:** if you implement `ColumnInterface` directly (rather than only consuming `Column`), add `getLength()` to your implementation.

### 13. Removed with no replacement

- **`setUserView()`/`resetUserView()`** — these had no PHP equivalent; they were Node-only API. Pass `SUBUSER` directly in the command instead: `client.request({ COMMAND: "...", SUBUSER: subUserId })`.
- **`useDefaultConnectionSetup()`** — use `useLIVESystem()` or `useOTESystem()` explicitly.
- **`CustomLogger` in `src/`** — moved to [`examples/CustomLoggerClass.ts`](examples/CustomLoggerClass.ts), matching the PHP SDK's split (`examples/CustomLoggerClass.php`). Copy it into your own project and adapt — it was never meant to ship as library surface.

### Silent behaviour changes worth checking explicitly

**`getRecordsTotalCount()` / `getRecordsLimitation()` now return `number | null`, with no fallback to a record count.** In v10 these fell back to `getRecordsCount()` when the wire response carried no `TOTAL`/`LIMIT` column, so a non-list response reported a number that happened to equal the record count rather than "there is no total here." In v11 a response with no such column reports `null` — honestly, but differently from before.

```ts
// BEFORE (v10) — always a number, sometimes a meaningless one
const total: number = response.getRecordsTotalCount();

// AFTER (v11) — genuinely absent on a non-list response
const total: number | null = response.getRecordsTotalCount();
if (total !== null) {
  /* ... */
}
```

If your code assumed a number and did arithmetic on it directly, it will now see `null` on any response that is not a paginated list — check for that before upgrading, especially in code that ran the same handler for both list and non-list commands.

**`isPending()` now keys off `PENDING`, not a `COMMAND`/`STATUS` heuristic.** In v10, `isPending()` returned true only for an `AddDomain` command whose `STATUS` column read `"REQUESTED"` (case-insensitively) — any other command always returned `false`, whether or not the registry actually queued it. v11 matches the PHP SDK instead: `hash["PENDING"] === "1"`, checked regardless of which command produced the response. This is more correct (it now recognises pending outcomes on commands other than `AddDomain`), but it is a behaviour change, not just a bug fix: a v10 caller that only ever sent `AddDomain` and relied on the old `STATUS === "REQUESTED"` check will see `isPending()` return `false` for a v11 API response that sets `PENDING=1` without a matching `STATUS`, or vice versa if their registry-side behaviour differs from what the `PENDING` hash key reports. Re-verify any `isPending()` branch against your actual API responses after upgrading, rather than assuming the old and new checks agree.

```ts
// BEFORE (v10) — true only for AddDomain + STATUS=REQUESTED
if (response.isPending()) {
  /* ... */
}

// AFTER (v11) — true whenever the response hash carries PENDING=1,
// on any command
if (response.isPending()) {
  /* ... */
}
```

**`getCommand()` now returns the redacted command, not the raw one.** RSRMID-2938 masks sensitive fields (`AUTH`, `PASSWORD`, ...) before a command is stored on a `Response`, and `getCommand()`/`getCommandPlain()` return that masked copy — there is no way to recover the original values from a `Response` after construction. v10's `getCommand()` returned the command exactly as sent, unmasked. If you inspected `getCommand()` to resend, re-derive, or log a command that carried `AUTH`/`PASSWORD`, you will now see the literal mask value instead of the real one — keep your own copy of the original command if you need it after the request completes. (`CNR.Client.requestNextResponsePage()`/`requestAllResponsePages()` resend the real, unmasked values when continuing pagination — they do not rebuild page 2+ from `getCommand()`'s masked copy. A `Response` this client did not itself produce throws `PaginationException` rather than resending a masked value it has no unmasked copy of. Matches PHP v33.0.0's independently-arrived-at fix; see [architecture.md](docs/agents/architecture.md#fixed-in-node-ahead-of-php).)

---

## Getting help

Open an issue at [github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/issues](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/issues) if a migration step here does not match what you observe — include the version you are upgrading from and to, and a minimal reproduction.
