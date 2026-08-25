# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct (below), please follow it in all your interactions with the project.

## Development

Coding standards, testing conventions and the architecture are documented in [CLAUDE.md](CLAUDE.md) and [docs/agents/](docs/agents/). Run `pnpm lint` and `pnpm test` before opening a pull request.

### Where a change gets documented

[CLAUDE.md](CLAUDE.md) is a working brief, read in full on every task, so its size is a running cost — it stays at one imperative line per rule. The long-form material has fixed homes, and a change should land in them rather than in a new CLAUDE.md paragraph:

- A **`BREAKING CHANGE:`** commit must extend [MIGRATION.md](MIGRATION.md) (the consumer upgrade path — a `→ vX.0.0` section plus its compatibility-table row, linked from the commit footer) and [docs/agents/architecture.md](docs/agents/architecture.md) (the decision record: what was rejected, the failure mode prevented, the guard spec that locks it). Neither is a reason to touch CLAUDE.md.
- Rationale, alternatives considered and ticket history go to `docs/agents/*.md` — architecture decisions to `architecture.md`, test-harness detail to `testing.md`, version/packaging/tooling policy to `project-policies.md`, CI and release to `ci-release.md`.
- Edit CLAUDE.md only when a rule needed on _every_ task actually changes, and keep the pointer there rather than a summary: a summary next to its source is a second copy that drifts.

### Guard tests

Settled structural decisions in this SDK are each locked by a **guard spec** — the `tests/seams/*.spec.ts` files. They exist because undoing one of those decisions is _behaviour-preserving on the day it lands_: a base-class default would return exactly what the brand returns today, an inlined `new HttpTransport()` behaves identically to an injected one. No behavioural test can see that arrive, so the guards assert structure through reflection instead (`Object.getOwnPropertyNames`, prototype-method identity checks, `"method" in instance`).

Two rules follow, and they cut in opposite directions:

- **Never delete or weaken a guard spec to make a change pass.** A failing guard means you are undoing a decision, not fixing a test. Read the spec's header comment and the matching entry in [docs/agents/architecture.md](docs/agents/architecture.md) first; if the decision should genuinely be reopened, that is a discussion and a ticket, not a diff.
- **A new guard spec must carry its own rationale in its header comment**, because that comment is the only thing a future contributor is guaranteed to read before touching it. State four things: the directive, the failure mode it prevents, why the guard has to be structural rather than behavioural, and the one condition that would justify revisiting the decision. `tests/seams/ResponseTemplateRegistrySeam.spec.ts` is the reference example.

Then prove the guard is not vacuous: apply the mutation it is supposed to refuse, confirm the guard fails, and confirm the rest of the suite stays green — that green suite is the whole argument for the test existing. Note that `.mocharc.json` sets `bail: true`, so a plain `pnpm test` halts at the first failure; set the guard aside temporarily (skip it, or comment it out) to observe the "nothing else fails" half, then restore it.

**Check the exit code, not the summary line.** If the thing a guard is refusing is a type-level absence rather than a wrong runtime value — the whole point of decision 7 (sessions are CNR-only, absent by type) — assert it at compile time too: a `// @ts-expect-error` line inside the same spec file, next to the runtime reflection half, proving `ClientFactory.ibs().setSession("x")` fails to compile. This needs `tsconfig.test.json` to actually type-check `tests/` (it does) — without that precondition, the compile-time half of a guard silently passes no matter what it names.

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

### Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
- Focusing on what is best not just for us as individuals, but for the overall
  community

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or advances of
  any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or email address,
  without their explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Community leaders have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

### Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include using an official email address,
posting via an official social media account, or acting as an appointed
representative at an online or offline event.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
[INSERT CONTACT METHOD].
All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

### Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

#### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

#### 2. Warning

**Community Impact**: A violation through a single incident or series of
actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or permanent
ban.

#### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified period of time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

#### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior, harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within the
community.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.1, available at
[https://www.contributor-covenant.org/version/2/1/code_of_conduct.html][v2.1].

Community Impact Guidelines were inspired by
[Mozilla's code of conduct enforcement ladder][Mozilla CoC].

For answers to common questions about this code of conduct, see the FAQ at
[https://www.contributor-covenant.org/faq][FAQ]. Translations are available at
[https://www.contributor-covenant.org/translations][translations].

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
[Mozilla CoC]: https://github.com/mozilla/diversity
[FAQ]: https://www.contributor-covenant.org/faq
[translations]: https://www.contributor-covenant.org/translations
