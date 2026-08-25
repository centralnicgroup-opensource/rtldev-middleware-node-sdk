/**
 * Barrel for `CNIC\MONIKER`.
 *
 * PHP gets directory-wide resolution for free from PSR-4 autoloading;
 * `moduleResolution: node16` has no directory-index resolution, so this file
 * exists purely to let consumers write `import { Client } from ".../MONIKER/index.js"`
 * — it has no PHP counterpart.
 */
export { Client } from "./Client.js";
export { SocketConfig } from "./SocketConfig.js";
