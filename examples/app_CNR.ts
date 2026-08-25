/**
 * CentralNic Reseller (CNR) demo — mirrors `examples/app_CNR.php`.
 *
 * Run with `pnpm demo:cnr`. Credentials come from the environment. The
 * `dotenv/config` import below loads a local `.env` if there is one and is a
 * no-op when there is not, so the same script works locally and in CI (where
 * the variables are exported by the workflow). `dotenv` is a devDependency —
 * `examples/` is not part of the published package.
 *
 * A consumer of the published package imports from
 * `@team-internet/apiconnector`; this file imports from `../src/` so the demo
 * runs straight from source with no build step.
 */

import "dotenv/config";
import { ClientFactory } from "../src/index.js";
import type { Hash } from "../src/types.js";

// --- AUTHENTICATION ---
// CNR supports two credential styles:
//
//   1. Account login — the plain account id together with the account
//      password (a single-user, full-access login).
//
//   2. Role login — a so-called "User" in the CNR Web Interface. The login is
//      a string composed of the CNR account id, a ":" separator and the
//      role/user id (e.g. "myaccount:myrole"); authentication then uses that
//      role user's *own* password, not the account password. Roles let you
//      grant scoped, per-user access under one account.
//
// This example uses the role login. A customer may equally use the account
// login by passing the account id and account password instead.
const account = process.env.RTLDEV_MW_CI_USER_CNR;
const role = process.env.RTLDEV_MW_CI_ROLE_CNR;
const password = process.env.RTLDEV_MW_CI_ROLEPASSWORD_CNR;

if (account === undefined || role === undefined || password === undefined) {
  console.error(
    "Please provide environment variables RTLDEV_MW_CI_USER_CNR, RTLDEV_MW_CI_ROLE_CNR and RTLDEV_MW_CI_ROLEPASSWORD_CNR.",
  );
  process.exit(1);
}

// setRoleCredentials() composes the "<account id>:<role id>" login for you.

// --- SESSIONLESS API COMMUNICATION ---
console.log("--- SESSION-LESS API COMMUNICATION ----");
{
  const cl = ClientFactory.cnr(); // fka RRPproxy
  cl.useOTESystem() // LIVE System would be used otherwise by default
    .setRoleCredentials(account, role, password);
  const r = await cl.request({ COMMAND: "StatusAccount" });
  await cl.close(); // release the transport's pooled resources
  console.dir(r.getHash(), { depth: null });
}

// --- SESSION-BASED API COMMUNICATION (saveSession / reuseSession) ---
// CNR.Client logs in once and reuses the resulting API session for
// further requests. In a stateless web app every HTTP request is handled
// without the previous client object, so:
//   1. log in once, then saveSession() the login + session id into your store;
//   2. on every following request, build a fresh client and reuseSession()
//      from that store to talk to the API without logging in again.
// Below we simulate two separate requests using one `store` object in place
// of a real session store (e.g. `req.session`).
console.log("--- SESSION-BASED API COMMUNICATION ----");
const store: Hash = {};

// ---- Request #1: log in and persist the session -------------------------
// cnr() returns a fully-typed CNR.Client, so CNR-specific session
// handling (login/logout/saveSession) is available directly — no narrowing.
let cl = ClientFactory.cnr();
cl.useOTESystem().setRoleCredentials(account, role, password);
let r = await cl.login();

if (r.isSuccess()) {
  console.log("LOGIN SUCCEEDED.");
  // Persist login + session id for the next request to pick up.
  cl.saveSession(store);
  await cl.close(); // this request ends; the object is gone, the session lives on
  const socketcfg = store["socketcfg"] as { session?: string } | undefined;
  console.log(`SESSION SAVED (id: ${socketcfg?.session ?? "n/a"}).`);

  // ---- Request #2: a brand-new client rebuilds from the store -----------
  cl = ClientFactory.cnr();
  // No login() and no password needed — reuseSession() restores the account
  // login and the session id straight from the store. Point at the same
  // system the session was created on (OT&E here).
  cl.useOTESystem().reuseSession(store);
  r = await cl.request({ COMMAND: "StatusAccount" });
  if (r.isSuccess()) {
    console.log("SESSION REUSED SUCCESSFULLY (no re-login).");
    console.dir(r.getHash(), { depth: null });
  } else {
    console.log("SESSION REUSE FAILED (session may have expired).");
  }

  // Done for good: log out to invalidate the shared session.
  r = await cl.logout();
  console.log(r.isSuccess() ? "LOGOUT SUCCEEDED." : "LOGOUT FAILED.");
} else {
  console.log("LOGIN FAILED.");
}
