/**
 * CNR bulk/throughput demo — mirrors `examples/bulk_app_CNR.php`.
 *
 * Compares sessionless against session-based communication over the same
 * number of requests. Not wired to a `demo:*` script, matching the PHP SDK.
 *
 *   npx tsx examples/bulk_app_CNR.ts
 */

import "dotenv/config";
import { ClientFactory } from "../src/index.js";

const user = process.env.RTLDEV_MW_CI_USER_CNR;
const role = process.env.RTLDEV_MW_CI_ROLE_CNR;
const rolepassword = process.env.RTLDEV_MW_CI_ROLEPASSWORD_CNR;

const loopno = 10;

if (user === undefined || role === undefined || rolepassword === undefined) {
  console.error(
    "Please provide environment variables RTLDEV_MW_CI_USER_CNR, RTLDEV_MW_CI_ROLE_CNR and RTLDEV_MW_CI_ROLEPASSWORD_CNR.",
  );
  process.exit(1);
}

// --- SESSIONLESS API COMMUNICATION ---
console.log("--- SESSION-LESS API COMMUNICATION ----");
{
  const cl = ClientFactory.cnr(); // fka RRPproxy
  cl.useOTESystem() // LIVE System would be used otherwise by default
    .setRoleCredentials(user, role, rolepassword);

  // performance.now() is the monotonic clock — unlike Date.now() it cannot be
  // dragged backwards by an NTP correction mid-run, which is what you want
  // when the number being printed is a duration.
  const start = performance.now();
  for (let i = 1; i <= loopno; i++) {
    console.log(`########### Iteration ${i} (NOSESSION) ###########`);
    const r = await cl.request({ COMMAND: "StatusAccount" });
    console.log(r.getCommandPlain());
    console.log(r.getPlain());
    console.log("################################################\n");
  }
  await cl.close();
  console.log(
    `Time: ${((performance.now() - start) / 1000).toFixed(3)} seconds`,
  );
}

// --- SESSION BASED API COMMUNICATION ---
console.log("--- SESSION-BASED API COMMUNICATION ----");
{
  // cnr() returns a fully-typed CNR.Client, so session handling
  // (login/logout) and role credentials are available directly — no narrowing.
  const cl = ClientFactory.cnr(); // fka RRPproxy
  cl.useOTESystem() // LIVE System would be used otherwise by default
    .setRoleCredentials(user, role, rolepassword);
  const login = await cl.login();

  if (!login.isSuccess()) {
    console.log("LOGIN FAILED.");
    await cl.close();
    process.exit(1);
  }
  console.log("LOGIN SUCCEEDED.");

  const start = performance.now();
  for (let i = 1; i <= loopno; i++) {
    console.log(`########### Iteration ${i} (SESSION) ###########`);
    const r = await cl.request({ COMMAND: "StatusAccount" });
    console.log(r.getCommandPlain());
    console.log(r.getPlain());
    console.log("###############################################\n");
  }

  // Perform session close and logout, releasing the transport as well.
  const out = await cl.logout();
  console.log(out.isSuccess() ? "LOGOUT SUCCEEDED." : "LOGOUT FAILED.");
  console.log(
    `Time: ${((performance.now() - start) / 1000).toFixed(3)} seconds`,
  );
}
