import { expect } from "chai";
import "mocha";
import { IDNCommandRewriter as R } from "../../src/CNR/IDNCommandRewriter.ts";

/**
 * Direct unit tests for `CNIC.CNR.IDNCommandRewriter`, ported from PHP's
 * `tests/CNR/IDNCommandRewriterTest.php`.
 *
 * These rules used to live on `AbstractClient` and were only reachable
 * through a factory-built client (RSRMID-2922); now the module has its own
 * public surface, so every rule — including the OBJECTID/OBJECTCLASS special
 * case — is asserted directly, with no client involved. See
 * `tests/seams/ClientIDNSeam.spec.ts` for the structural guard that this
 * rewrite stays here rather than migrating back onto a shared base.
 *
 * Node's `idna-uts46-hx` always converts synchronously with no vendor
 * extension to skip (unlike PHP's `ext-intl`), so there is no `setUp()` skip
 * condition to port.
 */
describe("CNR.IDNCommandRewriter", () => {
  it("converts matching keys", () => {
    const out = R.rewrite({
      NAMESERVER0: "ns1.münchen.de",
      DNSZONE: "münchen.de",
      PARENTDOMAIN: "köln.example",
    });

    expect(out["NAMESERVER0"]).to.equal("ns1.xn--mnchen-3ya.de");
    expect(out["DNSZONE"]).to.equal("xn--mnchen-3ya.de");
    expect(out["PARENTDOMAIN"]).to.equal("xn--kln-sna.example");
  });

  it("converts the short NS key form (RSRBE-7149)", () => {
    const out = R.rewrite({ NS1: "ns1.münchen.de" });
    expect(out["NS1"]).to.equal("ns1.xn--mnchen-3ya.de");
  });

  it("leaves ASCII values untouched", () => {
    // The API converts DOMAIN params itself, and an ASCII value has nothing
    // to convert — the command must reach the wire byte-identical.
    const cmd = { NAMESERVER0: "ns1.example.com", DNSZONE: "example.com" };
    expect(R.rewrite(cmd)).to.deep.equal(cmd);
  });

  it("ignores non-matching keys", () => {
    const cmd = { FOO: "münchen.de", COMMAND: "AddDomain" };
    expect(R.rewrite(cmd)).to.deep.equal(cmd);
  });

  it("matches keys case-insensitively", () => {
    const out = R.rewrite({ dnszone: "münchen.de" });
    expect(out["dnszone"]).to.equal("xn--mnchen-3ya.de");
  });

  it("converts OBJECTID for a matching OBJECTCLASS (RSRTPM-3167)", () => {
    // OBJECTID is a pattern parameter in the CNR API and does not accept
    // IDNs, so it is converted — but only when OBJECTCLASS says it holds a
    // domain-like object.
    const out = R.rewrite({ OBJECTID: "münchen.de", OBJECTCLASS: "DOMAIN" });
    expect(out["OBJECTID"]).to.equal("xn--mnchen-3ya.de");
  });

  it("skips OBJECTID for an unrelated OBJECTCLASS", () => {
    const cmd = { OBJECTID: "münchen.de", OBJECTCLASS: "CONTACT" };
    expect(R.rewrite(cmd)).to.deep.equal(cmd);
  });

  it("skips OBJECTID when OBJECTCLASS is absent", () => {
    const cmd = { OBJECTID: "münchen.de" };
    expect(R.rewrite(cmd)).to.deep.equal(cmd);
  });

  it("preserves key order", () => {
    // The rewrite happens after CommandFormatter's priority sort, so it must
    // rewrite values in place and never reorder keys.
    const out = R.rewrite({
      COMMAND: "AddDomain",
      DNSZONE: "münchen.de",
      PARENTDOMAIN: "köln.example",
    });
    expect(Object.keys(out)).to.deep.equal([
      "COMMAND",
      "DNSZONE",
      "PARENTDOMAIN",
    ]);
  });

  it("returns an empty command unchanged", () => {
    expect(R.rewrite({})).to.deep.equal({});
  });
});
