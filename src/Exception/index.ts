/**
 * Barrel for `CNIC\Exception`.
 *
 * PHP gets directory-wide resolution for free from PSR-4 autoloading
 * (`use CNIC\Exception\PaginationException;` needs no index file); TS's
 * `moduleResolution: node16` has no directory-index resolution, so this file
 * exists purely to let consumers write
 * `import { PaginationException } from ".../Exception/index.js"` — it has no
 * PHP counterpart.
 */
export { CnicException } from "./CnicException.js";
export { DuplicateColumnException } from "./DuplicateColumnException.js";
export { InvalidConfigurationException } from "./InvalidConfigurationException.js";
export { InvalidDateTimeException } from "./InvalidDateTimeException.js";
export { MalformedResponseException } from "./MalformedResponseException.js";
export { PaginationException } from "./PaginationException.js";
export { UnsupportedFeatureException } from "./UnsupportedFeatureException.js";
