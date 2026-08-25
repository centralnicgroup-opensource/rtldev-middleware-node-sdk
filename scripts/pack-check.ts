/**
 * CNIC
 * Copyright © Team Internet Group PLC
 *
 * Consumer-install smoke test (RSRMID-2974 review). `pnpm test` replays
 * cassettes against `src/`; `pnpm typecheck` type-checks `src/`+`tests/`.
 * Neither ever builds, packs, installs or imports the *published artifact* —
 * which is exactly the defect class that shipped in 10.0.11–10.0.15: `main`
 * pointing at a `dist/` the tarball did not contain. This script closes that
 * gap by doing, for real, what a consumer's `npm install` does: pack the
 * real tarball, install it into a throwaway directory outside this repo,
 * and import it as `@team-internet/apiconnector` — never by relative path
 * into `src/`, which would prove nothing about the tarball.
 *
 * Wired into `pnpm lint` (see `package.json`), never into a workflow file —
 * the shared CI workflow's `test_matrix` job already depends on `pnpm run
 * lint`, so this is the one lever this repo has into CI without editing
 * `.github/workflows/*`.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PACKAGE_NAME = "@team-internet/apiconnector";
const TSC = join(REPO_ROOT, "node_modules", ".bin", "tsc");

// Paths that must never reach a consumer's node_modules — the ones that
// broke 10.0.11–10.0.15 (a missing dist/) and the ones a leaked `files`
// allowlist would otherwise let through (source, tests, examples, secrets,
// the PHP checkout this repo happens to carry alongside itself).
const FORBIDDEN_TARBALL_PREFIXES = [
  "package/src/",
  "package/tests/",
  "package/examples/",
  "package/rtldev-middleware-php-sdk/",
];
const FORBIDDEN_TARBALL_PATHS = ["package/.env"];
const REQUIRED_TARBALL_PATHS = [
  "package/dist/index.js",
  "package/dist/index.d.ts",
];

let failures = 0;

function fail(message: string): void {
  failures++;
  console.error(`pack:check FAILED — ${message}`);
}

function run(cmd: string, args: string[], cwd: string): string {
  return execFileSync(cmd, args, { cwd, encoding: "utf8" });
}

console.log("pack:check: packing the real tarball...");
const packDir = mkdtempSync(join(tmpdir(), "apiconnector-pack-"));
const consumerDir = mkdtempSync(join(tmpdir(), "apiconnector-consumer-"));

try {
  run("pnpm", ["pack", "--pack-destination", packDir], REPO_ROOT);
  const tarballs = readdirSync(packDir).filter((f) => f.endsWith(".tgz"));
  const [tarballFilename] = tarballs;
  if (tarballFilename === undefined || tarballs.length !== 1) {
    fail(
      `expected exactly one tarball in ${packDir}, found ${tarballs.length}`,
    );
    process.exit(1);
  }
  const tarballPath = join(packDir, tarballFilename);
  console.log(`pack:check: tarball is ${tarballFilename}`);

  // --- Tarball content assertions ---------------------------------------
  const entries = run("tar", ["-tzf", tarballPath], REPO_ROOT)
    .trim()
    .split("\n");

  for (const required of REQUIRED_TARBALL_PATHS) {
    if (!entries.includes(required)) {
      fail(`tarball is missing "${required}"`);
    }
  }
  for (const entry of entries) {
    if (FORBIDDEN_TARBALL_PATHS.includes(entry)) {
      fail(`tarball must not contain "${entry}"`);
    }
    for (const prefix of FORBIDDEN_TARBALL_PREFIXES) {
      if (entry.startsWith(prefix)) {
        fail(
          `tarball must not contain "${entry}" (matches forbidden prefix "${prefix}")`,
        );
      }
    }
  }

  // --- Install into a throwaway consumer, outside the repo --------------
  console.log(`pack:check: installing into ${consumerDir}...`);
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "pack-check-consumer",
        private: true,
        version: "0.0.0",
        type: "module",
      },
      null,
      2,
    ),
  );
  run("pnpm", ["add", tarballPath], consumerDir);

  // --- Runtime smoke: ClientFactory constructs all three brand clients --
  const esmProbe = `
    import { ClientFactory } from ${JSON.stringify(PACKAGE_NAME)};
    const clients = {
      cnr: ClientFactory.cnr(),
      ibs: ClientFactory.ibs(),
      moniker: ClientFactory.moniker(),
    };
    for (const [brand, client] of Object.entries(clients)) {
      if (client === null || client === undefined) {
        console.error("FAIL: ClientFactory." + brand + "() returned nothing");
        process.exit(1);
      }
    }

    let deepImportResolved = true;
    try {
      await import(${JSON.stringify(`${PACKAGE_NAME}/dist/CNR/Client.js`)});
    } catch {
      deepImportResolved = false;
    }
    if (deepImportResolved) {
      console.error("FAIL: a deep import into dist/ resolved — the exports map must block this");
      process.exit(1);
    }

    console.log("pack:check: runtime smoke OK — all three brand clients construct, deep import is blocked");
  `;
  writeFileSync(join(consumerDir, "probe.mjs"), esmProbe);
  console.log(run("node", ["probe.mjs"], consumerDir).trim());

  // --- A TS consumer importing the package type-checks -------------------
  writeFileSync(
    join(consumerDir, "consumer.ts"),
    `import { ClientFactory } from ${JSON.stringify(PACKAGE_NAME)};\n` +
      `const cnr = ClientFactory.cnr();\n` +
      `cnr.useOTESystem();\n` +
      `export {};\n`,
  );
  writeFileSync(
    join(consumerDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          module: "node16",
          moduleResolution: "node16",
          target: "es2022",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["consumer.ts"],
      },
      null,
      2,
    ),
  );
  run(TSC, ["-p", "tsconfig.json"], consumerDir);
  console.log(
    "pack:check: TS consumer type-checks against the installed package OK",
  );
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
} finally {
  rmSync(packDir, { recursive: true, force: true });
  rmSync(consumerDir, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`pack:check: ${failures} failure(s)`);
  process.exit(1);
}
console.log("pack:check: all checks passed");
