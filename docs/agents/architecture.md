# Architecture

Full decision record for the RSRMID-2974 PHP → Node parity port. [CLAUDE.md](../../CLAUDE.md) states each rule in one line; this file carries the rationale, the alternative considered, and (where one exists) the guard test that locks it. Read this before changing anything the corresponding CLAUDE.md line covers.

The parity rule throughout: **if PHP does it, do it the same way; if PHP does not, do not add it unless the language forces you to.** Everything under [Deviations from PHP](#deviations-from-php) is a place the port could not be literally 1:1, with the justification. Anything not listed there must match PHP.

---

## Decisions carried over from PHP

1. **Brands are siblings, not parent/child.** `CNR.Response` and `IBS.Response` both extend `AbstractResponse`. `MONIKER.Client extends IBS.Client` (same platform, only `SocketConfig` differs) and MONIKER declares **no** `Response`/`Parser`/`Translator`/`Logger`/`TemplateManager` of its own. Rejected alternative: a shared base with Moniker/IBS specifics behind flags — this is exactly the shape PHP moved away from, since a flag-gated shared base cannot express "this brand doesn't have this capability" as a type-level fact. Guard: `tests/seams/ClientConfigSeam.spec.ts`.
2. **Response construction is a template method.** Brands supply `translate()`, `populate()`, `newRecord()`, `newResponseParser()`. Never reimplement the constructor. Guard: reflection over `AbstractResponse.prototype` in the seam specs plus direct behavioural coverage in `tests/CNR/Response.spec.ts`/`tests/IBS/Response.spec.ts`.
3. **The request lifecycle is a template method**, and `request(cmd, path)` is symmetric across brands. Vary only via `buildCommand()` / `newResponse()` / `newSocketConfig()`.
4. **Connection configuration has exactly one home** — the `SocketConfig`, reached through `getSocketConfig()`. No client-side copies; that is what stopped 18 forwarders accumulating in PHP. Guard: `tests/seams/ClientConfigSeam.spec.ts` (structural — no client instance carries `url`/`socketURL`/`system`/`curlopts`/`proxy`/`referer`/etc as an own property) plus `tests/seams/AbstractClientConfigDriftSeam.spec.ts` (behavioural — the three regressions this decision closed, restated so a reader can see what used to happen: URL/system disagreement, high-performance routing losing the system, `resetCurlOptions()`/`resetRequestOptions()` forgetting the proxy).
5. **Pagination seam is at the wire.** 4 per-brand primitives (`getFirstRecordIndex`, `getLastRecordIndex`, `getRecordsTotalCount`, `getRecordsLimitation`), plus `getListHash`'s CNR-only cousin. `AbstractResponse` assembles them into a `Paginator` via `getPagination()` (RSRMID-2965 — see decision 18 below); it declares no arithmetic of its own. Guard: `tests/AbstractResponse.spec.ts`, `tests/CNR/Client.spec.ts`'s pagination `describe` block.
   - **Pagination/status metadata is not column data (RSRMID-2965, PHP-SDK v33.0.0, BREAKING).** A key matching a brand's `metaKeys` (renamed from `paginationKeys`) is never registered as a column — checked via `isMetaKey()`, called from each brand's `populate()` before it would otherwise register one. CNR's `TOTAL`/`FIRST`/`LAST`/`COUNT`/`LIMIT` and IBS's `transactid`/`status`/`message`/`code`/the endpoint-dependent count key reach consumers only through the pagination and status accessors; the four wire primitives read the parsed hash directly (CNR's `metaInt()`, IBS's `metaCount()`) instead of `getColumn()`. Fixes a real modelling error, not a refactor: `assembleRecords()` sizes the row list as the max over every column, so a one-cell `TOTAL` "column" beside a 200-cell `DOMAIN` column made an empty result window report one phantom record consisting entirely of metadata, and put IBS's `status` on row 0 of an n-row list and nowhere else. `getColumnKeys()` dropped the `filterPaginationKeys` boolean it briefly carried — with nothing left to filter, there was nothing left for it to strip. Verified against PHP v33 directly: same fixtures through both SDKs' `Response` classes, JSON-diffed byte-identical across populated lists, empty windows, non-list responses, and IBS's count-key scan (including the `discount`/`totaldomains` false-positive-avoidance case) — not inferred from the port alone. **Spot-re-verified (2026-08-21):** the original harness's scratch fixtures no longer exist (deleted per this project's own convention of not leaving scratch comparison scripts behind), so re-ran one representative case fresh — an empty CNR list response through both `CNIC\CNR\Response` (PHP 8.5.4, real `php -r` execution) and `CNR.Response` (Node, real `tsx` execution) — and confirmed `getColumnKeys()`/`getListHash()["meta"]` are still byte-identical JSON today, not just at the time this row was written.
6. **Core vs extended Response contract.** `ResponseInterface` is universal; the 5 CNR-only capabilities (`getQueuetime`, `getRuntime`, `isTmpError`, `isPending`, `getListHash`) live on `ExtendedResponseInterface` and are **absent** on IBS/Moniker, not present-and-throwing. Guard: `tests/IBS/Response.spec.ts`'s "ExtendedResponseInterface capabilities are absent" block (`"getQueuetime" in r` etc. all `false`).
7. **Sessions and role credentials are CNR-only, by type.** `login`/`logout`/`saveSession`/`reuseSession`/`getSession`/`setSession`/`setRoleCredentials` must not exist on the IBS/Moniker clients. Guard: `tests/IBS/Client.spec.ts` ("has no session accessors"/"has no role-credentials capability"), `tests/seams/ClientIDNSeam.spec.ts`'s sibling checks.
8. **The logger seam is at the format, not the sink.** `format()` returns the record; a `LogSink` writes it. `AbstractLogger.log()` is intended final — a subclass reintroducing its own `log()` would silently ignore an injected sink. Guard: `tests/AbstractLogger.spec.ts` ("AbstractLogger.log is not overridden by any brand logger").
9. **The parse step is a seam** — one `parse(raw, cmd)` signature, injectable via `ResponseParserInterface`, exercised directly in `tests/{CNR,IBS}/ResponseParser` coverage rather than only indirectly through a constructed `Response`.
10. **The template registry is per-instance**, threaded into the `Response` constructor's `templates` argument. See [Every deviation, audited](#deviations-from-php) — no, wait, this one has no deviation, it is carried over exactly, and it is the single highest-value guard in the whole suite because it is the one defect the **pre-port Node SDK actually shipped**: a process-wide singleton (`ResponseTemplateManager.getInstance()`) with a public mutable `templates` field. Guard: `tests/seams/ResponseTemplateRegistrySeam.spec.ts`. **Verified against this repo's own git history (2026-08-21):** `git show d3c5fb1:src/responsetemplatemanager.ts` (the original commit, before any port work) shows `public static getInstance()`, `private static instance`, and an eager `ResponseTemplateManager.getInstance();` call at module load — a real, shipped singleton, not a reconstructed description of one.
11. **One shared `Record` and one shared `Column`.** No brand declares either; value-type narrowing goes in `getStringByKey()`/`getStringByIndex()`, not a generic. Guard: `tests/Column.spec.ts`, `tests/Record.spec.ts`; structurally, neither class takes a type parameter — grep is the check, there is nothing to reflect over.
12. **Exceptions come from one additive hierarchy** rooted at `CnicException`. Guard: `tests/Exception/CnicException.spec.ts` (every subclass `instanceof CnicException`, catchable via one handler).
13. **Placeholder stripping is per-field**, confined to the brand's human-readable field (`fieldName()`: `"description"` for CNR, `"message"` for IBS) — a global strip corrupts `{UPPER}` content in real data (e.g. an SPF record's `%{i}`). Guard: `tests/AbstractResponseTranslator.spec.ts`'s `replacePlaceholders()` block.
14. **`ClientFactory` exposes typed named constructors**, not string dispatch. `cnr()`/`ibs()`/`moniker()` return the concrete brand type, so brand-specific capabilities are available with no narrowing on the normal path.
15. **Dates are parsed on demand, never rewritten into the response.** `getPlain()`/`getHash()`/`getListHash()` keep raw API strings, IBS/Moniker `/` separators included. `ApiDateTime` is a parser, not a formatter — no `in(tz)`, no locale formatting, no timezone-database dependency. Guard: `tests/ApiDateTime.spec.ts`.
16. **A client accepts a pre-built brand `SocketConfig` at construction**, narrowed per brand, adopted by reference — never cloned (RSRMID-2966, PHP-SDK v33.0.0). This is the build half of the config seam whose read half is `getSocketConfig()` (decision 4): before it, a config could be built standalone but never supplied, so configuring a client meant a setter sequence during which the client was already pointed at LIVE. Purely additive — omitting the argument mints the brand's own default exactly as before. The narrowing is the point: `new MONIKER.Client(new IBS.SocketConfig())` must be a compile-time error, since endpoints are the only difference between those two brands. Guard: `tests/seams/ClientConfigSeam.spec.ts`'s "pre-built, per-brand SocketConfig" block, including a `@ts-expect-error` line proving the cross-brand rejection is real.
17. **A brand that rewrites no response descriptions declares nothing.** `descriptionRegexMap()`/`descriptionRawPatternMap()` on `AbstractResponseTranslator` default to `{}` instead of being abstract (RSRMID-2970, matching PHP). IBS rewrites nothing and used to say so explicitly; it now inherits the empty defaults. Not the "never no-op" case (decision 7's session absence, or `ExtendedResponseInterface`'s absent-by-type capabilities) — that directive is about a capability the platform cannot honour, where a silent discard hides a caller's mistake. An empty rewrite map is the opposite: a complete, truthful answer to "which messages does this brand rewrite?" from a brand whose answer is "none". CNR still overrides both hooks, since it has real content.
18. **Pagination arithmetic is a value object, not a Response method (RSRMID-2965, PHP-SDK v33.0.0, BREAKING).** The six derivations over the four wire primitives — `getCurrentPageNumber`, `hasNextPage`, `hasPreviousPage`, `getNextPageNumber`, `getPreviousPageNumber`, `getNumberOfPages` — moved off `ResponseInterface`/`AbstractResponse` onto `Paginator`, a `final`-in-spirit value object taking five plain numbers (`first`, `last`, `total`, `limit`, `count`) and nothing else. `getPagination(): Paginator` is the one place the four brand primitives meet the shared arithmetic; a fresh `Paginator` is built per call, cheap since a sealed response's numbers cannot change. None of the six reads a column, holds state, or needs a wire payload, so the full grid — including shapes no brand emits yet — is exercisable as a bare constructor call (`tests/Paginator.spec.ts`), rather than requiring a hand-authored API response carrying four integers the way `tests/CNR/Response.spec.ts` used to. `Paginator.toArray()` reproduces the former flat object exactly (same keys, same order), so `CNR.Response.getListHash()["meta"]["pg"]` is unchanged. Do not add a `fromResponse()` convenience constructor or a `ResponseInterface` parameter to `Paginator` — that would re-couple the two and reopen the reason it was extracted. Guard: `tests/seams/ResponsePaginationSeam.spec.ts` — the load-bearing half is the negative (no brand `Response` answers any of the six, by any route: declared, inherited, or composed in), since the positive ("`Paginator` has these methods") is unfalsifiable once the class exists at all.
    - **`JSON.stringify(response.getPagination())` is a Node-only trap PHP's own shape does not force a decision on the same way.** TS's `private`/`protected` are compile-time-only: `Paginator`'s backing fields are ordinary own-enumerable instance properties at runtime, so without a `toJSON()` override, `JSON.stringify` would walk internal field names (`currentPage`, `hasNext`, `nextPage`, ...) instead of the wire-facing shape, silently publishing the wrong keys to anyone who logs or returns the pagination block directly — with no compiler warning, since the class is still perfectly well-typed. `Paginator.toJSON()` returns `toArray()`, which is what `JSON.stringify()`/`JSON.parse()` call first when present. Verified directly (`tests/Paginator.spec.ts`), not assumed: PHP's own `Paginator` has no `JsonSerializable` implementation either, so `json_encode()` on it yields `{}` there — PHP's failure mode is obviously-empty and self-announcing, Node's would have been silently-wrong-shaped, which is the forcing reason to diverge and add the safety net PHP does not have. **Re-verified (2026-08-21):** ran `php -r` against the real `rtldev-middleware-php-sdk` checkout (PHP 8.5.4) — `json_encode(new CNIC\Paginator(0, 9, 100, 10, 10))` prints `{}`, and `$p instanceof JsonSerializable` is `false`.
19. **The CNR session lifecycle lives on `CNR.Client` itself — there is no `CNR.SessionClient` (RSRMID-2969, PHP-SDK v33.0.0, BREAKING).** `login`/`logout`/`saveSession`/`reuseSession` were declared on a `SessionClient` subclass that added nothing else — `ClientFactory.cnr()` always returned it, so the split expressed a distinction no code ever made, at the cost of a second file to find `login()`. PHP had the identical shape (a `SessionCapable` trait with exactly one host, `@psalm-require-extends Client`, consumed by an equally empty subclass) and folded it the same way. Deliberately no class alias and no empty `class SessionClient extends Client {}` left behind: either would look like free backward compatibility while proving nothing, and would let a re-added split slip back in unnoticed since nothing would fail. If a genuinely session-less CNR client ever becomes a real use case, that is a new type with a narrower contract, not this indirection restored. Guard: `tests/index.spec.ts` (`"SessionClient" in cnrBarrel` is `false`; `ClientFactory.cnr()` is exact-class-checked against `CNR.Client`, not `instanceof`, since an alias or a reinstated subclass would still pass an `instanceof` check) plus `tests/CNR/Client.spec.ts` (`CNR.Client.prototype` owns all four lifecycle methods itself).
20. **The template registry's pipeline face and its Response-producing face are two interfaces, not one (RSRMID-2968, PHP-SDK v33.0.0, BREAKING).** `ResponseTemplateManagerInterface` is now registry-only (`generateTemplate`, `addTemplate`, `hasTemplate`, `getRawTemplates`) — the exact shape `AbstractResponseTranslator.translate()` needs, since its only call on the `templates` parameter is `getRawTemplates()`. The four Response-producing methods (`getTemplate`, `getTemplates`, `isTemplateMatchHash`, `isTemplateMatchPlain`) moved to a new `ResponseTemplateFactoryInterface`, which `AbstractResponseTemplateManager` implements alongside the registry interface — every concrete brand manager still gets both, so no call site holding a concrete registry loses anything. Splitting closes two defects the single interface let through: first, `translate()` held the type that could reach `getTemplate()`, one call away from re-entering itself (`getTemplate()` builds a `Response`, whose constructor calls `translate()` again) — previously fended off only by a comment at the call site, not a mechanism; second, the Response-building hook (`createResponse`, now `createResponseFromTemplateId`) took a single `raw` parameter that `getTemplate()` fed a template id and `getTemplates()` fed that entry's own wire text, so a template whose wire text happened to equal a different template's id resolved to the wrong Response through `getTemplates()` only. `getTemplates()` now builds from `Object.keys(this.templates)` and calls the hook with each id, never with stored wire text. `ResponseTemplateFactoryInterface` is exported from the root barrel alongside the registry interface — PHP marks it `@psalm-api`, matching the barrel's stated export rule. Guard: `tests/seams/ResponseTemplateFactorySeam.spec.ts` — the registry/factory disjointness and the factory's exact method set are compile-time-only checks (TS has no interface reflection), enforced by `pnpm run typecheck` the same way `ColumnInterfaceCoverageSeam.spec.ts` is; the collision case (a template whose wire text equals another template's id) is the one behavioural test that actually distinguishes the fixed `getTemplates()` from the pre-split one.

