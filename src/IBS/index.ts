/**
 * Barrel for `CNIC\IBS`.
 *
 * PHP gets directory-wide resolution for free from PSR-4 autoloading;
 * `moduleResolution: node16` has no directory-index resolution, so this file
 * exists purely to let consumers write `import { Client } from ".../IBS/index.js"`
 * — it has no PHP counterpart.
 */
export { Client } from "./Client.js";
export { Logger } from "./Logger.js";
export { Response } from "./Response.js";
export { ResponseParser } from "./ResponseParser.js";
export { ResponseTemplateManager } from "./ResponseTemplateManager.js";
export { ResponseTranslator } from "./ResponseTranslator.js";
export { SensitiveFields } from "./SensitiveFields.js";
export { SocketConfig } from "./SocketConfig.js";
