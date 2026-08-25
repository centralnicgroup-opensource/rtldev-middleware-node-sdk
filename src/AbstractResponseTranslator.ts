/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import type { ResponseTemplateManagerInterface } from "./ResponseTemplateManagerInterface.js";
import type { StringHash } from "./types.js";

/**
 * Shared base for all registrar ResponseTranslator implementations.
 *
 * The translate()/findMatch() pipeline is identical across brands: empty->"empty",
 * an explicit `error` argument resolving to the "httperror" template with
 * `{HTTPERROR}` injection (see {@link resolveTemplateId}), invalid-template
 * fallback, the two description-map rewrite loops, findMatch(), and placeholder
 * replacement. Only a few narrow points differ, supplied by the abstract hooks
 * below:
 *   - the brand's default template registry (newTemplateManager())
 *   - the two description rewrite maps (descriptionRegexMap()/descriptionRawPatternMap())
 *   - the response field carrying the human-readable text (fieldName():
 *     "description" for CNR, "message" for IBS)
 *   - the "missing/empty required field" check that triggers the invalid fallback
 *     (hasMissingRequiredFields(): CODE/DESCRIPTION for CNR, status for IBS)
 *
 * PHP's `abstract protected static` hooks become plain **instance** methods
 * here (see the "PHP construct -> TypeScript" table): TS has no abstract
 * statics, and `translate()` itself becomes an instance method so it can call
 * them through `this` with real virtual dispatch — a brand translator is
 * instantiated once per call site (`new CNR.ResponseTranslator().translate(...)`)
 * rather than invoked as a static.
 *
 * Placeholder stripping is unified on the per-field, per-token callback: unknown
 * `{UPPER}` tokens are removed only inside the human-readable field, leaving
 * `{UPPER}` content in other data fields (e.g. an SPF record's `%{i}`) untouched.
 */
export abstract class AbstractResponseTranslator {
  /**
   * The brand's default template registry, used when the caller supplies none.
   *
   * A factory, not a shared instance: handing every caller the same object
   * would put the process-global container back that RSRMID-2941 removed —
   * one `addTemplate()` on it would be visible to every later translate().
   */
  protected abstract newTemplateManager(): ResponseTemplateManagerInterface;

  /**
   * Plain-string description keys for translation; keys are `preg_quote`-escaped
   * (see {@link pregQuote}) before matching, so they are literal text, not regex.
   *
   * Defaults to no rewrites (RSRMID-2970). A brand that rewrites nothing used
   * to have to say so explicitly — an empty map plus an override returning
   * it — which is boilerplate asserting an absence, not a decision recorded.
   *
   * **This is not the "never no-op" case.** That directive is about a
   * capability the platform cannot honour, where a silent discard hides a
   * caller's mistake. An empty rewrite map is the opposite: a complete and
   * truthful answer to "which messages does this brand rewrite?", from a
   * brand whose answer is "none". Nothing is discarded and no caller is
   * misled — the two rewrite loops in {@link translate} iterate over
   * nothing, exactly as they did over an empty map.
   */
  protected descriptionRegexMap(): StringHash {
    return {};
  }

  /**
   * Raw regex pattern keys for translation; keys are used as-is (not escaped).
   *
   * Defaults to no rewrites, for the reasons on {@link descriptionRegexMap}.
   */
  protected descriptionRawPatternMap(): StringHash {
    return {};
  }

  /**
   * Name of the response field carrying the human-readable text
   * ("description" for CNR, "message" for IBS).
   */
  protected abstract fieldName(): string;

  /**
   * Whether the raw response is missing or has an empty required field
   * (CNR: CODE/DESCRIPTION, IBS: status) and should therefore fall back to the
   * "invalid" template.
   *
   * @param raw API raw response (already normalised)
   */
  protected abstract hasMissingRequiredFields(raw: string): boolean;

  /**
   * Translate a raw api response.
   *
   * @param raw API raw response
   * @param cmd requested API command (already sanitized)
   * @param placeholders vars the response description has dynamically replaced (e.g. CONNECTION_URL)
   * @param error transport error, if any (see AbstractClient.performRequest()); non-null means `raw` is unusable and the "httperror" template is substituted instead
   * @param templates registry to resolve template ids against; null uses the brand's built-ins (see newTemplateManager())
   */
  public translate(
    raw: string,
    cmd: StringHash,
    placeholders: StringHash = {},
    error: string | null = null,
    templates?: ResponseTemplateManagerInterface | null,
  ): string {
    // Hint: Empty API Response (replace {CONNECTION_URL} later)
    // Only a genuinely empty body is "empty". A literal "0" body is a real
    // payload and must reach the normal resolve/parse path: the former
    // `|| raw === "0"` arm was a transliteration of PHP's falsy check
    // (empty($raw)/!$raw), for which "" and "0" are both false — never a
    // deliberate rule, and never even idiomatic in JS, where "0" is truthy
    // (RSRMID-2945, matching PHP's af20745).
    let newraw = raw === "" ? "empty" : raw;

    const rawTemplates = (
      templates ?? this.newTemplateManager()
    ).getRawTemplates();

    // Explicit call for a static template, or a declared transport failure
    const templateId = this.resolveTemplateId(newraw, error, rawTemplates);
    if (templateId !== null) {
      // don't use getTemplate() as it leads to endless loop as of again
      // creating a response instance
      // Non-null: resolveTemplateId() only ever returns a key it has itself
      // already verified with hasOwnProperty against this same rawTemplates
      // (see its own body) — the guard is inside that call, not on this line.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newraw = rawTemplates[templateId]!;
      if (error !== null && error !== "") {
        newraw = newraw.replace(/\{HTTPERROR\}/, ` (${error})`);
      }
    }

    // Missing or empty required field(s) in API response
    if (
      this.hasMissingRequiredFields(newraw) &&
      Object.prototype.hasOwnProperty.call(rawTemplates, "invalid")
    ) {
      // Non-null: the hasOwnProperty check immediately above this line.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newraw = rawTemplates["invalid"]!;
    }

    // generic API response description rewrite
    let matched = false;
    for (const [key, replacement] of Object.entries(
      this.descriptionRegexMap(),
    )) {
      const result = this.findMatch(
        AbstractResponseTranslator.pregQuote(key),
        newraw,
        replacement,
        cmd,
      );
      if (result.matched) {
        newraw = result.subject;
        matched = true;
        break;
      }
    }
    if (!matched) {
      for (const [pattern, replacement] of Object.entries(
        this.descriptionRawPatternMap(),
      )) {
        const result = this.findMatch(pattern, newraw, replacement, cmd);
        if (result.matched) {
          newraw = result.subject;
          break;
        }
      }
    }

    return this.replacePlaceholders(newraw, placeholders);
  }

