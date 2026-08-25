# Testing

Harness detail for the RSRMID-2974 port. [CLAUDE.md → Testing](../../CLAUDE.md#testing) states the rules; this file explains the mechanism.

## Layout

`tests/` mirrors `src/`: `tests/CNR/Client.spec.ts`, `tests/IBS/Response.spec.ts`, and so on. Structural guard specs live in `tests/seams/`. Shared test doubles and the cassette harness live in `tests/Support/`. Committed cassette recordings live in `tests/{CNR,IBS,MONIKER}/cassettes/`.

## Division of labour: cassettes vs. nock

They sit at different layers and do not compete — a cassette transport is injected at the seam, so nock never sees it.

| Harness | Layer | Covers |
| --- | --- | --- |
| **Cassettes** (`CassetteTransport` via `setTransport()`) | Replaces the transport | The whole `request()` lifecycle per brand — command building and sorting, URL + path resolution, POST serialisation, translation, parsing, record/column assembly, pagination, `login()`/`logout()`. Payloads are recorded wire truth, not hand-written guesses. |
| **nock** (`tests/HttpTransport.spec.ts`) | HTTP | `HttpTransport` itself — the one layer cassettes cannot exercise, because they replace it. Headers, body encoding, non-2xx, network error, header-collision throws, managed/protected option rejection. |

## The cassette harness

`tests/Support/CassetteTransport.ts` implements `TransportInterface`. `useCassette(name)` selects a tape and resets an internal cursor; successive `post()` calls map to successive recorded exchanges, so one test can cover a multi-request operation (pagination, `login()` + `logout()`).

- **Cassette file format** — a bare JSON array of `{"raw", "error"}` exchange objects, recorded **at the transport layer**, before `translate()`. This is exactly PHP's cassette format: the initial set under `tests/{CNR,IBS,MONIKER}/cassettes/` were copied byte-identical from `rtldev-middleware-php-sdk/tests/{CNR,IBS}/cassettes/` (the format is language-independent) and confirmed to still replay correctly against the Node port. **Re-verified (2026-08-21):** every `.json` file under Node's `tests/CNR/cassettes/` and `tests/IBS/cassettes/` was `cmp`'d byte-for-byte against its namesake in the PHP checkout — all identical, no exceptions found.
- **Replay is the default and is fully offline** — no credentials, no network, no sleep. `pnpm test` never touches the API. `tests/setup.ts` calls `nock.disableNetConnect()` globally (with `127.0.0.1` re-enabled for the one loopback spec nock itself can't see, and net connect re-enabled entirely in record mode).
- **Record mode** is gated on `RTLDEV_MW_RECORD=1` (`pnpm test:record`): the tape wraps a real `HttpTransport`, captures the live tuple, and writes the file. Needs OT&E credentials (see [project-policies.md → Secrets](project-policies.md#secrets)); throttle between tests to avoid an OT&E rate-limit ban — see `tests/Support/Cassettes.ts`'s `throttle()`.
- **A hand-authored, replay-only cassette** (e.g. `conn-error.json`, a captured `{"raw": "", "error": "Could not resolve host: ..."}`) is the right tool for a transport-failure scenario you cannot safely re-record without depending on DNS resolution behaving a specific way on every future run — drive it through a dedicated `new CassetteTransport(null, dir, false)` rather than the shared per-suite tape, so a `pnpm test:record` run never overwrites it with a resolver-dependent message.

`useCassette()` lives on the test double only, never on `TransportInterface` itself, so `src/` stays clean of test-only concerns.

## Test doubles (`tests/Support/`)

- **`SpyTransport`** — records exactly what a client hands `post()` (URL, data, timeout, options, user agent) and returns a canned CNR-shaped success by default. This is the seam that can prove "the client called the transport with X" independently of what `HttpTransport` itself does with X — see `tests/seams/TransportSeam.spec.ts` and the B2 regression guard in `tests/seams/AbstractClientConfigDriftSeam.spec.ts`.
- **`CollectingSink`** / **`SpyResponseParser`** — minimal doubles for `LogSinkInterface`/`ResponseParserInterface` where a test needs to assert what was written or parsed without a real destination.
- **`DelayedTransport`** — like `SpyTransport`, but every `post()` call suspends until the test calls `releaseNext()`, in arrival order. Built for `tests/seams/ConcurrencyContractSeam.spec.ts`, where a race needs to be deterministic (a manually-released gate) rather than occasionally reproducible (a `setTimeout` delay) — use it whenever a test needs to control exactly which of several concurrent `request()`s resumes first, or mutate client state in the precise window while a call is "in flight."

## Guard specs — the structural half of the suite

Every settled decision in [architecture.md](architecture.md) with a guard test is asserted in `tests/seams/`:

| File | Locks |
| --- | --- |
| `ClientConfigSeam.spec.ts` | Connection configuration has exactly one home (decision 4); a pre-built, per-brand `SocketConfig` is accepted at construction, adopted by reference and narrowed per brand (decision 16) |
| `AbstractClientConfigDriftSeam.spec.ts` | The three behavioural regressions that follow from a second home, plus the B2 proxy/referer-reaches-the-wire regression |
| `TransportSeam.spec.ts` | Transport injection (`setTransport()`/`getTransport()`), the bytes-on-the-wire ↔ `getPOSTData()` invariant, transport-error-discards-parseable-bytes |
| `ResponseTemplateRegistrySeam.spec.ts` | Per-instance template registry (decision 10) — highest value in the suite |
| `ClientIDNSeam.spec.ts` | CNR-only IDN command rewriting |
| `RedactionParitySeam.spec.ts` | Sensitive-field masking runs on the value, before encoding, independently on `SocketConfig` and `Response`; end-to-end, a real debug-mode `request()` never emits the actual secret through the logger (§3.3F) |
| `ColumnInterfaceCoverageSeam.spec.ts` | `Column`'s public surface is fully declared on `ColumnInterface` (RSRMID-2971) |
| `ResponsePaginationSeam.spec.ts` | Pagination arithmetic lives on `Paginator`, never on a brand `Response`, by any route (decision 18, RSRMID-2965) |
| `ResponseTemplateFactorySeam.spec.ts` | The template registry's pipeline face and Response-producing face stay two disjoint interfaces (decision 20, RSRMID-2968) |
| `ConcurrencyContractSeam.spec.ts` | The concurrency contract — safe (concurrent `request()` alone) versus unsafe (any concurrent setter/`login()`/`logout()`/`close()`) — see [architecture.md → Concurrency contract](architecture.md#concurrency-contract) |
| `ProviderResponseConformanceSeam.spec.ts` | IBS provider response conformance, structural half (§3.3A): every outcome (AVAILABLE/UNAVAILABLE/FAILURE/malformed/missing) reachable through the public `request()`/`ResponseInterface` surface, never by parsing `getPlain()`; the raw response type reachable from the root barrel |

A guard spec's header comment states the directive, the failure mode it prevents, why the guard must be structural rather than behavioural, and the mutation that proves it non-vacuous. **Never delete or weaken one to make a change pass** — see [CONTRIBUTING.md → Guard tests](../../CONTRIBUTING.md#guard-tests).

**`ColumnInterfaceCoverageSeam.spec.ts` is the one guard enforced by `pnpm run typecheck`, not by a runtime assertion.** It is a compile-time-only check: a conditional type (`keyof Concrete extends keyof Iface`) fails to typecheck if `Column` ever grows a public member absent from `ColumnInterface` — TypeScript's `keyof` already excludes `private`/`protected` members (and inherited `Object.prototype` members) when read from outside a class, so no reflection is needed the way PHP's `InterfaceCoverageSeamTest` needs it. Deliberately scoped to `Column` alone, not a general sweep over every "total" interface — see the file's own header for why widening it would require re-deriving, per interface, which are "total" versus "additive" (`ExtendedResponseInterface`/`RoleCredentialsInterface`).

**`ResponseTemplateFactorySeam.spec.ts` mixes compile-time and runtime checks.** Interface disjointness and the factory's exact method set are compile-time-only, the same `keyof`-conditional-type technique as `ColumnInterfaceCoverageSeam.spec.ts` — TS has no interface reflection, so PHP's `ReflectionClass::getMethods()` sweep over the two interfaces has no runtime equivalent here. The `createResponseFromTemplateId` hook being `protected` is checked with a `@ts-expect-error` line, same technique as `ClientConfigSeam.spec.ts`'s cross-brand-`SocketConfig` rejection. The collision case — a template whose wire text equals another template's id — is genuinely behavioural and runs for real against both brands' concrete registries.

## MONIKER duplication is intentional

`tests/MONIKER/Client.spec.ts` imports `IBS.Client`/`IBS.Response` directly and asserts against them (`expect(new monikerBarrel.Client()).to.be.instanceOf(ibsBarrel.Client)`). This mirrors decision 1 — Moniker is IBS with different endpoints — and is not a coverage gap to close by inventing Moniker-specific behaviour that doesn't exist.

## Coverage

`.c8rc.json`: `check-coverage: true`, `all: true`, `src: ["src"]`, numeric thresholds (`lines`/`statements` 92, `branches` 85, `functions` 90) — not the decorative `.nycrc` the pre-port suite shipped with (`check-coverage` unset, string thresholds, no `all`, so an unimported file simply vanished from the report). **Verified (2026-08-21):** `git show 4b5ecb6^:.nycrc` — `{"reporter": [...], "lines": 95, "branches": "82", "statements": "95"}`: no `check-coverage` key at all, `branches` is the string `"82"` not a number, no `all` key. Matches the claim exactly. Pure type/interface files (`src/*Interface.ts`, `src/types.ts`) are excluded — they're erased entirely at compile time under `verbatimModuleSyntax`, so they're never loaded as a runtime module and can't be instrumented; that's a tooling reality, not a real coverage gap. The `index.ts` barrel files **are** real runtime modules (their re-export statements execute at module-load time) and are exercised directly by `tests/index.spec.ts` for that reason.

`bail: true` in `.mocharc.json` means a red `pnpm test` run is a *truncated* run, not necessarily a complete failure list — read the first failure, fix it, and re-run rather than assuming the reported failure is the only one.
