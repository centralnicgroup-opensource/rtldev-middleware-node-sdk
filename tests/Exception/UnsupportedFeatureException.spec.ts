import { expect } from "chai";
import "mocha";
import { UnsupportedFeatureException } from "../../src/Exception/UnsupportedFeatureException.ts";

/**
 * `transportOwnedOption()`/`transportOwnedHeader()` are Node's shape for the
 * caller-actionable half of PHP's three named constructors (RSRMID-2967) —
 * collapsed to two because Node's `RequestOptions` type already excludes
 * both of PHP's cURL-option rejection tables for a normally-typed caller, so
 * only one runtime guard (in `HttpTransport.post()`) is left to carry
 * structured context. See the class docblock for the full rationale.
 */
describe("UnsupportedFeatureException — structured context", () => {
  it("the plain constructor carries no structured context", () => {
    const e = new UnsupportedFeatureException("plain");
    expect(e.getRejectedOption()).to.be.null;
    expect(e.getReplacementSetter()).to.be.null;
    expect(e.getRejectedHeaderName()).to.be.null;
    expect(e.getOwningClass()).to.be.null;
  });

  describe("transportOwnedOption()", () => {
    it("carries the rejected option and owning class, with no replacement", () => {
      const e = UnsupportedFeatureException.transportOwnedOption(
        "body",
        "HttpTransport",
      );
      expect(e).to.be.instanceOf(UnsupportedFeatureException);
      expect(e.getRejectedOption()).to.equal("body");
      expect(e.getOwningClass()).to.equal("HttpTransport");
      expect(e.getReplacementSetter()).to.be.null;
      expect(e.getRejectedHeaderName()).to.be.null;
      expect(e.message).to.equal(
        'Request option "body" is owned by HttpTransport and cannot be set through the option bag.',
      );
    });

    it("names the replacement when the rejected option has one", () => {
      const e = UnsupportedFeatureException.transportOwnedOption(
        "signal",
        "HttpTransport",
        "setSocketTimeout()",
      );
      expect(e.getRejectedOption()).to.equal("signal");
      expect(e.getReplacementSetter()).to.equal("setSocketTimeout()");
      expect(e.message).to.equal(
        'Request option "signal" is owned by HttpTransport (use setSocketTimeout() instead) and cannot be ' +
          "set through the option bag.",
      );
    });
  });

  describe("transportOwnedHeader()", () => {
    it("carries the rejected header and owning class, with no option context", () => {
      const e = UnsupportedFeatureException.transportOwnedHeader(
        "Content-Type",
        "HttpTransport",
      );
      expect(e).to.be.instanceOf(UnsupportedFeatureException);
      expect(e.getRejectedHeaderName()).to.equal("Content-Type");
      expect(e.getOwningClass()).to.equal("HttpTransport");
      expect(e.getRejectedOption()).to.be.null;
      expect(e.getReplacementSetter()).to.be.null;
      expect(e.message).to.include("Content-Type");
      expect(e.message).to.include("HttpTransport");
    });
  });
});
