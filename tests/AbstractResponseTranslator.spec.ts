import { expect } from "chai";
import "mocha";
import { Response as CNRResponse } from "../src/CNR/Response.ts";

/**
 * AbstractResponseTranslator — the translate()/findMatch()/replacePlaceholders()
 * pipeline, exercised through CNR.Response (the translator itself is
 * protected, reached only via a brand Response). Covers behaviour gaps #1-#3:
 * the description-rewrite regex (previously built with PCRE delimiters kept
 * literally, so it never matched), the two rewrite maps, and placeholder
 * replacement being line-scoped and non-destructive of unrelated brace
 * content — this had zero direct coverage before this port.
 */
describe("AbstractResponseTranslator (via CNR.Response)", () => {
  it("an empty raw response resolves to the empty template", () => {
    expect(new CNRResponse("").getDescription()).to.include(
      "Empty API response",
    );
  });

  // Regression guard for RSRMID-2945: translate() used to read
  // `raw === "" || raw === "0"`, a transliteration artifact of PHP's falsy
  // check (both "" and "0" are false there), so a real "0" payload was
  // reported as an empty response. "0" matches no registered template id and
  // carries neither CODE nor DESCRIPTION, so it must fall through to the
  // "invalid" template like any other unparseable body — never to "empty".
  it("a literal '0' raw response is not treated as empty", () => {
    const r = new CNRResponse("0");
    expect(r.getDescription()).to.not.include("Empty API response");
    expect(r.getCode()).to.equal(423);
    expect(r.getDescription()).to.equal(
      "Invalid API response. Contact Support",
    );
  });

  it("rewrites a known plain-string description via DESCRIPTION_REGEX_MAP, substituting {COMMAND}", () => {
    const raw =
      "[RESPONSE]\r\nCODE=545\r\nDESCRIPTION=Authorization failed; Operation forbidden by ACL\r\nEOF\r\n";
    const r = new CNRResponse(raw, { COMMAND: "AddDomain" });
    expect(r.getDescription()).to.equal(
      "Authorization failed; Used Command `AddDomain` not white-listed by your Access Control List",
    );
  });

  it("falls through to the raw-pattern map when the plain-string map does not match", () => {
    const raw =
      "[RESPONSE]\r\nCODE=545\r\nDESCRIPTION=Authorization failed for object; wrong auth code supplied\r\nEOF\r\n";
    const r = new CNRResponse(raw, { COMMAND: "TransferDomain" });
    expect(r.getDescription()).to.include(
      "The provided Authorization Code (EPP Code) is incorrect",
    );
  });

  it("leaves an unmatched description untouched", () => {
    const raw =
      "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Command completed successfully\r\nEOF\r\n";
    const r = new CNRResponse(raw);
    expect(r.getDescription()).to.equal("Command completed successfully");
  });

  describe("replacePlaceholders()", () => {
    it("substitutes a known placeholder, strips an unknown UPPER token, and leaves other brace content alone", () => {
      const raw =
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=Connect to {CONNECTION_URL} token={UNKNOWNTOKEN} spf=%{i}\r\nEOF\r\n";
      const r = new CNRResponse(
        raw,
        {},
        { CONNECTION_URL: "https://api.example/" },
      );
      expect(r.getDescription()).to.equal(
        "Connect to https://api.example/ token= spf=%{i}",
      );
    });

    it("only rewrites the DESCRIPTION line, leaving other lines' brace content untouched", () => {
      const raw =
        "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=No braces here\r\nPROPERTY[NOTE][0]={NOT_A_PLACEHOLDER}\r\nEOF\r\n";
      const r = new CNRResponse(
        raw,
        {},
        { CONNECTION_URL: "https://api.example/" },
      );
      expect(r.getDescription()).to.equal("No braces here");
      expect(r.getColumn("NOTE")?.getStringByIndex(0)).to.equal(
        "{NOT_A_PLACEHOLDER}",
      );
    });
  });

  describe("error resolution (behaviour gap #14)", () => {
    it("a declared transport error resolves to httperror with {HTTPERROR} injected", () => {
      const r = new CNRResponse("", {}, {}, {}, null, "Connection timed out");
      expect(r.isSuccess()).to.be.false;
      expect(r.getDescription()).to.include("Connection timed out");
    });

    it('error !== "" gates the {HTTPERROR} injection, not error !== null', () => {
      // resolveTemplateId() treats "" as a declared (non-null) error, so it
      // still selects "httperror" — but the injection itself is separately
      // gated on `error !== ""`, so the {HTTPERROR} placeholder is left for
      // replacePlaceholders() to strip as an ordinary unknown UPPER token,
      // producing the template's bare wording with no parenthesised detail.
      const withEmptyError = new CNRResponse("", {}, {}, {}, null, "");
      expect(withEmptyError.getDescription()).to.equal(
        "Command failed due to HTTP communication error.",
      );

      // A null error never selects "httperror" at all — it falls through to
      // the plain "empty" template instead.
      const withNullError = new CNRResponse("", {}, {}, {}, null, null);
      expect(withNullError.getDescription()).to.include("Empty API response");
    });
  });
});
