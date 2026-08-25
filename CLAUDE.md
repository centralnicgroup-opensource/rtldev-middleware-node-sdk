# Project Instructions

> **This file is read in full on every task**, so it holds only rules needed on nearly every task — one imperative line each. Rationale, alternatives and RSRMID history belong in the linked `docs/agents/*.md`; never summarise them back here. Which doc a change lands in: [CONTRIBUTING.md → Where a change gets documented](CONTRIBUTING.md#where-a-change-gets-documented).

**Verify by running, not by reading or asserting.** A rationale that sounds plausible is a claim, not a fact, until something ran against it — enable the rule and see what it flags rather than grep for the pattern by hand, fetch the actual file from the actual repo rather than describe an edit as landed, install the alternate version and compile rather than reason about whether it "should" work. This has been the single recurring source of wrong statements in this project's own history (a merged-sounding CI fix that was an uncommitted local diff, a "TS7-only behaviour" rationale that was never checked, a `grep` for `!` that found 0 where enabling the rule found 4, a `src/CNR/Client.ts` docblock still calling PHP's identical bug "probable" and "worth raising upstream" after PHP had already shipped the fix and the ticket had already converged) — the fix each time was cheap and mechanical, never more research. **A claim about external state can land in a source docblock, not only in `docs/agents/*.md`** — sweep both when re-verifying.

## Project Overview

