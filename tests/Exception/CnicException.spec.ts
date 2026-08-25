import { expect } from "chai";
import "mocha";
import { CnicException } from "../../src/Exception/CnicException.ts";
import { DuplicateColumnException } from "../../src/Exception/DuplicateColumnException.ts";
import { InvalidConfigurationException } from "../../src/Exception/InvalidConfigurationException.ts";
import { InvalidDateTimeException } from "../../src/Exception/InvalidDateTimeException.ts";
import { MalformedResponseException } from "../../src/Exception/MalformedResponseException.ts";
import { PaginationException } from "../../src/Exception/PaginationException.ts";
import { UnsupportedFeatureException } from "../../src/Exception/UnsupportedFeatureException.ts";

/**
 * One additive exception hierarchy rooted at CnicException (decision 12).
 * Every subclass sets `.name` as a string literal — not `new.target.name`,
 * which a minifier can rename — so it survives bundling; and `cause` is the
 * TS-native upgrade over PHP's `$previous` constructor argument.
 */
describe("Exception hierarchy", () => {
  const subclasses: [
    string,
    new (message?: string, options?: ErrorOptions) => CnicException,
  ][] = [
    ["DuplicateColumnException", DuplicateColumnException],
    ["InvalidConfigurationException", InvalidConfigurationException],
    ["InvalidDateTimeException", InvalidDateTimeException],
    ["MalformedResponseException", MalformedResponseException],
    ["PaginationException", PaginationException],
    ["UnsupportedFeatureException", UnsupportedFeatureException],
  ];

  it("CnicException extends Error and sets its own name as a string literal", () => {
    const e = new CnicException("boom");
    expect(e).to.be.instanceOf(Error);
    expect(e.name).to.equal("CnicException");
    expect(e.message).to.equal("boom");
  });

  it("CnicException accepts an empty construction and an ErrorOptions.cause", () => {
    const e0 = new CnicException();
    expect(e0.message).to.equal("");

    const root = new Error("root cause");
    const e = new CnicException("wrapped", { cause: root });
    expect(e.cause).to.equal(root);
  });

  for (const [name, Ctor] of subclasses) {
    it(`${name} extends CnicException, is catchable as one, and sets its own name`, () => {
      const e = new Ctor(`${name} message`);
      expect(e).to.be.instanceOf(
        CnicException,
        `${name} must extend CnicException`,
      );
      expect(e).to.be.instanceOf(Error);
      expect(e.name).to.equal(name);
      expect(e.message).to.equal(`${name} message`);
    });

    it(`${name} can be constructed with no message`, () => {
      const e = new Ctor();
      expect(e.name).to.equal(name);
      expect(e.message).to.equal("");
    });

    it(`${name} forwards ErrorOptions.cause to the native Error`, () => {
      const root = new Error("root cause");
      const e = new Ctor("wrapped", { cause: root });
      expect(e.cause).to.equal(root);
    });

    it(`${name} is catchable via a single "instanceof CnicException" handler`, () => {
      let caught: unknown = null;
      try {
        throw new Ctor("x");
      } catch (err) {
        caught = err;
      }
      expect(caught).to.be.instanceOf(CnicException);
    });
  }

  // MalformedResponseException extends UnsupportedFeatureException rather
  // than CnicException directly (matching PHP): CNR.Response's stringCells()
  // already raised UnsupportedFeatureException before this type existed, so
  // an existing `catch (err instanceof UnsupportedFeatureException)` at that
  // throw site must keep catching — the split is additive, not a rename.
  it("MalformedResponseException also extends UnsupportedFeatureException, so an existing catch site keeps catching", () => {
    const e = new MalformedResponseException("malformed");
    expect(e).to.be.instanceOf(UnsupportedFeatureException);
    expect(e).to.be.instanceOf(CnicException);
  });
});
