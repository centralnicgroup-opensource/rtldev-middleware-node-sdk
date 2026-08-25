import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { DelayedTransport } from "../Support/DelayedTransport.ts";

/**
 * Pins the concurrency contract investigated for RSRMID-2974 (previously
 * undefined — nobody had looked).
 *
 * **Directive.** A client is safe for concurrent `request()` calls ONLY
 * while nothing else mutates it concurrently: no setter (`setContext()`,
 * `setCredentials()`, `setSession()`, `setProxy()`, `setSocketTimeout()`,
 * `enableDebugMode()`/`disableDebugMode()`, `setCustomLogger()`/
 * `setLogSink()`, ...), no `login()`/`logout()`, and no `close()`, while a
 * `request()` this test cares about is in flight. Under that condition,
 * concurrent `request()`s on one client are safe for every brand (IBS,
 * Moniker, CNR with a stable session) — each call's command, URL, options
 * and timeout are captured synchronously before the one `await` in
 * `AbstractClient.performRequest()`, so two overlapping calls cannot
 * observe or corrupt each other's outbound data. Outside that condition,
 * this file documents exactly what breaks, rather than leaving it
 * undefined for the next reader to discover by incident.
 *
 * **Failure mode prevented.** Three, all found and reproduced here before
 * being written down — none was previously documented or tested:
 *
 * - `this.context` (and `this.debugMode`/`this.logger`) are read **after**
 *   the network `await`, inside `newResponse()`/the debug-log branch — not
 *   snapshotted when the call started. A `setContext()` that lands while an
 *   earlier `request()` is still in flight is what that earlier call's
 *   `Response.getContext()` reports, not the context active when it was
 *   issued. This applies to every brand identically (`CNR.Client`/
 *   `IBS.Client` both write `this.context` straight into `newResponse()`).
 * - CNR's `persistent` flag is shared, unscoped `SocketConfig` state.
 *   `login()`'s `setPersistent(true)` is visible to *any* other concurrent
 *   `request()` on the same client — including ones that never called
 *   `login()` — because command-building reads whatever the flag happens
 *   to be at the moment that particular call's synchronous phase runs,
 *   with no per-call isolation. Whichever `login()`/`logout()` finishes
 *   first turns the flag back off in its `finally`, regardless of whether
 *   another concurrent operation still wanted it on.
 * - `close()` does not cancel, wait for, or otherwise coordinate with an
 *   in-flight `request()` — it is a fire-and-forget call to
 *   `transport.close()` independent of any pending `post()`. For the
 *   production `HttpTransport` specifically, `close()` also tears down the
 *   cached proxy `ProxyAgent`; a request already in flight through that
 *   same agent may still depend on the connection pool `close()` just
 *   released. **This half is not exercised here** — a test double has no
 *   pooled resource to tear down, so this is a documented risk against the
 *   real transport, not a claim proven offline. Do not read this file's
 *   silence on that point as "verified safe."
 *
 * **Why structural.** Every one of these is a race, not a crash: nothing
 * throws, nothing type-checks differently, and a single-request test suite
 * exercises every line involved without ever triggering the interleaving.
 * `DelayedTransport` exists specifically to make the interleaving
 * deterministic (a manually-released gate, not a `setTimeout`) so the race
 * is reproducible on every run rather than occasionally, which is what a
 * behavioural assertion needs to be worth writing at all.
 *
 * **Revisit condition.** If `AbstractClient`/`CNR.Client` ever gain a
 * mutex/queue/generation-counter around setters and `request()`, or if
 * `context`/`debugMode` become per-call parameters instead of client
 * fields, this file's "unsafe" tests should start failing — update them
 * to match the new, stronger guarantee rather than deleting them.
 */
