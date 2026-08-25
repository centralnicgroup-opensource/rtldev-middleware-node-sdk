# Issue Tracker

Work is tracked in **Jira Cloud**, project **`RSRMID`** — this document itself was produced under [RSRMID-2974](https://centralnic.atlassian.net/browse/RSRMID-2974) ("Prepare Node-SDK for IBS/Moniker/IWMN Availability check MCP"). The PHP SDK's equivalent file scopes issues to a `PHP-SDK` component; this repo's issues should carry the Node-SDK equivalent component — **confirm the exact component name in the Jira project before relying on it for filtering**, since it is not independently verified here.

Always-on rules, carried over from the PHP SDK's convention:

- **Descriptions must be ADF** (Atlassian Document Format, JSON) — never markdown, which renders literal `\n` in Jira's UI.
- **Log time before Done:** an issue should not move to **Done** without a worklog attached first.

Branch naming, PR description linking, and commit-message conventions are in [CLAUDE.md → Git Conventions](../../CLAUDE.md#git-conventions).

## Ticket references elsewhere in these docs are not independently re-verified against Jira

`RSRMID-####` numbers appear throughout `architecture.md`/`MIGRATION.md`/commit messages as labels attached to decisions this codebase's own source, tests, or the PHP checkout already verify directly — the number itself is a cross-reference, not a claim that requires Jira to back it up. Two exceptions, both explicitly flagged where they occur rather than assumed reliable:

- **RSRMID-2975** (architecture.md's "Converged" section) was filed and commented on earlier in the RSRMID-2974 session, while Atlassian MCP access was live. That filing was **not** re-confirmed this pass — only the PHP-side code claim it makes (commit `b50cd88`) was re-verified directly.
- **The `CNR.Client.login()`/`logout()` cleanup-on-throw deviation row** needs a new PHP-side ticket that, as of this pass, either has been filed (Atlassian MCP reconnected) or has not (in which case the row says so explicitly and the draft ticket text lives in the PR description, not in a ticket number that doesn't exist) — check that row's own wording rather than assuming either outcome from this note.

**Attempted and failed this session (2026-08-21):** the Atlassian MCP tools were unavailable (disconnected mid-session), and `WebFetch` against `https://centralnic.atlassian.net/browse/RSRMID-2974` returns only the unauthenticated login shell, not issue content — Jira Cloud requires authentication `WebFetch` cannot supply. No `RSRMID-####` reference in this doc set should be read as "ticket existence/status confirmed just now" unless the surrounding text says so explicitly.
