/**
 * Package version, rewritten in place by the release pipeline (.releaserc.json).
 * Kept in its own file so the release regex can be anchored to a single,
 * unambiguous match instead of scanning every file for a dotted triple.
 */
export const VERSION = "11.0.0";
