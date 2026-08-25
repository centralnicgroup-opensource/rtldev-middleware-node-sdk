/**
 * Contract for a brand's response-template registry.
 *
 * A template is a canned raw API response — the brand's own built-ins
 * ("empty", "invalid", "httperror", …) plus whatever a caller registers on
 * top. The registry is what `AbstractResponseTranslator.translate()` looks a
 * raw payload up in: a payload equal to a known template id resolves to that
 * template's wire text, which is the sanctioned way to exercise a specific
 * canned response with no API round-trip.
 *
 * Every implementation must be an instance, and every instance owns its own
 * templates (RSRMID-2941). Until then the registry was a `public static`
 * array with process lifetime, so registering a template in one test class
 * changed response translation in every later one and the reset path could
 * not reliably undo it. Handing the registry to the Response that needs it,
 * rather than mutating a container the whole process shares, is what makes
 * the override scoped — do not reintroduce a static container, a singleton,
 * or a `reset()` that only exists because the state outlives its user.
 *
 * **Registry-only since RSRMID-2968.** Building a `Response` from a template
 * id is a separate capability, split onto
 * {@link ResponseTemplateFactoryInterface} — this interface is now exactly
 * the shape `AbstractResponseTranslator.translate()` needs
 * ({@link getRawTemplates}), and nothing more. `AbstractResponseTemplateManager`
 * implements both, so nothing observable changes for a caller holding a
 * concrete registry; the split only narrows what a caller who declares this
 * type can do with it.
 */
export interface ResponseTemplateManagerInterface {
  /**
   * Build this brand's wire-format template string for a response code and
   * its human-readable text (CNR: `[RESPONSE]…CODE=…DESCRIPTION=…EOF`, IBS:
   * `status=…message=…`).
   */
  generateTemplate(code: string, description: string): string;

  /**
   * Register a template on **this** registry, replacing any entry under the
   * same id, and return `this` so registrations chain.
   *
   * @param plain API plain response, or API response code when `description`
   * is given
   */
  addTemplate(
    templateId: string,
    plain: string,
    description?: string | null,
  ): this;

  /**
   * Whether this registry holds a template under the given id.
   */
  hasTemplate(templateId: string): boolean;

  /**
   * Every template in this registry as its raw wire text, keyed by template
   * id — the snapshot `AbstractResponseTranslator.translate()` resolves ids
   * against.
   */
  getRawTemplates(): { [templateId: string]: string };
}
