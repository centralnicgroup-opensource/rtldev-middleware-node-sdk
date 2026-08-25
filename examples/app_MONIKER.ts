/**
 * Moniker demo — mirrors `examples/app_MONIKER.php`.
 *
 * Run with `pnpm demo:moniker`. Moniker is the same API platform as IBS; only
 * the endpoints differ, which is why this file is a near-copy of `app_IBS.ts`.
 */

import "dotenv/config";
import { ClientFactory } from "../src/index.js";

const user = process.env.RTLDEV_MW_CI_USER_MONIKER;
const password = process.env.RTLDEV_MW_CI_USERPASSWORD_MONIKER;

if (user === undefined || password === undefined) {
  console.error(
    "Please provide environment variables RTLDEV_MW_CI_USER_MONIKER and RTLDEV_MW_CI_USERPASSWORD_MONIKER.",
  );
  process.exit(1);
}

// --- SESSIONLESS API COMMUNICATION ---
console.log("--- SESSION-LESS API COMMUNICATION ----\n");
const cl = ClientFactory.moniker();
cl.useOTESystem() // LIVE System would be used otherwise by default
  .setCredentials(user, password)
  .enableDebugMode();
const r = await cl.request({ tld: "nl" }, "Domain/Tldinfo");
await cl.close(); // release the transport's pooled resources
console.dir(r.getHash(), { depth: null });

// --- SESSION BASED API COMMUNICATION ---
console.log("\n\n--- SESSION-BASED API COMMUNICATION ----");
console.log("-> Not supported for this brand.");