describe("Seam: the concurrency contract — what is and isn't safe on one client", () => {
  describe("safe: concurrent request() with nothing else mutating the client", () => {
    it("IBS: two concurrent request()s do not cross-talk", async () => {
      const t = new DelayedTransport();
      const cl = CF.ibs().setTransport(t).useOTESystem();

      const p1 = cl.request({ domain: "a.example" }, "Domain/Check");
      const p2 = cl.request({ domain: "b.example" }, "Domain/Check");
      expect(t.pendingCount).to.equal(2);

      t.releaseNext();
      t.releaseNext();
      await Promise.all([p1, p2]);

      expect(t.calls[0]?.data).to.include("a.example");
      expect(t.calls[0]?.data).to.not.include("b.example");
      expect(t.calls[1]?.data).to.include("b.example");
      expect(t.calls[1]?.data).to.not.include("a.example");
    });

    it("Moniker: two concurrent request()s do not cross-talk (mirrors IBS, decision 1)", async () => {
      const t = new DelayedTransport();
      const cl = CF.moniker().setTransport(t).useOTESystem();

      const p1 = cl.request({ domain: "a.example" }, "Domain/Check");
      const p2 = cl.request({ domain: "b.example" }, "Domain/Check");
      t.releaseNext();
      t.releaseNext();
      await Promise.all([p1, p2]);

      expect(t.calls[0]?.data).to.include("a.example");
      expect(t.calls[1]?.data).to.include("b.example");
    });

    it("CNR: concurrent request()s under one stable, unchanging session do not cross-talk", async () => {
      const t = new DelayedTransport();
      const cl = CF.cnr().setTransport(t).useOTESystem();
      cl.setSession("sess-stable");

      const p1 = cl.request({ COMMAND: "StatusAccount" });
      const p2 = cl.request({ COMMAND: "QueryDomainList" });
      t.releaseNext();
      t.releaseNext();
      await Promise.all([p1, p2]);

      expect(t.calls[0]?.data).to.include("sess-stable");
      expect(t.calls[1]?.data).to.include("sess-stable");
    });
  });

  describe("unsafe: this.context is read after the await, not snapshotted per call", () => {
    it("a setContext() that lands while a request is in flight changes that request's own Response.getContext()", async () => {
      const t = new DelayedTransport();
      const cl = CF.ibs().setTransport(t).useOTESystem();

      cl.setContext({ tag: "first" });
      const p1 = cl.request({ domain: "a.example" }, "Domain/Check");
      // Mutates context *after* p1's command was built and sent, but before
      // it is released — the exact "in flight" window.
      cl.setContext({ tag: "second" });
      t.releaseNext();
      const r1 = await p1;

      expect(
        r1.getContext(),
        "the in-flight request resolved with the context active when it " +
          "*resolved*, not the context active when it was issued",
      ).to.deep.equal({ tag: "second" });
    });
  });

  describe("unsafe: CNR's persistent flag has no per-call isolation", () => {
    it("a concurrent plain request() rides on login()'s persistent=true even though it never asked for it", async () => {
      const t = new DelayedTransport();
      const cl = CF.cnr()
        .setTransport(t)
        .useOTESystem()
        .setCredentials("u", "p");

      const loginP = cl.login();
      const plainP = cl.request({ COMMAND: "StatusAccount" });

      expect(t.calls[0]?.data, "login()'s own request").to.include(
        "persistent=1",
      );
      expect(
        t.calls[1]?.data,
        "the unrelated concurrent request must not have asked for a " +
          "persistent connection, but shared SocketConfig state means it did",
      ).to.include("persistent=1");

      t.releaseNext();
      await loginP;
      t.releaseNext();
      await plainP;
    });
  });

  describe("unsafe: close() does not coordinate with in-flight requests", () => {
    it("close() resolves immediately without cancelling or waiting for a pending request()", async () => {
      const t = new DelayedTransport();
      const cl = CF.ibs().setTransport(t).useOTESystem();

      const p = cl.request({ domain: "a.example" }, "Domain/Check");
      await cl.close();
      expect(t.closed).to.be.true;

      let settled = false;
      p.then(() => {
        settled = true;
      }).catch(() => {
        settled = true;
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(
        settled,
        "close() must not cancel an in-flight request — it stays pending " +
          "until the transport itself settles it",
      ).to.be.false;

      t.releaseNext();
      await p;
    });
  });
});