## Four traps <a id="three-traps"></a>

Anything transliterating PHP into this codebase will hit one of these. All four are permanent hazards, not one-time port bugs — they apply to any future addition too. (The anchor still reads `three-traps`: it is linked from `CLAUDE.md` and from commit messages, so it stays stable.)

### 1. Field-initialisation order

PHP evaluates a subclass's property initialisers *before* the parent constructor body runs. JS runs them *after* `super()` returns. `AbstractResponse`'s constructor reads `sensitiveFields` while sanitising the command, and (via `populate()`, since RSRMID-2965) `metaKeys` while assembling columns; `AbstractSocketConfig`'s constructor logic reads `liveUrl`/`oteUrl` to resolve the default URL. Declared as plain subclass fields, all of these read `undefined` at the moment the base constructor needs them.

**Rule: anything a base constructor reads from a subclass is a `get` accessor or a method, never a property.** Accessors live on the prototype and exist during `super()`; fields do not yet. `AbstractSocketConfig` goes one step further and doesn't even read `liveUrl` eagerly in its own constructor — `url` starts `null` and `resolveUrl()` resolves it lazily on first read, which sidesteps the hazard entirely rather than merely surviving it (TypeScript itself rejects a base constructor reading an *abstract* accessor, which is what forced this design). `sensitiveFields` on `AbstractSocketConfig` is the one member in this family that's safe as a plain field — the base constructor never reads it, only instance methods do, well after construction — so check whether the base constructor actually reads a given member before assuming it needs the accessor treatment.

