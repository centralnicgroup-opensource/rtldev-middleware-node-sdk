/**
 * Global mocha setup (RSRMID-2974).
 *
 * Loaded once, before any spec file, via `.mocharc.json`'s `file` key (mocha
 * loads `file` entries before the `spec` glob, regardless of `--grep`).
 *
 * `pnpm test` must never touch the network: cassette replay plus the
 * `HttpTransport` nock specs are fully offline, so net connect is disabled
 * globally and re-opened only for `127.0.0.1`, for the one `node:http`
 * loopback spec that exercises a real abort/timeout — something nock cannot
 * see because it never leaves process.
 *
 * `pnpm test:record` (`RTLDEV_MW_RECORD=1`) is the opposite case: it must
 * reach the real OT&E hosts to re-record cassettes, so net connect is left
 * fully enabled instead.
 */

import nock from "nock";

function isRecording(): boolean {
  const flag = process.env["RTLDEV_MW_RECORD"];
  return flag !== undefined && flag !== "" && flag !== "0";
}

if (isRecording()) {
  nock.enableNetConnect();
} else {
  nock.disableNetConnect();
  nock.enableNetConnect("127.0.0.1");
}
