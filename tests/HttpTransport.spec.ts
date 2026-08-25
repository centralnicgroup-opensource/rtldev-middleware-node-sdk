import { expect } from "chai";
import nock from "nock";
import { Agent } from "undici";
import { createServer } from "node:net";
import "mocha";
import { HttpTransport } from "../src/HttpTransport.ts";
import { IBS } from "../src/index.ts";
import { UnsupportedFeatureException } from "../src/Exception/UnsupportedFeatureException.ts";

/**
 * HttpTransport — the one layer cassettes cannot exercise, because they
 * replace it (see the plan's "Division of labour between the two harnesses").
 * nock covers this file at the HTTP level: headers, body encoding, non-2xx,
 * network error, and the managed/protected option rejections. Host is
 * derived from a real SocketConfig, never hardcoded, so a regression that
 * drops the request path fails loudly instead of silently matching the bare
 * host.
 */
/**
 * Bind a loopback port, read what the OS assigned, and release it — so a
 * connection to it is refused rather than answered by whatever else might
 * have been listening on a hardcoded number.
 */
async function freeLoopbackPort(): Promise<number> {
  const server = createServer();
  return new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        server.close();
        reject(new Error("expected an AddressInfo from a TCP server"));
        return;
      }
      const { port } = address;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

describe("HttpTransport", () => {
  const host = new IBS.SocketConfig().getOTEUrl();
  const url = `${host}Domain/Check`;

  afterEach(() => {
    nock.cleanAll();
  });

  it("posts the body with the expected headers and a 2xx resolves with no error", async () => {
    const scope = nock(host)
      .matchHeader("content-type", "application/x-www-form-urlencoded")
      .matchHeader("user-agent", "test-agent")
      .post("/Domain/Check", "domain=example.com")
      .reply(200, '{"status":"AVAILABLE"}');

    const transport = new HttpTransport();
    const [raw, error] = await transport.post(
      url,
      "domain=example.com",
      5,
      "test-agent",
    );

    expect(error).to.be.null;
    expect(raw).to.equal('{"status":"AVAILABLE"}');
    scope.done();
  });

  it("a non-2xx HTTP status is not a transport failure — fetch resolves normally", async () => {
    const scope = nock(host).post("/Domain/Check").reply(500, "internal error");

    const transport = new HttpTransport();
    const [raw, error] = await transport.post(
      url,
      "domain=example.com",
      5,
      "ua",
    );

    expect(error).to.be.null;
    expect(raw).to.equal("internal error");
    scope.done();
  });

  it('a network-level failure resolves as ["", errorMessage], never throws', async () => {
    const scope = nock(host)
      .post("/Domain/Check")
      .replyWithError("Could not resolve host: example.invalid");

    const transport = new HttpTransport();
    const [raw, error] = await transport.post(
      url,
      "domain=example.com",
      5,
      "ua",
    );

    expect(raw).to.equal("");
    expect(error).to.include("example.invalid");
    scope.done();
  });

  it("carries the cause chain into the error slot, not the bare 'fetch failed'", async () => {
    // A rejected fetch() reports "fetch failed" and puts the actual reason
    // one level down in `cause`. That string is what an integrator sees via
    // the httperror template's {HTTPERROR} slot, so the reason has to reach
    // it — PHP's curl_error() names the host, port and cause.
    const scope = nock(host)
      .post("/Domain/Check")
      .replyWithError(
        Object.assign(new TypeError("fetch failed"), {
          cause: new Error("connect ECONNREFUSED 127.0.0.1:9999"),
        }),
      );

    const transport = new HttpTransport();
    const [raw, error] = await transport.post(
      url,
      "domain=example.com",
      5,
      "ua",
    );

    expect(raw).to.equal("");
    expect(error).to.equal("fetch failed: connect ECONNREFUSED 127.0.0.1:9999");
    scope.done();
  });

  it("does not repeat an identical message when a cause restates its parent", async () => {
    const scope = nock(host)
      .post("/Domain/Check")
      .replyWithError(
        Object.assign(new TypeError("socket hang up"), {
          cause: new Error("socket hang up"),
        }),
      );

    const transport = new HttpTransport();
    const [, error] = await transport.post(url, "domain=example.com", 5, "ua");

    expect(error).to.equal("socket hang up");
    scope.done();
  });

  it("a cyclic cause chain terminates instead of hanging the error path", async () => {
    // A `cause` chain is caller-constructible and can be made cyclic; the
    // walk that reads it runs on the failure path and must not itself fail.
    const outer: Error & { cause?: unknown } = new TypeError("outer");
    const inner: Error & { cause?: unknown } = new Error("inner");
    outer.cause = inner;
    inner.cause = outer;

    const scope = nock(host).post("/Domain/Check").replyWithError(outer);

    const transport = new HttpTransport();
    const [, error] = await transport.post(url, "domain=example.com", 5, "ua");

    expect(error).to.equal("outer: inner: outer: inner: outer");
    scope.done();
  });

  it("refuses a caller dispatcher that would silently displace setProxy()", async () => {
    // Two homes for one setting. Letting the bag win would leave getProxy()
    // reporting a proxy that never reached the wire — the silently-inert
    // setter this port exists to remove.
    const agent = new Agent();
    const transport = new HttpTransport();
    let caught: unknown = null;
    try {
      await transport.post(url, "domain=example.com", 5, "ua", {
        proxy: "http://127.0.0.1:8080",
        dispatcher: agent,
      });
    } catch (err) {
      caught = err;
    }

    expect(caught).to.be.instanceOf(UnsupportedFeatureException);
    const e = caught as UnsupportedFeatureException;
    expect(e.getRejectedOption()).to.equal("dispatcher");
    expect(e.getReplacementSetter()).to.equal("setProxy()");
    expect(e.getOwningClass()).to.equal("HttpTransport");
    await transport.close();
    await agent.close();
  });

  it("allows a caller dispatcher when no proxy is configured, and reports the real reason it failed", async () => {
    // The collision is the problem, not the key: a dispatcher on its own is
    // a legitimate way to control pooling or TLS, and must still be accepted.
    //
    // Kept on 127.0.0.1 and pointed at a port bound and released a moment
    // earlier, so it is known-free rather than hoped-free: a caller
    // dispatcher bypasses nock's global-dispatcher patch by design, which
    // also means it bypasses `disableNetConnect()`, and any other host would
    // turn this into a real outbound lookup. What it must NOT do is raise
    // the collision exception — how the request then fails is the transport's
    // ordinary error path, already covered above.
    const port = await freeLoopbackPort();
    const agent = new Agent();
    const transport = new HttpTransport();
    let caught: unknown = null;
    let error: string | null = null;
    try {
      [, error] = await transport.post(
        `http://127.0.0.1:${String(port)}/Domain/Check`,
        "domain=example.com",
        5,
        "ua",
        { dispatcher: agent },
      );
    } catch (err) {
      caught = err;
    }

    expect(caught, "a dispatcher without a proxy is not a collision").to.be
      .null;
    expect(error, "it reached the wire and failed there, as it should").to.be.a(
      "string",
    );
    await transport.close();
    await agent.close();
  });

  it("sets the Referer header when one is configured", async () => {
    const scope = nock(host)
      .matchHeader("referer", "https://example.test/")
      .post("/Domain/Check")
      .reply(200, "ok");

    const transport = new HttpTransport();
    await transport.post(url, "d=1", 5, "ua", {
      referer: "https://example.test/",
    });

    scope.done();
  });

  it("appends caller headers, never allowing one to override a transport-owned header", async () => {
    const scope = nock(host)
      .matchHeader("x-custom", "yes")
      .post("/Domain/Check")
      .reply(200, "ok");

    const transport = new HttpTransport();
    await transport.post(url, "d=1", 5, "ua", {
      headers: { "X-Custom": "yes" },
    });
    scope.done();

    let threw = false;
    try {
      await transport.post(url, "d=1", 5, "ua", {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (err) {
      threw = true;
      expect(err).to.be.instanceOf(UnsupportedFeatureException);
      const e = err as UnsupportedFeatureException;
      // The Fetch `Headers` iterator lower-cases names, so the throw site
      // (and this accessor) hold the lower-cased form, not the caller's
      // original casing — matches PHP's "already lower-cased" contract.
      expect(e.getRejectedHeaderName()).to.equal("content-type");
      expect(e.getOwningClass()).to.equal("HttpTransport");
      expect(e.getRejectedOption()).to.be.null;
    }
    expect(threw, "restating a transport-owned header must throw").to.be.true;
  });

  it("rejects the signal/method/body options even for a plain-JS caller bypassing the type system", async () => {
    const transport = new HttpTransport();
    const expectedReplacement: { [key: string]: string | null } = {
      signal: "setSocketTimeout()",
      method: null,
      body: null,
    };
    for (const key of ["signal", "method", "body"]) {
      let threw = false;
      try {
        await transport.post(url, "d=1", 5, "ua", {
          [key]: undefined,
        });
      } catch (err) {
        threw = true;
        expect(err).to.be.instanceOf(UnsupportedFeatureException);
        const e = err as UnsupportedFeatureException;
        expect(e.getRejectedOption()).to.equal(key);
        expect(e.getOwningClass()).to.equal("HttpTransport");
        expect(e.getReplacementSetter()).to.equal(expectedReplacement[key]);
        expect(e.getRejectedHeaderName()).to.be.null;
      }
      expect(threw, `"${key}" must be rejected`).to.be.true;
    }
  });

  it("timeoutSeconds <= 0 carries the 'no timeout' meaning — no abort signal is attached", async () => {
    const scope = nock(host).post("/Domain/Check").delay(5).reply(200, "ok");

    const transport = new HttpTransport();
    const [raw, error] = await transport.post(url, "d=1", 0, "ua");

    expect(error).to.be.null;
    expect(raw).to.equal("ok");
    scope.done();
  });

  it("close() is a safe no-op when no proxy agent was ever created", async () => {
    const transport = new HttpTransport();
    await transport.close();
    await transport.close();
  });

  it("releasing a stale proxy agent whose close() rejects does not leak an unhandled rejection", async () => {
    const transport = new HttpTransport();
    const internal = transport as unknown as {
      proxyAgent: { close: () => Promise<void> } | null;
      proxyAgentUrl: string | null;
      releaseProxyAgent: () => void;
    };
    internal.proxyAgent = {
      close: () => Promise.reject(new Error("stale close blew up")),
    };
    internal.proxyAgentUrl = "http://old-proxy.test:8080";

    let unhandled: unknown = null;
    const onUnhandledRejection = (err: unknown): void => {
      unhandled = err;
    };
    process.once("unhandledRejection", onUnhandledRejection);

    internal.releaseProxyAgent();
    expect(internal.proxyAgent, "the stale agent must be cleared immediately")
      .to.be.null;
    expect(internal.proxyAgentUrl).to.be.null;

    // Give the rejected close() promise's .catch() a turn to run before
    // asserting nothing escaped as an unhandled rejection.
    await new Promise((resolve) => setImmediate(resolve));
    process.removeListener("unhandledRejection", onUnhandledRejection);
    expect(
      unhandled,
      "releaseProxyAgent() must swallow a rejecting close(), not leak it",
    ).to.be.null;
  });

  it("clearing the proxy releases the cached agent instead of leaking it", async () => {
    const transport = new HttpTransport();
    const internal = transport as unknown as {
      proxyAgent: unknown;
      proxyAgentUrl: string | null;
    };

    // Port 1 on loopback refuses immediately (no real listener) so the
    // dispatched fetch fails fast instead of hanging on DNS/connect —
    // HttpTransport's own catch turns that into ["", message], not a throw.
    await transport.post(url, "d=1", 5, "ua", {
      proxy: "http://127.0.0.1:1",
    });
    expect(internal.proxyAgent, "a proxy agent must have been created").to.not
      .be.null;
    expect(internal.proxyAgentUrl).to.equal("http://127.0.0.1:1");

    const scope = nock(host).post("/Domain/Check").reply(200, "ok");
    const [raw, error] = await transport.post(url, "d=2", 5, "ua");
    scope.done();

    expect(error).to.be.null;
    expect(raw).to.equal("ok");
    expect(
      internal.proxyAgent,
      "clearing the proxy must release the cached agent, not leave it open",
    ).to.be.null;
    expect(internal.proxyAgentUrl).to.be.null;
  });

  it("close() is idempotent after a real request created a proxy agent", async () => {
    const transport = new HttpTransport();
    const internal = transport as unknown as { proxyAgent: unknown };

    // Port 1 on loopback refuses immediately, so this fails fast — the
    // point is only that a real ProxyAgent got created along the way.
    await transport.post(url, "d=1", 5, "ua", {
      proxy: "http://127.0.0.1:1",
    });
    expect(internal.proxyAgent, "a proxy agent must have been created").to.not
      .be.null;

    await transport.close();
    expect(internal.proxyAgent, "the first close() must release it").to.be.null;
    await transport.close();
    await transport.close();
  });

  it("close() never throws, even when the agent's own teardown rejects", async () => {
    const transport = new HttpTransport();
    const internal = transport as unknown as {
      proxyAgent: { close: () => Promise<void> } | null;
    };
    internal.proxyAgent = {
      close: () => Promise.reject(new Error("agent teardown failed")),
    };

    let threw = false;
    try {
      await transport.close();
    } catch {
      threw = true;
    }
    expect(
      threw,
      "close() must swallow a rejecting agent teardown, not propagate it",
    ).to.be.false;
  });

  it("a caller's real error survives close() in a finally, even when close() itself has something to clean up that fails", async () => {
    const transport = new HttpTransport();
    const internal = transport as unknown as {
      proxyAgent: { close: () => Promise<void> } | null;
    };
    internal.proxyAgent = {
      close: () => Promise.reject(new Error("agent teardown failed")),
    };

    let caught: unknown = null;
    try {
      try {
        throw new Error("the real API error");
      } finally {
        await transport.close();
      }
    } catch (err) {
      caught = err;
    }
    expect((caught as Error).message).to.equal("the real API error");
  });
});