This is the **Node.js SDK** for Team Internet backend APIs (CentralNic Reseller, Internet.bs, Moniker), published as `@team-internet/apiconnector`. It is a TypeScript parity port of the [PHP SDK](https://github.com/centralnicgroup-opensource/rtldev-middleware-php-sdk) (`CNIC\` namespace) — where PHP does something, do it the same way; where PHP does not, do not invent it unless the language forces you to. This is the default, not an absolute: a documented exception process exists — see [architecture.md → Deviations from PHP](docs/agents/architecture.md#deviations-from-php) for every place this port already diverges and why, and add a new deviation there (with justification) rather than treating this line as blocking one that's actually warranted.

## Architecture

Facts below; the class inventory is derivable from `src/`, and the **full deep dive** (every settled decision, alternatives rejected, the traps this port hit) is in [docs/agents/architecture.md](docs/agents/architecture.md) — read it before changing anything structural.

- **One TypeScript file per PHP file, same name in PascalCase, same relative directory** — `CNIC\` → `src/`, mirroring `rtldev-middleware-php-sdk/src/`. `moduleResolution: node16` has no directory-index resolution, so each directory (and the root) additionally carries an `index.ts` barrel PHP does not need.
- **Brands are siblings, not parent/child.** `CNR.Response`/`IBS.Response` both extend `AbstractResponse`. `MONIKER.Client extends IBS.Client` (same platform; only `SocketConfig` differs) and declares no `Response`/`Parser`/`Translator`/`Logger`/`TemplateManager` of its own. No brand declares a `Record` or a `Column` — both are shared concretes, and value-type narrowing goes on a native return type on the interface (`getStringByIndex()`/`getStringByKey()`), never a generic.
- **Response construction and the `request()` lifecycle are template methods.** Brands supply `translate()`/`populate()`/`newRecord()`/`newResponseParser()` and `buildCommand()`/`newResponse()`/`newSocketConfig()` — never reimplement `AbstractResponse`'s constructor or `AbstractClient.performRequest()`.
- **Connection configuration lives on the `SocketConfig`, never on the client** — reach it via `AbstractClient.getSocketConfig()` (covariant `CNR.Client.getSocketConfig(): CNR.SocketConfig` is the one narrowing point). This is what stopped 18 client-side forwarders accumulating in PHP; do not add a client-side copy of a config-owned value.
- **The response-template registry is per-instance**, threaded through the `Response` constructor's `templates` argument — never a static/singleton container. See `tests/seams/ResponseTemplateRegistrySeam.spec.ts`; this is the one defect Node actually shipped once (the pre-port SDK's `ResponseTemplateManager.getInstance()`), so it is the highest-value guard in the suite.
- **Type-hint against interfaces**, all exported from the package root: `ColumnInterface`, `RecordInterface`, `ResponseInterface`, `ExtendedResponseInterface`, `RoleCredentialsInterface`, `ResponseParserInterface`, `ResponseTemplateManagerInterface` (registry) / `ResponseTemplateFactoryInterface` (opt-in Response production), `TransportInterface`, `LoggerInterface`, `LogSinkInterface`.
- **The 5 CNR-only Response capabilities** (`getQueuetime`, `getRuntime`, `isTmpError`, `isPending`, `getListHash`) live only on `ExtendedResponseInterface`, absent from IBS/Moniker by type — not present-and-throwing.
- **Sessions and role credentials are CNR-only, by type.** `login`/`logout`/`saveSession`/`reuseSession`/`getSession`/`setSession`/`setRoleCredentials` exist only on `CNR.Client` and must not exist on `IBS.Client`/`MONIKER.Client` at all.

**Four transliteration traps, permanently relevant to any future change here** (full detail: [architecture.md](docs/agents/architecture.md#three-traps)):

1. **Field-initialisation order.** A base constructor reading a subclass value (`sensitiveFields`, `metaKeys`, `liveUrl`/`oteUrl`) must read a `get` accessor, never a plain field — JS runs a subclass's field initialisers _after_ `super()` returns, so a plain field reads `undefined` at the moment the base constructor needs it.
2. **Merge direction is inverted.** PHP's `+` keeps the **left** operand on a duplicate key; JS object spread keeps the **right**. A literal `{...a, ...b}` translation of PHP's `$a + $b` is backwards — it must be `{...b, ...a}`.
3. **`Record` shadows TypeScript's built-in `Record<K,V>`.** This SDK's own class is named `Record` (PHP-parity, non-negotiable), so `src/types.ts` defines `Hash`/`StringHash` for what PHP expresses as `array<string,mixed>` PHPDoc. **Never use TypeScript's `Record<K,V>` utility type anywhere in this codebase** — the ban is deliberate, not an oversight.
4. **`intdiv()` truncates toward zero; `Math.floor()` rounds toward -Inf.** They agree on every non-negative operand and diverge silently below zero. Port PHP's `intdiv()` as **`Math.trunc()`**, never `Math.floor()` (`Math.ceil()` needs no such care).

**Load-bearing decisions are locked by guard tests** — `tests/seams/*.spec.ts`. They are structural/reflection tests by necessity: undoing one of these decisions is behaviour-preserving on the day it lands, so a green suite is not evidence the decision still holds.

**If your change makes a guard spec fail, you are undoing a decision, not fixing a test.** Read the guard's header comment (directive, failure mode, revisit condition) and its entry in [architecture.md](docs/agents/architecture.md) before going further. Never delete or weaken a guard as a passing cleanup.

## Coding Standards

### TypeScript Style

- **Strict mode plus** `noImplicitOverride`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, target `es2022`. `tsconfig.test.json` type-checks `src/`, `tests/` **and** `scripts/` — keep it that way, it is the precondition for the `@ts-expect-error` absence guards.
- **Zero `any` in `src/`.** Enforced by `pnpm lint`'s `eslint` step (typescript-eslint `strictTypeChecked`) — see [project-policies.md → Static analysis](docs/agents/project-policies.md#static-analysis) for the rule overrides that keep it from fighting this codebase's own conventions (static-utility classes, `Hash`/`StringHash` bracket access, the field-init-order trap).
- Relative imports need an explicit `.js` extension (`moduleResolution` is node16-family): `import { Record } from "../Record.js"`.
- Exceptions extend `Error`, set `this.name` as a **string literal** (not `new.target.name`, which a minifier can rename), and use `ErrorOptions.cause` for PHP's `$previous`.
- `enum` in PHP becomes a frozen const object + union type sharing its name, not a TS `enum` (see `src/System.ts`).
- Only the network step is async: `TransportInterface.post()`/`close()`, `performRequest()`, `request()`, pagination requests, `login`/`logout`, `AbstractClient.close()`. Everything else — config setters, `buildCommand()`, translation, parsing, Response construction — stays synchronous, because the sealed-Response invariant depends on the constructor doing the whole assembly and a constructor cannot be async.

### Naming

- Classes: PascalCase, one per file, filename matches (e.g. `ResponseParser.ts`, `Paginator.ts`)
- Methods/properties: camelCase (e.g. `getColumnKeys`, `getRecordsLimitation`)
- Constants: UPPER_SNAKE_CASE (e.g. `SensitiveFields.KEYS`)
- Import aliases for cross-brand disambiguation: short uppercase abbreviations (`import { ResponseParser as RP } from "./ResponseParser.js"`)

### Class Patterns

- Setters use a fluent interface (`: this` return), matching PHP's `: static`.
- **Exceptions:** throw from the `Exception/` hierarchy (base `CnicException extends Error`). Reuse `UnsupportedFeatureException` (capability absent on this platform, or a transport-owned option/header), `MalformedResponseException` (the wire sent a shape the SDK's data model has no way to hold — extends `UnsupportedFeatureException`, not `CnicException`, so an existing catch site keeps catching), `PaginationException`, `InvalidConfigurationException`, `InvalidDateTimeException`, `DuplicateColumnException`; add a `CnicException` subclass for a genuinely new failure mode — the hierarchy is additive. Never throw a bare `Error` or declare an exception type outside `src/Exception/`.
- Sensitive command fields must be masked before storage/logging via `CommandRedactor.redact()`, using the brand's own `SensitiveFields.KEYS` — masking runs on the value, before encoding, independently on both `SocketConfig` and `Response` (RSRMID-2938; do not centralise it into one call site).

### File Header

```ts
/**
 * CNIC[\<SubNamespace>]
 * Copyright © Team Internet Group PLC
 */
```

## Testing

Rules below; harness detail (cassettes, seam specs, doubles) is in [docs/agents/testing.md](docs/agents/testing.md).

- **Framework:** Mocha + `tsx` + Chai + nock, config `.mocharc.json`. Coverage via c8, gated by `.c8rc.json` (`check-coverage: true`, real thresholds — not decorative).
- **No real API calls in `pnpm test`.** `request()`-path tests replay committed cassettes offline (`tests/{CNR,IBS,MONIKER}/cassettes/`); re-record against OT&E only with `pnpm test:record` when the exercised API behaviour changes. `nock.disableNetConnect()` runs globally in `tests/setup.ts`.
- **Mocking:** register a canned response on a `ResponseTemplateManager` instance and hand it to the `Response` constructor's `templates` argument, or use the test doubles in `tests/Support/` (`SpyTransport`, `SpyResponseParser`, `CassetteTransport`). Do not reintroduce a static/singleton template container.
- **MONIKER specs may mirror IBS ones and import IBS classes** — intentional (same platform, no MONIKER-specific behaviour beyond endpoints). Do not flag it as a coverage gap.
- **Adding a guard spec (`tests/seams/*.spec.ts`)?** Its header comment must state the directive, the failure mode prevented, why the guard must be structural, and what would justify revisiting the decision — then prove it non-vacuous by applying the mutation it refuses and confirming the guard actually fails.

### Running Tests

```bash
pnpm test          # mocha + c8 — cassette replay, fully offline, coverage gate enforced
pnpm test:record   # re-record request() cassettes against OT&E (needs RTLDEV_MW_CI_* creds)
pnpm run typecheck # tsc --noEmit -p tsconfig.test.json — src/, tests/ AND scripts/
pnpm lint          # prettier --check + typecheck + fallow + pack:check (see project-policies.md for what's NOT yet gated)
pnpm run compile   # tsc --declaration, clean build to dist/
```

## Build, CI & Policies

Short reminders; full detail in the linked docs.

- **Node versions — [project-policies.md](docs/agents/project-policies.md):** `engines` in `package.json` is the source of truth; CI matrix comes from the shared workflow's `RTLDEV_MW_CI_NODE_MATRIX` repo variable.
- **Package manager is pnpm only** — every script, lockfile and CI step assumes it. Do not reintroduce an npm-era assumption (a `prepublish` hook, an npm-only `overrides` key) without checking it actually runs under pnpm first.
- **Distribution — [project-policies.md](docs/agents/project-policies.md):** `package.json#files` (`["dist", "README.md", "LICENSE"]`) and `#exports` (`"."` only) keep the published tarball lean and the single-barrel entry point enforced. `"."`-only means new surface is added as a namespaced export from the root barrel (`src/index.ts`), never as a new subpath — it enforces _how_ capability is added, not that it cannot be. Because `README.md` is the only doc that ships, a relative link in it may only target a shipping path or an internal anchor — `MIGRATION.md`, `examples/`, `docs/` must use absolute `github.com` URLs.
- **Static analysis — [project-policies.md](docs/agents/project-policies.md):** `pnpm lint` = prettier + typecheck + `eslint` (typescript-eslint `strictTypeChecked`) + `fallow` (`dead-code` + `dupes`, config in `.fallowrc.jsonc`) + `pack:check` (`scripts/pack-check.ts`, packs the real tarball and installs it into a throwaway directory outside the repo — the only gate that ever touches the _published artifact_ rather than `src/`). Real and enforced — verified to actually fail on a deliberately introduced `any`, an unformatted file, a genuinely dead export, and (for `pack:check`) a `dist/` the tarball does not contain. **`typescript` is pinned to `^6.0.3`**, not `7.x` — both `typedoc` and `typescript-eslint` refuse to run on TS7; see [ci-release.md](docs/agents/ci-release.md) for why 6.x needed zero source changes.
- **`fallow` suppressions live in `.fallowrc.jsonc`** (`ignoreExports`, `usedClassMembers`, `ignoreFindings`), not scattered inline comments — the one exception is `circular-dependency`, which fallow itself says has no config-level override, only a file-level `// fallow-ignore-file circular-dependency` comment.
- **CI / Actions — [ci-release.md](docs/agents/ci-release.md):** workflows delegate to `rtldev-middleware-shareable-workflows` (a separate repo). The `continue-on-error` fix for the docs-generation step landed there 2026-08-21 — verify current state by reading that repo's actual file before repeating either claim, since this line will go stale exactly as its predecessor did.

## Git Conventions

- **Commit messages:** Angular/Conventional Commits with **mandatory scope**: `<type>(<scope>): <summary>` — e.g. `fix(transport): reject a second Content-Type header`. Never append a `Co-Authored-By:` trailer.
- **Commit type selection:** `fix`/`feat` are reserved for `src/` changes — they trigger a release. Everything else uses a non-releasing type: `ci`, `build`, `chore`, `docs`, `test`, `refactor`.
- **Breaking changes:** add a `BREAKING CHANGE: <summary>` line to the commit body (blank line after the subject) — this triggers a major bump. In the **same change** you must extend [MIGRATION.md](MIGRATION.md) with a `→ vX.0.0` section plus its compatibility-table row, and link that section from the commit footer.
- **Check the repo's merge strategy before writing a `BREAKING CHANGE:` footer.** If PRs are squash-merged, the footer must live in the squash commit body, or the major bump will not happen.
- **Default branch:** `master`. Versioning: semantic-release via the CI release workflow.

## Do NOT

- Read, display, or expose the contents of `.env` — it contains secrets
- Add dependencies without explicit request — this is a lightweight SDK
- Throw a bare `Error` or declare exception types outside `src/Exception/`
- Reintroduce a static/singleton response-template registry
- Add a client-side copy of anything `AbstractSocketConfig` already owns
- Use TypeScript's built-in `Record<K,V>` utility type anywhere in this codebase
- Add `Co-Authored-By:` trailers to commit messages

## Agent skills & reference docs

Detailed, on-demand reference lives under `docs/agents/` — read the relevant file when the task calls for it:

- **[architecture.md](docs/agents/architecture.md)** — architecture deep dive: every settled decision, the three transliteration traps, every deviation from PHP and why.
- **[testing.md](docs/agents/testing.md)** — cassette record/replay harness, seam specs, doubles, MONIKER/IBS duplication.
- **[project-policies.md](docs/agents/project-policies.md)** — Node version policy, lockfiles, distribution/`files` allowlist, lint toolchain (including the TS7/TS6 story and every eslint rule override), secrets scheme.
- **[ci-release.md](docs/agents/ci-release.md)** — CI/GitHub Actions wiring, the shared-workflows repo, the docs/release decoupling fix.
- **[issue-tracker.md](docs/agents/issue-tracker.md)** — Jira Cloud, project `RSRMID`.
