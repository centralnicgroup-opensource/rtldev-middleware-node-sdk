/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import type { ResponseInterface } from "./ResponseInterface.js";
import type { ResponseParserInterface } from "./ResponseParserInterface.js";
import type { ResponseTemplateFactoryInterface } from "./ResponseTemplateFactoryInterface.js";
import type { ResponseTemplateManagerInterface } from "./ResponseTemplateManagerInterface.js";
import type { Hash } from "./types.js";

/**
 * Shared base for all registrar ResponseTemplateManager implementations.
 *
 * The template container plus its add/get/has/match operations are identical
 * across brands; only the built-in template strings, the generateTemplate()
 * wire format, the two hash keys used for matching, and the concrete Response /
 * ResponseParser classes differ. Concrete subclasses supply those via the
 * abstract hooks below.
 *
 * **The container is per instance** (RSRMID-2941, decision #10) — no
 * `getInstance()`, no static container. The built-ins live in an immutable
 * per-brand hook ({@link builtinTemplates}) and are copied into each new
 * instance, so an override via {@link addTemplate} is scoped to the object
 * that received it and there is nothing left to reset.
 *
 * `builtinTemplates()`/`matchKeys()` are PHP `abstract protected static` hooks,
 * ported as plain instance methods (TS has no abstract statics — see the "PHP
 * construct -> TypeScript" table); calling `this.builtinTemplates()` from the
 * constructor is safe because it is a prototype method, not a subclass field
 * (see the field-initialisation-order trap in docs/agents/architecture.md).
 *
 * `getTemplate()` and `generateTemplate()` are declared abstract here too: PHP
 * never implements them at this level either (each brand's wire format and
 * "notfound" fallback differ too much to share), so this mirrors PHP leaving
 * them unimplemented rather than adding a Node-only default.
 *
 * Implements both halves of the RSRMID-2968 split
 * ({@link ResponseTemplateManagerInterface} the registry,
 * {@link ResponseTemplateFactoryInterface} the Response-building methods) —
 * every concrete brand manager gets both from this one base, unchanged.
 */
export abstract class AbstractResponseTemplateManager
  implements ResponseTemplateManagerInterface, ResponseTemplateFactoryInterface
{
  /**
   * This registry's templates (template id => raw wire text), seeded from the
   * brand's built-ins and mutated only by {@link addTemplate}.
   */
  private readonly templates: { [templateId: string]: string };

  protected constructor() {
    this.templates = { ...this.builtinTemplates() };
  }

  /**
   * The brand's built-in templates (template id => raw wire text).
   *
   * Declared as a hook rather than a property so the built-ins cannot be
   * written to: each instance gets a copy, and no route exists to change what
   * the *next* instance starts from.
   */
  protected abstract builtinTemplates(): { [templateId: string]: string };

  /**
   * Create a brand Response instance from a template id, resolving it
   * against **this** registry.
   *
   * Named for what it is actually called with since RSRMID-2968:
   * {@link getTemplates} used to pass this hook a template's raw wire text
   * directly, bypassing the id-based lookup {@link getTemplate} performs —
   * a template whose wire text happened to collide with a *different*
   * template's id would then resolve to the wrong Response. Every call site
   * now passes a template id, never raw text, so the parameter name says so.
   */
  protected abstract createResponseFromTemplateId(
    templateId: string,
  ): ResponseInterface;

  /**
   * Instantiate the brand's response parser.
   *
   * The template-manager twin of `AbstractResponse.newResponseParser()`: both
   * name the same brand parser, so the shared pipeline can parse a plain
   * response without each subclass repeating the call.
   */
  protected abstract newResponseParser(): ResponseParserInterface;

  /**
   * The two response-hash keys this brand compares when matching a template
   * (code/description equivalent, e.g. CODE/DESCRIPTION or status/message).
   */
  protected abstract matchKeys(): readonly [string, string];

  public abstract generateTemplate(code: string, description: string): string;

  public abstract getTemplate(templateId: string): ResponseInterface;

  /**
   * Register a template on this registry.
   *
   * @param plain API plain response, or API response code when `description` is given
   */
  public addTemplate(
    templateId: string,
    plain: string,
    description?: string | null,
  ): this {
    this.templates[templateId] =
      description === null || description === undefined
        ? plain
        : this.generateTemplate(plain, description);
    return this;
  }

  /**
   * Every template in this registry as a Response, keyed by template id.
   */
  public getTemplates(): { [templateId: string]: ResponseInterface } {
    const templates: { [templateId: string]: ResponseInterface } = {};
    for (const key of Object.keys(this.templates)) {
      templates[key] = this.createResponseFromTemplateId(key);
    }
    return templates;
  }

  /**
   * Every template in this registry as its raw wire text.
   */
  public getRawTemplates(): { [templateId: string]: string } {
    // A fresh copy, not the live map: PHP's `return $this->templates;` is
    // safe because PHP arrays are copy-on-write value types. Returning
    // this.templates directly here would let an external write reach back
    // into this instance's registry through the read side — exactly the
    // per-instance isolation RSRMID-2941 exists to guarantee (see
    // tests/seams/ResponseTemplateRegistrySeam.spec.ts).
    return { ...this.templates };
  }

  /**
   * Check if given template exists in this registry.
   */
  public hasTemplate(templateId: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.templates, templateId);
  }

  /**
   * Check if given API response hash matches a given template by code and description.
   */
  public isTemplateMatchHash(responseHash: Hash, templateId: string): boolean {
    return this.matches(this.getTemplate(templateId).getHash(), responseHash);
  }

  /**
   * Check if given API plain response matches a given template by code and description.
   *
   * Parsed with no command on purpose: a template is not tied to one, and the
   * brand parsers that read `cmd` use it only to pick their wire branch (IBS:
   * JSON when the command is empty or asks for it, plain text otherwise).
   * Templates are plain "key=value" text, which the JSON-first branch reaches
   * through its own plain-text fallback — so both routes yield the same hash.
   */
  public isTemplateMatchPlain(plain: string, templateId: string): boolean {
    return this.matches(
      this.getTemplate(templateId).getHash(),
      this.newResponseParser().parse(plain),
    );
  }

  /**
   * Compare two response hashes on this brand's match keys.
   *
   * A key absent from either hash means "no match", not a warning: the
   * response being compared is arbitrary caller input (see
   * {@link isTemplateMatchHash}), so `{status: "SUCCESS"}` against a template
   * carrying a `message` must answer false rather than compare `undefined`.
   */
  private matches(templateHash: Hash, responseHash: Hash): boolean {
    for (const key of this.matchKeys()) {
      if (
        !Object.prototype.hasOwnProperty.call(templateHash, key) ||
        !Object.prototype.hasOwnProperty.call(responseHash, key)
      ) {
        return false;
      }
      if (templateHash[key] !== responseHash[key]) {
        return false;
      }
    }
    return true;
  }
}