  /**
   * Resolve the template id to look up for this response, or null when there
   * is no matching template — in which case the caller falls through to the
   * hasMissingRequiredFields()/"invalid" path, exactly as if this method did
   * not exist.
   *
   * A non-null `error` resolves to "httperror", taking priority over `raw` —
   * this is what replaced the former "httperror|" sentinel that used to be
   * smuggled through `raw` itself — but ONLY if `rawTemplates` actually
   * declares that id: the registry is caller-supplied, and a third-party
   * brand's need not include "httperror" at all.
   *
   * Otherwise `raw` is checked against `rawTemplates`: a raw payload equal to
   * a known template id (e.g. "empty", "invalid", or one registered via
   * `ResponseTemplateManagerInterface.addTemplate()`) is the sanctioned
   * mocking route — constructing a Response/Translator call with the template
   * id as `raw` is how a test exercises a specific canned response with no
   * real API round-trip. This is deliberate, load-bearing behaviour, not a
   * leak.
   *
   * @param rawTemplates the caller's already-bound registry snapshot
   */
  private resolveTemplateId(
    raw: string,
    error: string | null,
    rawTemplates: StringHash,
  ): string | null {
    if (error !== null) {
      return Object.prototype.hasOwnProperty.call(rawTemplates, "httperror")
        ? "httperror"
        : null;
    }
    return Object.prototype.hasOwnProperty.call(rawTemplates, raw) ? raw : null;
  }

  /**
   * Find a match for `regex` in `subject` and return the replaced text.
   *
   * We match if the field's value starts with the given description; it also
   * matches if followed by additional text.
   *
   * The pattern is built unescaped and interpolated directly (never wrapped in
   * `/…/` delimiters, which is what made the Node predecessor of this method
   * never match at all — see fix history) — `regex` is either already
   * `pregQuote()`-escaped literal text or a genuine raw pattern, both of which
   * are valid to interpolate straight into `new RegExp()`.
   */
  private findMatch(
    regex: string,
    subject: string,
    replacement: string,
    cmd: StringHash,
  ): { matched: boolean; subject: string } {
    const field = this.fieldName();
    const pattern = `${field}\\s*=\\s*${regex}([^\\r\\n]+)?`;

    if (!new RegExp(pattern, "i").test(subject)) {
      return { matched: false, subject };
    }

    let resolvedReplacement = replacement;
    if (Object.prototype.hasOwnProperty.call(cmd, "COMMAND")) {
      resolvedReplacement = resolvedReplacement
        .split("{COMMAND}")
        .join(cmd["COMMAND"]);
    }

    // A fresh "g"-flagged RegExp for the replace, distinct from the "i"-only
    // one used for the test() above — a single stateful "g" regex would let
    // lastIndex leak between the two calls.
    const updated = subject.replace(
      new RegExp(pattern, "gi"),
      `${field}=${resolvedReplacement}`,
    );
    return updated !== subject
      ? { matched: true, subject: updated }
      : { matched: false, subject };
  }

  /**
   * Replace known placeholders in the human-readable field while preserving
   * literal brace content and unknown-token content in other fields.
   *
   * Operates line-by-line on the brand's field (see fieldName()): provided
   * placeholders are substituted, unknown `{UPPER}` tokens are stripped, and
   * any other brace content (e.g. lowercase `%{i}` in SPF records) is left
   * untouched. Runs unconditionally at the end of translate() — never a
   * greedy strip over the whole response, which would corrupt data fields
   * containing braces.
   */
  protected replacePlaceholders(raw: string, placeholders: StringHash): string {
    const field = this.fieldName();
    const lineRegex = new RegExp(`^(${field}\\s*=\\s*)(.*)$`, "gim");

    return raw.replace(
      lineRegex,
      (fullMatch: string, prefix: string, description: string): string => {
        if (!description.includes("{")) {
          return fullMatch;
        }

        const replacedDescription = description.replace(
          /\{([^}]+)\}/g,
          (tokenMatch: string, token: string): string => {
            if (Object.prototype.hasOwnProperty.call(placeholders, token)) {
              // Non-null: the hasOwnProperty check on the line above.
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return placeholders[token]!;
            }
            if (/^[A-Z][A-Z0-9_]*$/.test(token)) {
              return "";
            }
            return tokenMatch;
          },
        );

        return prefix + replacedDescription;
      },
    );
  }

  /**
   * PHP's `preg_quote($str, "/")`: escape every regex metacharacter (plus the
   * "/" delimiter char) so a plain description string matches itself literally
   * when interpolated into a pattern.
   */
  private static pregQuote(value: string): string {
    return value.replace(/[.\\+*?[^\]$(){}=!<>|:\-#/]/g, "\\$&");
  }
}
