"use strict";

import {
    APIClient
} from "../dist/apiclient.js";

const cl = new APIClient();

// choose endpoint system and set credentials
cl.useOTESystem();
cl.setCredentials(process.env.CNR_TEST_USER || '', process.env.CNR_TEST_PASSWORD || '');
cl.enableDebugMode();
// SESSION LESS
let r = await cl.request({
    COMMAND: "StatusAccount",
});

console.dir(r.getPlain());
console.dir(r.getHash());
console.dir(r.getListHash());

// SESSION BASED
// optional: access on a subuser account
// cl.setUserView("...");

// --- Perform Login ---
r = await cl.login();
if (r.isSuccess()) {
    console.log("LOGIN -> SUCCEEDED");

    // --- Perform API requests reusing the API session ---
    r = await cl.request({
        COMMAND: "StatusAccount",
    });
    console.dir(r.getHash());

    // --- Perform Logout ---
    r = await cl.logout();
    if (r.isSuccess()) {
        console.log("LOGOUT -> SUCCEEDED");
    } else {
        console.log("LOGOUT -> FAILED");
    }
} else {
    console.log("LOGIN -> FAILED");
}
