import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { CommandRedactor } from "../../src/CommandRedactor.ts";
import { Response as CNRResponse } from "../../src/CNR/Response.ts";
import { SensitiveFields as CNRSensitiveFields } from "../../src/CNR/SensitiveFields.ts";
import { SocketConfig as CNRSocketConfig } from "../../src/CNR/SocketConfig.ts";
import { Response as IBSResponse } from "../../src/IBS/Response.ts";
import { SensitiveFields as IBSSensitiveFields } from "../../src/IBS/SensitiveFields.ts";
import { SocketConfig as IBSSocketConfig } from "../../src/IBS/SocketConfig.ts";
import { CollectingSink } from "../Support/CollectingSink.ts";
import { SpyTransport } from "../Support/SpyTransport.ts";

/**
 * The mask as it appears in an *encoded* POST body. PHP's http_build_query()
 * uses RFC1738 and percent-encodes "*" as %2A, so "***" reaches the wire as
 * %2A%2A%2A in both SDKs. Note encodeURIComponent() does NOT encode "*", so it
 * is the wrong tool for building this expectation.
 */
const ENCODED_MASK = CommandRedactor.MASK.replace(/\*/g, "%2A");

/**
 * Directive: every brand masks its own sensitive command-parameter values —
 * CNR's `["PASSWORD","AUTH"]`, IBS/Moniker's `["password","transferAuthInfo"]`
 * — case-insensitively, through the shared `CommandRedactor.redact()`, and it
 * does so on the *value*, before that value is ever serialised onto the wire
 * (RSRMID-2938; port plan behaviour gap #11). No PHP file ports 1:1 to this
 * one — PHP's equivalent guarantee is spread across
 * `AbstractSocketConfig`/`AbstractResponse` unit coverage plus code review —
 * so this is a new, explicit seam for the Node port.
 *
 * Failure mode prevented: the pre-port Node code ran a regex over the
 * *encoded* POST string and covered `PASSWORD` only. Two ways that fails
 * silently: (1) a brand whose sensitive keys are not literally `PASSWORD`
 * (IBS's `password`/`transferAuthInfo`) leaks in the clear because the regex
 * never matches; (2) a secret value containing wire-structural characters of
 * its own (`&`, `=`, a newline) either escapes an encoded-string regex's
 * delimiter assumptions or — for CNR, whose command values are newline-joined
 * before being sent as a single `s_command` parameter — gets a chance to
 * inject a bogus extra `KEY=value` line into the command before any masking
 * runs at all. Masking the structured value first and serialising afterwards
 * makes both failure modes structurally impossible: there is no wire string
 * for an adversarial value to inject into by the time serialisation runs.
 *
 * Why the guard must be structural rather than purely behavioural: RSRMID-2938
 * is explicit that the two call sites — `AbstractSocketConfig` and
 * `AbstractResponse` — must each independently mask through their own
 * `sensitiveFields`, not have that responsibility centralised into (and
 * silently made contingent on) a single shared caller. A behavioural test
 * that only ever drives a request through the *client* (which touches both)
 * cannot tell "both mask independently" apart from "one masks and the other
 * happens to inherit the result" — the two collapse to the same observed
 * output. This file drives `SocketConfig`/`Response` directly and separately
 * to keep that distinction visible, and asserts pre-encoding order with a
 * value engineered to prove it (see the injection-shaped values below).
 *
 * Revisit condition: only if a brand's sensitive-field list changes (update
 * the `KEYS` constant, not this file) or if masking is deliberately
 * centralised into one call site (RSRMID-2938 would need to be reopened
 * first, and this file's "both mask independently" tests would need
 * removing, not weakening).
 *
 * Non-vacuity: point `CNR.Response`/`IBS.Response`'s `sensitiveFields`
 * getter at `[]` (or delete `CommandRedactor.redact()`'s case-fold) and rerun
 * — the "independently" and "case-insensitively" tests below fail
 * immediately, because they never touch `AbstractSocketConfig` at all.
 */
