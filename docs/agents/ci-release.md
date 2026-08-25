# CI / Release

Workflow wiring and the two release-pipeline defects fixed in this port — the detail behind [CLAUDE.md → Build, CI & Policies](../../CLAUDE.md#build-ci--policies).

## Where the workflows live

This repo's `.github/workflows/*.yml` files are thin callers into **`centralnicgroup-opensource/rtldev-middleware-shareable-workflows`**, a separate repository shared across (presumably) more than one SDK's CI:

| This repo's workflow | Delegates to |
| --- | --- |
| `.github/workflows/release.yml` | `node-sdk-release.yml` |
| `.github/workflows/test.yml` | `node-sdk-test.yml` |
| `.github/workflows/daily-node-dependency-refresh.yml` | `daily-node-dependency-refresh.yml` |

Any change to the actual job steps — not just which scripts a job calls — is a change in that other repository, with its own PR and its own blast radius across whatever else consumes it. If a local checkout of it is available, read its actual files before repeating a claim about its current CI behaviour.

## Fix 1 — the published tarball was empty (10.0.11–10.0.15)

`package.json` declared `main: ./dist/index.js`, but `prepublish` — the build hook that produced `dist/` — is a deprecated npm lifecycle hook that **pnpm never runs**. Under npm, a plain `install` happened to trigger it as a side effect; that stopped being true the moment the repo switched to pnpm (commit `4b5ecb6`, 24 Nov 2025), and nothing in the release workflow built `dist/` explicitly. `.npmignore` — a denylist that never mentioned `dist/` — then happily packed a tarball with none of it.

**Fix:** the hook is renamed to `prepare` (which pnpm does run), and `.npmignore` is replaced with `package.json#files: ["dist", "README.md", "LICENSE"]` — an allowlist, not a denylist, so nothing new can silently sneak into a future tarball the way `rtldev-middleware-php-sdk/` (the reference clone in this working tree) or `.env` could have. Verified with `pnpm run pack:check` (`scripts/pack-check.ts`, part of `pnpm lint`) — packs the real tarball and asserts `dist/index.js`/`dist/index.d.ts` are present and `src/`/`tests/`/`examples/`/`.env`/`rtldev-middleware-php-sdk/` are not, on every run, not just once with `--dry-run`.

10.0.10 on the npm registry has 22 files under `dist/`; every published version 10.0.11–10.0.15 has zero — confirmed directly against the registry, not just against the diff. 10.0.15 is still the latest published version; the fix ships with the next release.

## Fix 2 — the release pipeline corrupted a published constant

`.releaserc.json`'s version-bump plugin used to rewrite `\d+\.\d+\.\d+` — unanchored, global — inside `src/apiclient.ts`. That pattern matched *every* dotted triple in the file, including an unrelated loopback URL constant, so every release silently rewrote `http://127.0.0.1/api/call.cgi` into something derived from the version number. Compounding it, the `@semantic-release/git` asset list named `src/apiclients.ts` — plural, a path that never existed — so the corrupted file never made it back into the repo for anyone to notice by reading it.

**Fix:** the version now lives in its own `src/version.ts`, the replacement pattern is anchored specifically to `VERSION = "\d+\.\d+\.\d+"` inside that one file, a `results:` expectation block makes a zero-or-multi-match release fail loudly instead of silently, and the asset-list typo is corrected to `src/version.ts`.

## Fix 3 — the docs step could block a release, and the underlying TS7 problem

`node-sdk-release.yml`'s `Release` step used to run `pnpm run documentation` and `pnpm exec semantic-release` in the same `run:` block. GitHub Actions runs a multi-line `run:` under `bash -e`, so a non-zero exit from the first line aborts the step before the second ever runs. `pnpm run documentation` (typedoc) was **crashing outright** — `typedoc@0.28.20`'s peer range tops out at TypeScript `6.0.x`, and at the time this SDK was on `7.0.2`. This was newly-exposed rather than newly-introduced: TS 7 landed in commit `025ff13` (2026-07-23, a routine dependency bump), and the last release before this port was `10.0.15` on 2026-05-06 — nothing releasable happened in between to trip over it until now. `typescript-eslint@8.67.0` had the identical problem (`"typescript-eslint does not support TS 7.0"`), which blocked the whole ESLint/`strictTypeChecked` layer of [project-policies.md → Static analysis](project-policies.md#static-analysis), not just docs.

**CI-side fix — landed (2026-08-21).** `node-sdk-release.yml` (in `rtldev-middleware-shareable-workflows`, a separate repo) now splits the docs-generation step out with `continue-on-error: true`, so a `pnpm run documentation` failure stays visible in the run summary without blocking `semantic-release`.

**Root-cause fix:** `typescript` is now pinned to `^6.0.3`. The initial assumption — recorded in an earlier draft of this document — was that pinning to 6.x was the disfavoured option because "this port deliberately uses TS7-only behaviour." That was false: `noUncheckedIndexedAccess` (TS 4.1), `verbatimModuleSyntax` (TS 5.0) and `noImplicitOverride` (TS 4.3) all predate TS7 by years. A real `tsc --noEmit -p tsconfig.test.json`, `tsc --declaration`, and a real `typedoc` run all succeed against TS `6.0.3` with zero source changes needed, which unblocks both typedoc and typescript-eslint (whose 8.67.0 peer range covers `6.0.x`) with one line.

Whether to commit `docs/api` (typedoc's output directory, gitignored today) or publish it straight to `gh-pages` the way the PHP SDK does is still an open, separate question — it no longer blocks anything, so it's a housekeeping decision rather than a release blocker.

## Commit conventions and the breaking-change footer

See [CLAUDE.md → Git Conventions](../../CLAUDE.md#git-conventions) for the rules. One thing worth restating here because it's a release-mechanics detail, not a style rule: **check the repo's merge strategy before writing a `BREAKING CHANGE:` footer.** semantic-release reads commit messages on `master` to decide the next version — if PRs are rebase-merged, every commit's own footer reaches `master` intact; if they're squash-merged, only the squash commit's message does, so the footer has to be moved into that squash commit's body or the major bump silently doesn't happen.