There is no automated guard for this specific trap today (it would need a per-member static check); each subclass's declaration site documents whether it needed to be an accessor and why.

### 2. Merge direction is inverted

PHP's `+` array union keeps the **left** operand on a duplicate key; JS object spread keeps the **right**. `$dedicated + $this->curlOptions` therefore ports to `{ ...this.requestOptions, ...dedicated }`, not `{ ...dedicated, ...this.requestOptions }` — get it backwards and the value a caller thinks won silently loses. Every merge site in this codebase (`AbstractSocketConfig.setExtraRequestOptions()`, `AbstractSocketConfig.getTransportOptions()`, `IBS.Client.buildCommand()`'s `ResponseFormat` injection) carries a one-line comment stating which operand must win and why. Guard: `tests/seams/AbstractClientConfigDriftSeam.spec.ts`'s "B2" block is the regression test for the one time this port got it wrong in review — proxy/referer state was stored correctly but the merge that should have carried it into the transport's option bag was never wired at all. Fixed by `AbstractSocketConfig.getTransportOptions()`, asserted at the transport (`SpyTransport.options`), never at the client's own state — "in the bag" is not "on the wire".

### 3. `Record` shadows TypeScript's `Record<K,V>`

The SDK class is `Record` (parity with PHP's `CNIC\Record`, non-negotiable), so any module importing it loses access to TypeScript's built-in `Record<K,V>` utility type as an unqualified name. `src/types.ts` defines `Hash = { [k: string]: unknown }` and `StringHash = { [k: string]: string }` for what PHP expresses as `array<string,mixed>`/`array<string,string>` PHPDoc. **`Record<K,V>` is banned from this codebase entirely** — not just in files that import the SDK's `Record` — so that a future file doesn't accidentally rely on an import that isn't there yet and then break when someone adds `import { Record } from "./Record.js"` next to it.

### 4. `intdiv()` truncates, `Math.floor()` does not

PHP's `intdiv()` truncates toward zero; JS's `Math.floor()` rounds toward −∞. They agree on every non-negative operand and diverge silently below zero, which is what makes this the same shape of hazard as the merge-direction trap: the obvious translation is correct on every value anyone tests by hand.

`src/Paginator.ts` is where it bites — `currentPage`, `nextPage` and `previousPage` all divide an offset by the window. Nothing clamps on the way in: `CNR.Response.metaInt()` parses `FIRST`/`LAST` straight off the wire and casts, exactly as PHP casts them, so a malformed response carrying a negative offset reaches the arithmetic. Measured against PHP's own `Paginator` for the same arguments:

| | `new Paginator(-5, 10, 100, 2, 5)` |
| --- | --- |
| PHP `intdiv` | `getCurrentPageNumber()` → `-1` |
| `Math.floor` | `-2` |
| `Math.trunc` | `-1` ✓ |

**Rule: port `intdiv()` as `Math.trunc()`, never `Math.floor()`.** `Math.ceil()` needs no such care — PHP's `(int)ceil()` and JS's `Math.ceil()` agree, because both round up before any cast. Pinned by the two negative-offset cases in `tests/Paginator.spec.ts`.

---

## Concurrency contract <a id="concurrency-contract"></a>

Undefined until RSRMID-2974's review — nobody had looked, and PHP's typical
per-request-process execution model has no real analogue to hold this
against. Investigated with `tests/Support/DelayedTransport.ts` (a
manually-released gate, not a `setTimeout`, so the interleaving under test
is deterministic rather than occasionally reproducible) and pinned by
`tests/seams/ConcurrencyContractSeam.spec.ts`.

**The rule: a client is safe for concurrent `request()` calls only while
nothing else mutates it concurrently.** "Nothing else" means no setter
(`setContext()`, `setCredentials()`, `setSession()`, `setProxy()`,
`setSocketTimeout()`, `enableDebugMode()`/`disableDebugMode()`,
`setCustomLogger()`/`setLogSink()`, ...), no `login()`/`logout()`, and no
`close()`, while a `request()` the caller cares about is in flight. Under
that condition:

- **Concurrent `request()` on one IBS client, no config mutation — safe.**
  Each call's command, URL, options and timeout are built and captured
  synchronously (`buildCommand()` → `getPOSTData()` → `executeCurl()`'s
  argument list, all before that method's one `await`), so two overlapping
  calls cannot observe or corrupt each other's outbound data.
- **Same for Moniker — safe**, for the same reason (decision 1: it is
  `IBS.Client` with different endpoints, no code of its own in the path).
- **CNR under concurrent requests with an active, unchanging session —
  safe.** The session id is serialized into the POST body the same way any
  other config value is — synchronously, per call, before the await.

Outside that condition, three concrete hazards, found and reproduced (not
merely reasoned about) before being written down here:

- **`this.context` (and `this.debugMode`/`this.logger`) are read *after*
  the network `await`** — inside `newResponse()` and the debug-log branch
  of `AbstractClient.performRequest()` — not snapshotted when the call
  started. A `setContext()` that lands while an earlier `request()` is
  still in flight is what that earlier call's `Response.getContext()`
  reports on resolution, not the context that was active when it was
  issued. Applies identically to every brand — `CNR.Client`/`IBS.Client`
  both write `this.context` straight into `newResponse()`. Low stakes
  today (context is documented as informational, no SDK behaviour depends
  on it), but genuinely surprising for a consumer tagging responses by
  request for logging/tracing purposes across concurrent calls.
- **CNR's `persistent` flag is shared, unscoped `SocketConfig` state, with
  no per-call isolation.** `login()`'s `setPersistent(true)` is visible to
  *any* other concurrent `request()` on the same client — including one
  that never called `login()` at all — because command-building reads
  whatever the flag happens to be at the moment that particular call's own
  synchronous phase runs. Confirmed directly: a plain `request()` started
  while a concurrent `login()` is in flight goes out with `persistent=1`
  it never asked for. Whichever `login()`/`logout()` finishes first turns
  the flag back off in its `finally` (see the `try`/`finally` fix
  documented in the Deviations table below), regardless of whether another
  concurrent operation on the same client still wanted it on.
- **`close()` does not cancel, wait for, or otherwise coordinate with an
  in-flight `request()`.** It is a fire-and-forget call to
  `transport.close()`, independent of any pending `post()` — confirmed: a
  `request()` started before `close()` stays pending exactly as long as
  the transport takes to settle it, unaffected by the `close()` call in
  between. For the production `HttpTransport` specifically, `close()` also
  tears down the cached proxy `ProxyAgent`; a request already in flight
  through that same agent may still depend on the connection pool `close()`
  just released. **This half is a documented risk, not a tested one** — no
  test double here has a pooled resource to tear down, so nothing offline
  can exercise the real teardown path.

**What this means for a consumer.** A client instance is not a strictly
single-flight resource — genuine `request()`-level concurrency (batch
domain checks on one IBS/Moniker client, several CNR queries under one
already-established and unchanging session) is supported and tested.
What is not supported, and has no plan to be, is mixing that with a
concurrent setter, `login()`/`logout()`, or `close()` on the *same*
client instance. A consumer needing to change credentials, session,
context, or configuration while other requests on the same client are
still in flight — or needing per-call isolation of context/debug-logging
— must either serialize those operations relative to the in-flight
requests, or use a separate client instance per logical operation that
needs its own, non-overlapping lifecycle.

**Revisit condition.** A future change adding a mutex/queue/generation
counter around setters and `request()`, or turning `context`/`debugMode`
into per-call parameters instead of client fields, would strengthen this
contract — at which point `ConcurrencyContractSeam.spec.ts`'s "unsafe"
tests should start failing, and should be updated to match the new
guarantee rather than deleted.

---

## Deviations from PHP <a id="deviations-from-php"></a>

### Forced by TypeScript/Node — no choice

| Deviation | Why unavoidable |
| --- | --- |
| `abstract protected static` hooks (`builtinTemplates`, `matchKeys`, `fieldName`, etc.) → instance methods | TS has no abstract statics; typing the static side is unchecked, which would remove the compile-time guarantee that is the hook's whole purpose. |
| `enum System: string` → frozen const object + union type sharing the name | TS `enum` is non-erasable syntax and nominal across package boundaries; `Object.freeze({...} as const)` plus `type System = (typeof System)[keyof typeof System]` is the parity-preserving substitute. |
| `IteratorAggregate::getIterator()` → `[Symbol.iterator]()` generator | Different iteration protocol, same contract. A generator gives "fresh iterator per call" for free — a naive iterator-object field would be one-shot, which `tests/AbstractResponse.spec.ts` asserts against explicitly. |
| `CnicException` hierarchy extends `Error`, `.name` set as a string literal | JS has no `\Exception`; `new.target.name` is avoided because a minifier can rename a class but not a string literal. `ErrorOptions.cause` is the TS-native upgrade over PHP's `$previous` constructor argument. |
| `mixed` / `array<string,mixed>` → `unknown` / `Hash` (`src/types.ts`) | TS needs a declaration somewhere; PHP's live in docblocks at zero file cost. |
| `request()`/`post()`/`close()` are `async`; everything else stays sync | Network I/O is the only genuinely async boundary — see [CLAUDE.md → Coding Standards](../../CLAUDE.md#typescript-style). |
| One `index.ts` per directory (root + `CNR`/`IBS`/`MONIKER`/`Exception`) | `moduleResolution: node16` has no directory-index resolution; PSR-4 autoloading gives PHP this for free. |
| `VERSION` in its own `src/version.ts` rather than a class constant on `AbstractClient` | Lets the release regex be anchored to one file, one pattern, unambiguously — see [ci-release.md](ci-release.md). |
| cURL option constants (`CURLOPT_*`) have no counterpart | Node has no cURL; `HttpTransport` is built on `fetch`/undici instead. `setProxy()` goes through an undici `ProxyAgent` on the transport's dispatcher — the alternative (a setter whose value never reaches the wire) is the exact bug this port had to fix once already (see the merge-direction trap above). |
| PascalCase filenames | Not a deviation from PHP — this is what makes the two trees diffable (`CNIC\CNR\Client` ↔ `src/CNR/Client.ts`). A deviation from the *pre-port Node repo's* all-lowercase convention, which this replaces. |

### Deliberate Node-only additions

| Addition | Why it earns its place |
| --- | --- |
| `noImplicitOverride`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess` | Direct analogues of `#[\Override]`, PHP's import hygiene, and PHPStan level 9's array-access discipline, respectively — zero runtime cost, parity in spirit even though PHP expresses the same discipline differently. |
| Field-initialisation-order awareness (documented per-declaration, see the trap above) | Guards a JS-only hazard with no PHP analogue. |
| `fallow` (`dead-code` + `dupes`, config in `.fallowrc.jsonc`) | Fills the "second analyser" role PHP gets from Psalm level 1 — duplication, circular deps, unused exports. See [project-policies.md](project-policies.md) for its current scope and the eslint gap it is *not* a substitute for. |
| `TransportOptions` type (`RequestOptions & { proxy?, referer? }`) | Encodes PHP's `MANAGED_OPTIONS`/`PROTECTED_OPTIONS` runtime rejection lists as a compile-time type instead of two parallel constant tables plus a runtime throw — `fetch` has roughly six meaningful knobs, most already owned by a dedicated setter, so the type system can carry the whole guarantee. A small runtime check remains for plain-JS callers with no compiler. |
| `UnsupportedFeatureException` has three named constructors (`transportOwnedOption`, `conflictingTransportOption`, `transportOwnedHeader`) — the same count as PHP, but not the same split (RSRMID-2967, PHP-SDK v33.0.0) | PHP's `transportOwnedCurlOptions()`/`sdkManagedCurlOptions()` are two runtime rejection tables (options with no replacement vs. options with a setter to use instead); Node collapses both into the `RequestOptions` type above, leaving exactly one runtime guard in `HttpTransport.post()` — for a plain-JS caller bypassing the type system — that can reject either kind of key. `transportOwnedOption(option, owningClass, replacementSetter?)` carries the same two cases PHP split into two constructors, but as one constructor with an optional third argument: `null` for "method"/"body" (no replacement, simply drop it), `"setSocketTimeout()"` for "signal" (a real replacement). `transportOwnedHeader(headerName, owningClass)` is otherwise a direct match for PHP's third constructor — Node's `HttpTransport.post()` header-collision guard is the same shape as PHP's `appendHeaders()`. The accessors (`getRejectedOption`/`getReplacementSetter`/`getRejectedHeaderName`/`getOwningClass`) mirror PHP's, minus `getRejectedCurlOptions()`'s plural array shape — Node's guard rejects one key per throw, so a single nullable string per accessor is the honest shape, not an array that is always length-0-or-1. This is a deliberate divergence in the exception's public shape, not an omission: do not "fix" it back toward three constructors or array-valued accessors without first checking whether Node's `HttpTransport.post()` still rejects at most one key per throw — if that changes, PHP's array shape becomes the right one to port. `conflictingTransportOption(option, owningClass, conflictingSetter)` is the third, and is Node-only rather than a port of PHP's third: it exists because undici's `dispatcher` is a second way to express what `setProxy()` already owns, a collision cURL cannot have (`CURLOPT_PROXY` is the only way to say it). `HttpTransport.post()` refuses the pair instead of picking a winner — letting the option bag win would leave `getProxy()` reporting a proxy that never reached the wire, which is the silently-inert setter this port exists to remove, and letting the proxy win would discard a dispatcher the caller built on purpose. A `dispatcher` on its own stays legal: the collision is the fault, not the key. |

### Cut as over-engineering

These were considered and rejected during planning — recorded so they don't get proposed again without the context of why they lost:

| Cut | Why |
| --- | --- |
| A `.d.ts` API-snapshot layer (api-extractor, a committed `api/*.api.md`) | A third tool and a committed artefact to do what one guard spec does in PHP. |
| A separate `tests/types/` modality for compile-time-only assertions | Doubles up on guards that already exist at runtime; the few type-level assertions (`@ts-expect-error`) live beside the runtime assertions in the same seam spec file. |
| `TransportResult` discriminated union instead of the `[raw, error]` tuple | Nicer than PHP's tuple, but the tuple is directly expressible in TS. Parity wins where there's no forcing reason to diverge. |
| An `AbstractClient<TConfig>` generic | TS allows the plain covariant override PHP uses (`CNR.Client.getSocketConfig(): CNR.SocketConfig`); a type parameter would leak into every consumer position for no gain. |
| `Object.freeze()` on assembled arrays (records/columns) | PHP does not freeze its equivalents; `readonly` return types are the 1:1 equivalent of PHP's `protected`. |

---

## Known, accepted findings from static analysis

`fallow dead-code`/`dupes` (see [project-policies.md](project-policies.md#static-analysis)) reports several things that look like defects and are not — recorded here rather than only in `.fallowrc.jsonc`'s comments, since this is where a reader checking "is this intentional" would look first:

- **CNR/IBS duplicate exports and mirrored files** (`Client.ts`, `Response.ts`, `ResponseTemplateManager.ts`, `SocketConfig.ts`) — decision 1 above, working as intended.
- **A circular import** `Response.ts → ResponseTranslator.ts → ResponseTemplateManager.ts → Response.ts` in both CNR and IBS — structural: the template registry's `getTemplate()` constructs a `Response` to represent each built-in/registered template, and `Response` uses the brand's translator, which defaults to the brand's own registry type. All three references are used inside method bodies, never at module top-level, so ESM's live-binding resolution handles the cycle safely at runtime. This predates the port (the old singleton `ResponseTemplateManager` had the same shape) and has no PHP analogue to flag it, since PHP has no import-cycle concept. Marked with `// fallow-ignore-file circular-dependency` on both `Response.ts` files, since fallow has no config-level override for this finding kind.
- **Six "unused" class members** (`CNR.SocketConfig.setPersistent`/`getSession`/`getRoleSeparator`/`setSession`, `CNR.Client.reuseSession`, `IBS.Client.request`) — all have real call sites, either exercised only from `tests/**` (public library API with no `src/`-internal caller, e.g. `IBS.Client.request` — nothing in `src/` calls it because it *is* the public surface) or reached through a chained call fallow's default analysis doesn't resolve back to the specific member (`this.getSocketConfig().setSession(...)`). Declared centrally in `.fallowrc.jsonc`'s `usedClassMembers`, each with the same reasoning as here.

---

## Converged: CNR session lifecycle cleans up in a `finally`

Briefly a deliberate Node-ahead-of-PHP divergence: `login()`/`logout()` performed their cleanup on the line
after `request()` with no `try`/`finally`, so a throw left `persistent` stuck `true` or leaked the transport.
Node fixed it under RSRMID-2974 and it was filed against PHP as
[RSRMID-2980](https://centralnic.atlassian.net/browse/RSRMID-2980); PHP shipped the same fix in **v33.0.1**
(`d77de36`, "fix(cnr): run the session-lifecycle cleanup in a finally"), with identical semantics — the
response is still returned when one was received, and the session/flag is still only cleared on success.
Verified against the v33.0.1 source on 2026-08-21. Converged, not an open gap.

## Converged: pagination continuation no longer resends a masked value <a id="fixed-in-node-ahead-of-php"></a>

Briefly a deliberate Node-ahead-of-PHP divergence (RSRMID-2975); PHP has since caught up (`b50cd88`, PHP v33.0.0) and **arrived at the same design independently** — a `WeakMap`/`SplObjectStorage`-equivalent held on the client, keyed by `Response`, never on the Response itself, for the same redaction-leak reason. Recorded here as a converged decision, not an open gap.

**Verified by reading the actual commit, not by trusting the earlier claim (2026-08-21):** `git show b50cd88` in the local `rtldev-middleware-php-sdk` checkout confirms the commit exists, is reachable from tag `v33.0.0`, and its message/diff say exactly this — `CNR\Client` gains a `private WeakMap<Response, array<string,string>>`, and `requestNextResponsePage()` throws `PaginationException` on a masked fallback. The Jira ticket's own existence/state (RSRMID-2975) was **not** re-confirmed this session — Atlassian MCP access was unavailable (see [issue-tracker.md](issue-tracker.md)); only the PHP-side code claim was checked.

- **The defect:** `CNR.Client.requestNextResponsePage()` ([src/CNR/Client.ts](../../src/CNR/Client.ts)) used to build the follow-up request from `currentPage.getCommand()` — the *redacted* command (`CommandRedactor.redact()` replaces `AUTH`/`PASSWORD` with `CommandRedactor.MASK` before a `Response` stores its copy, RSRMID-2938). A list command whose own parameters include `AUTH` or `PASSWORD` (e.g. a domain transfer auth code, or an account password field on a command that happens to be a list query) went to the API as the literal masked value on page 2 onward, not the real one. This is *not* about session or role-credential authentication, which lives entirely on `SocketConfig` (`s_login`/`s_pw`/`s_sessionid`) and is a separate mechanism untouched by this bug.
- **The fix:** `CNR.Client` keeps a `WeakMap<Response, StringHash>` (`unmaskedCommands`) of the exact, still-unmasked command it handed to `newResponse()` for each `Response` it produces. `continuationCommand()` prefers that over `getCommand()` when continuing pagination. `getCommand()` itself is untouched and stays masked for every caller (RSRMID-2938's guarantee doesn't weaken) — only the client's own internal continuation logic sees the real values.
- **The one place Node used to differ from PHP, now fixed:** a `Response` this client did not itself produce (constructed directly, or from a different client instance) is not in the map. `continuationCommand()` falls back to `getCommand()` there — safe exactly when nothing in it was masked, which is the common case — but if that fallback command still carries the literal mask token as a *value* (detected by value, not by key, so it holds for a subclass that widens `sensitiveFields`), it throws `PaginationException` instead of putting the mask on the wire. Node originally fell back silently; PHP's `b50cd88` made the throw call first, and Node now matches it. See `tests/CNR/Client.spec.ts`'s pagination `describe` block for both the resend-real-value case and the throws-on-masked-fallback case.
- Unaffected either way: the *first* page of `requestAllResponsePages()`, which is built from the caller's own `cmd` argument, never from a `Response`.