describe("Seam: sensitive-field redaction parity", () => {
  describe("CommandRedactor.redact() — the shared primitive", () => {
    it("masks a matching key case-insensitively", () => {
      const out = CommandRedactor.redact({ Password: "hunter2", other: "x" }, [
        "PASSWORD",
      ]);
      expect(out["Password"]).to.equal(CommandRedactor.MASK);
      expect(out["other"]).to.equal("x");
    });

    it("leaves a null value untouched even when its key matches", () => {
      // SocketConfig relies on this: a null value means "omit from the
      // request", not "log the literal string ***".
      const out = CommandRedactor.redact<string | null>({ PASSWORD: null }, [
        "PASSWORD",
      ]);
      expect(out["PASSWORD"]).to.be.null;
    });

    it("does not mutate the input object", () => {
      const input = { PASSWORD: "hunter2" };
      CommandRedactor.redact(input, ["PASSWORD"]);
      expect(input["PASSWORD"]).to.equal("hunter2");
    });

    it("leaves non-matching keys alone", () => {
      const out = CommandRedactor.redact({ DOMAIN: "example.com" }, [
        "PASSWORD",
        "AUTH",
      ]);
      expect(out["DOMAIN"]).to.equal("example.com");
    });
  });

  describe("brand sensitive-field lists (RSRMID-2938 declared sets)", () => {
    it("CNR masks PASSWORD and AUTH", () => {
      expect(CNRSensitiveFields.KEYS).to.deep.equal(["PASSWORD", "AUTH"]);
    });

    it("IBS masks password and transferAuthInfo (Moniker inherits IBS)", () => {
      expect(IBSSensitiveFields.KEYS).to.deep.equal([
        "password",
        "transferAuthInfo",
      ]);
    });
  });

  describe("CNR.SocketConfig masks its command before encoding", () => {
    it("masks PASSWORD/AUTH in the encoded POST body", () => {
      // Keys arrive here already uppercased by CommandFormatter.flattenCommand()
      // (CNR.Client.buildCommand() runs before SocketConfig ever sees a
      // command) — SocketConfig's own job is masking the value, not casing
      // the key. Case-insensitive *matching* is CommandRedactor's contract,
      // already covered directly above.
      const cfg = new CNRSocketConfig();
      const enc = cfg.getPOSTData(
        { COMMAND: "AddDomain", PASSWORD: "hunter2", AUTH: "topsecret" },
        true,
      );
      expect(enc).not.to.include("hunter2");
      expect(enc).not.to.include("topsecret");
      // The mask token is "***", and PHP's http_build_query() (RFC1738)
      // percent-encodes "*" as %2A — so the masked body reads PASSWORD=%2A%2A%2A,
      // not PASSWORD=***. getPOSTData() reproduces that, which is why the
      // expectation below encodes the mask rather than embedding it raw.
      expect(enc).to.include(`PASSWORD%3D${ENCODED_MASK}`);
      expect(enc).to.include(`AUTH%3D${ENCODED_MASK}`);
    });

    it("masks the whole value before the command lines are newline-joined, so an embedded wire-structural value cannot inject a line", () => {
      const cfg = new CNRSocketConfig();
      // An adversarial AUTH value shaped like a second, unmasked command line.
      // If masking ran on the assembled string instead of the value, this
      // could leak "REALSECRET" verbatim past a regex expecting "AUTH=...".
      const enc = cfg.getPOSTData(
        {
          COMMAND: "AddDomain",
          AUTH: "x\nDOMAIN=evil.example\nPASSWORD=REALSECRET",
        },
        true,
      );
      expect(enc).not.to.include("REALSECRET");
      expect(enc).not.to.include("evil.example");
      // See above: "*" encodes to %2A, matching PHP's http_build_query().
      expect(enc).to.include(`AUTH%3D${ENCODED_MASK}`);
    });

    it("does not mask an unmasked call (maskSecrets=false)", () => {
      const cfg = new CNRSocketConfig();
      const enc = cfg.getPOSTData(
        { COMMAND: "AddDomain", PASSWORD: "hunter2" },
        false,
      );
      expect(enc).to.include("hunter2");
    });

    // The session id is masked for the same reason s_pw is: it is not a
    // lesser credential than the password but an alternative to it —
    // setSession() clears the password precisely because the newer of the two
    // is authoritative on the wire. Masking one and logging the other left the
    // debug body carrying a working credential on exactly the
    // persistent-session path, where there is no password left beside it to
    // mask. Asserted with a login present, which is the shape the fix is
    // about: unmasked, the body reduced to login + session, i.e. everything
    // needed to authenticate. PHP shipped the identical fix in v33.0.3
    // (c926f23).
    it("masks the session id, not just the password", () => {
      const cfg = new CNRSocketConfig();
      cfg
        .setLogin(`myaccountid${cfg.getRoleSeparator()}myrole`)
        .setSession("12345678");

      const enc = cfg.getPOSTData({ COMMAND: "StatusAccount" }, true);

      expect(enc).not.to.include("12345678");
      expect(enc).to.include(`s_sessionid=${ENCODED_MASK}`);
      expect(
        enc,
        "the login is not a secret and stays readable, as in PHP",
      ).to.include("myaccountid");
    });

    it("does not mask the session id on an unmasked call", () => {
      const cfg = new CNRSocketConfig();
      cfg.setSession("12345678");

      expect(cfg.getPOSTData({ COMMAND: "StatusAccount" }, false)).to.include(
        "12345678",
      );
    });
  });

  describe("IBS.SocketConfig masks its command before encoding", () => {
    it("masks password/transferAuthInfo case-insensitively in the encoded POST body", () => {
      const cfg = new IBSSocketConfig();
      const enc = cfg.getPOSTData(
        {
          Command: "Domain/Transfer",
          Password: "hunter2",
          TransferAuthInfo: "authcode",
        },
        true,
      );
      expect(enc).not.to.include("hunter2");
      expect(enc).not.to.include("authcode");
      expect(enc).to.include(`Password=${ENCODED_MASK}`);
      expect(enc).to.include(`TransferAuthInfo=${ENCODED_MASK}`);
    });

    it("masks a value containing raw wire-structural characters (&, =) before it is ever encoded", () => {
      const cfg = new IBSSocketConfig();
      // If a naive implementation ran a regex over the final encoded query
      // string instead of the value, the secret's own "&"/"=" — already
      // correctly percent-encoded by URLSearchParams — would still appear in
      // the output verbatim (just percent-escaped) unless the value itself
      // was replaced first.
      const enc = cfg.getPOSTData(
        {
          Command: "Domain/Transfer",
          TransferAuthInfo: "sekret&password=hunter2",
        },
        true,
      );
      expect(enc).not.to.include("sekret");
      expect(enc).not.to.include("hunter2");
      expect(enc).not.to.include(encodeURIComponent("sekret&password=hunter2"));
      expect(enc).to.include(`TransferAuthInfo=${ENCODED_MASK}`);
    });
  });

  describe("Response masks its stored command independently of SocketConfig (RSRMID-2938)", () => {
    it("CNR.Response masks PASSWORD/AUTH from a raw command with no SocketConfig involved", () => {
      const r = new CNRResponse(
        "[RESPONSE]\r\ncode = 200\r\ndescription = OK\r\nEOF\r\n",
        {
          COMMAND: "AddDomain",
          password: "hunter2",
          auth: "topsecret",
        },
      );
      const cmd = r.getCommand();
      expect(cmd["password"]).to.equal(CommandRedactor.MASK);
      expect(cmd["auth"]).to.equal(CommandRedactor.MASK);
      expect(r.getCommandPlain()).not.to.include("hunter2");
      expect(r.getCommandPlain()).not.to.include("topsecret");
    });

    it("IBS.Response masks password/transferAuthInfo from a raw command with no SocketConfig involved", () => {
      const r = new IBSResponse('{"status":"SUCCESS","message":"OK"}', {
        Command: "Domain/Transfer",
        Password: "hunter2",
        TransferAuthInfo: "authcode",
      });
      const cmd = r.getCommand();
      expect(cmd["Password"]).to.equal(CommandRedactor.MASK);
      expect(cmd["TransferAuthInfo"]).to.equal(CommandRedactor.MASK);
      expect(r.getCommandPlain()).not.to.include("hunter2");
      expect(r.getCommandPlain()).not.to.include("authcode");
    });

    it("a value that only coincidentally contains the mask token is not confused with the redacted marker", () => {
      // Sanity check that assertions above are testing real masking, not
      // merely a string this test happened to also produce.
      const r = new CNRResponse(
        "[RESPONSE]\r\ncode = 200\r\ndescription = OK\r\nEOF\r\n",
        {
          COMMAND: "AddDomain",
          DOMAIN: "***.example",
        },
      );
      expect(r.getCommand()["DOMAIN"]).to.equal("***.example");
    });
  });

  describe("end-to-end: debug-mode logging never emits a sensitive command value (§3.3F)", () => {
    // The unit-level tests above prove SocketConfig/Response each mask
    // independently; this proves the thing an integration actually cares
    // about — the bytes a debug sink receives when a real request runs
    // with debug mode on — never carry the secret at all, through either
    // the "post" argument or the Response the brand logger reads from.
    it("CNR: neither the logged POST body nor the logged Response carries the real password/auth", async () => {
      const secret = "s3cr3t-cnr-password-9f2c";
      const sink = new CollectingSink();
      const cl = CF.cnr()
        .setTransport(new SpyTransport())
        .setCredentials("test.user", secret)
        .setLogSink(sink)
        .enableDebugMode();

      await cl.request({ COMMAND: "StatusAccount" });

      const emitted = sink.contents();
      expect(emitted).to.not.include(secret);
      // The logged POST body is URL-encoded, and AbstractSocketConfig.getPOSTData()
      // deliberately percent-encodes "*" as "%2A" (to match PHP's
      // http_build_query() — see that method's own comment), so the literal
      // CommandRedactor.MASK ("***") appears there as "%2A%2A%2A", not as
      // "***". Checking for the raw mask alone would have missed that.
      expect(emitted).to.include("%2A%2A%2A");
    });

    it("IBS: neither the logged POST body nor the logged Response carries the real password", async () => {
      const secret = "s3cr3t-ibs-password-9f2c";
      const sink = new CollectingSink();
      const cl = CF.ibs()
        .setTransport(new SpyTransport())
        .setCredentials("apikey", secret)
        .setLogSink(sink)
        .enableDebugMode();

      await cl.request({}, "Domain/Check");

      const emitted = sink.contents();
      expect(emitted).to.not.include(secret);
      expect(emitted).to.include("%2A%2A%2A");
    });
  });
});
