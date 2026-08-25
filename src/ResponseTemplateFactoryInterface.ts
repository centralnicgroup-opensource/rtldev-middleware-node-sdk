import type { ResponseInterface } from "./ResponseInterface.js";
import type { Hash } from "./types.js";

/**
 * Contract for turning a brand's template registry into Response objects.
 *
 * Split off `ResponseTemplateManagerInterface` (RSRMID-2968): the registry
 * (add/has/get-raw) is the shape `AbstractResponseTranslator.translate()`
 * actually needs, while building a `Response` from a template id is a
 * separate, heavier capability that only a handful of call sites use
 * (`getTemplate()`/`getTemplates()` and the two `isTemplateMatch*` helpers,
 * which resolve through `getTemplate()` internally). Keeping both on one
 * interface meant every implementer had to support Response construction
 * even where only the registry was needed.
 *
 * `AbstractResponseTemplateManager` implements both interfaces — the split
 * is interface-only, not a new class.
 */
export interface ResponseTemplateFactoryInterface {
  /**
   * The Response for the given template id, or the brand's "notfound"
   * template when this registry holds no such id.
   *
   * The Response is built against **this** registry, so a template
   * registered here resolves here and nowhere else.
   */
  getTemplate(templateId: string): ResponseInterface;

  /**
   * Every template in this registry as a Response, keyed by template id.
   */
  getTemplates(): { [templateId: string]: ResponseInterface };

  /**
   * Whether the given API response hash matches a template held here, on
   * this brand's two match keys (CNR: CODE/DESCRIPTION, IBS: status/message).
   */
  isTemplateMatchHash(responseHash: Hash, templateId: string): boolean;

  /**
   * Whether the given API plain response matches a template held here, on
   * this brand's two match keys.
   *
   * @param plain API plain response
   */
  isTemplateMatchPlain(plain: string, templateId: string): boolean;
}
