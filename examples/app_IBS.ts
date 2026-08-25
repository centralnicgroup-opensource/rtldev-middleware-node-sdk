/**
 * Internet.bs (IBS) demo — mirrors `examples/app_IBS.php`.
 *
 * Run with `pnpm demo:ibs`. See `app_CNR.ts` for notes on env loading and the
 * `../src/` import path.
 */

import "dotenv/config";
import { ClientFactory } from "../src/index.js";

const user = process.env.RTLDEV_MW_CI_USER_IBS;
const password = process.env.RTLDEV_MW_CI_USERPASSWORD_IBS;

if (user === undefined || password === undefined) {
  console.error(
    "Please provide environment variables RTLDEV_MW_CI_USER_IBS and RTLDEV_MW_CI_USERPASSWORD_IBS.",
  );
  process.exit(1);
}

// --- SESSIONLESS API COMMUNICATION ---
console.log("--- SESSION-LESS API COMMUNICATION ----\n");
const cl = ClientFactory.ibs();
cl.useOTESystem() // LIVE System would be used otherwise by default
  .setCredentials(user, password)
  .enableDebugMode();

// This platform exposes many endpoints under one host and the *path* selects
// the operation, so it is passed as the second argument — there is no default
// that works.
const info = await cl.request({ domain: "tronexats.com" }, "Domain/Info");
console.log(info.getPlain());
console.dir(info.getHash(), { depth: null });

// --- AVAILABILITY CHECK ---
// Domain/Check is what the IBS/Moniker availability MCP calls (RSRMID-2974).
// Note the status vocabulary: AVAILABLE and UNAVAILABLE are both *successes* —
// they report the domain's registrability, not a failure. Only FAILURE is an
// error, which is why isSuccess() is true for both of the first two.
console.log("\n--- AVAILABILITY CHECK ----\n");
const check = await cl.request({ domain: "tronexats.com" }, "Domain/Check");
console.log(`isSuccess(): ${String(check.isSuccess())}`);
console.log(`status:      ${String(check.getHash()["status"])}`);

await cl.close(); // release the transport's pooled resources

// --- SESSION BASED API COMMUNICATION ---
console.log("\n\n--- SESSION-BASED API COMMUNICATION ----");
console.log("-> Not supported for this brand.");
