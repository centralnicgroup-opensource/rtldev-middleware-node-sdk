/**
 * Test support (RSRMID-2974, porting RSRMID-2910)
 *
 * Test-suite helper that wires a {@link CassetteTransport} onto a client.
 * Record vs replay is chosen by the `RTLDEV_MW_RECORD` env flag:
 *
 *  - set    → record mode: a real `HttpTransport` does the live call and the
 *             wire bytes are captured (needs OT&E credentials + throttling).
 *  - unset  → replay mode (default, CI): served from committed cassettes,
 *             fully offline — no credentials, no network, no sleep.
 */

import { HttpTransport } from "../../src/HttpTransport.ts";
import { CassetteTransport } from "./CassetteTransport.ts";
import type { AbstractClient } from "../../src/AbstractClient.ts";

export class Cassettes {
  /** Whether the suite is running in record mode. */
  public static isRecording(): boolean {
    const flag = process.env["RTLDEV_MW_RECORD"];
    return flag !== undefined && flag !== "" && flag !== "0";
  }

  /**
   * Build a cassette transport for the given directory and inject it onto
   * the client, returning the transport so the test can select cassettes on
   * it.
   */
  public static attach(client: AbstractClient, dir: string): CassetteTransport {
    const record = Cassettes.isRecording();
    const tape = new CassetteTransport(
      record ? new HttpTransport() : null,
      dir,
      record,
    );
    client.setTransport(tape);
    return tape;
  }

  /**
   * Between-test throttle for record mode only, to avoid an OT&E rate-limit
   * ban on the real API. A no-op in replay mode (offline, nothing to
   * throttle). Call from a brand client spec's `afterEach()`.
   *
   * Async rather than PHP's blocking `sleep(2)` — Node has no synchronous
   * sleep short of a busy-wait, and mocha's async test support makes an
   * awaited timer the idiomatic equivalent.
   */
  public static async throttle(): Promise<void> {
    if (!Cassettes.isRecording()) {
      return;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
}
