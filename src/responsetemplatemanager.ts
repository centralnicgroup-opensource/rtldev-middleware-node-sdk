import { ResponseParser } from "./responseparser.js";
import { Response } from "./response.js";

/**
 * ResponseTemplateManager Singleton Class
 */
export class ResponseTemplateManager {
  /**
   * Get ResponseTemplateManager Instance
   * @returns ResponseTemplateManager Instance
   */
  public static getInstance(): ResponseTemplateManager {
    if (!ResponseTemplateManager.instance) {
      ResponseTemplateManager.instance = new ResponseTemplateManager();
    }
    return ResponseTemplateManager.instance;
  }
  /**
   * ResponseTemplateManager Instance
   */
  private static instance: ResponseTemplateManager;
  /**
   * template container
   */
  public templates: any;

  private constructor() {
    this.templates = {
      404: this.generateTemplate("421", "Page not found"),
      500: this.generateTemplate("500", "Internal server error"),
      empty: this.generateTemplate("423", "Empty API response. Probably unreachable API end point {CONNECTION_URL}"),
      error: this.generateTemplate("421", "Command failed due to server error. Client should try again"),
      expired: this.generateTemplate("530", "SESSION NOT FOUND"),
      httperror: this.generateTemplate("421", "Command failed due to HTTP communication error"),
      invalid: this.generateTemplate("423", "Invalid API response. Contact Support"),
      nocurl: this.generateTemplate("423", "API access error: curl_init failed"),
      notfound: this.generateTemplate("500", "Response Template not found"),
      unauthorized: this.generateTemplate("530", "Unauthorized")
    };
  }

  /**
   * Generate API response template string for given code and description
   * @param code API response code
   * @param description API response description
   * @returns generate response template string
   */
  public generateTemplate(code: string, description: string): string {
    return `[RESPONSE]\r\nCODE=${code}\r\nDESCRIPTION=${description}\r\nEOF\r\n`;
  }

  /**
   * Add response template to template container
   * @param id template id
   * @param plain API plain response
   * @returns ResponseTemplateManager instance for method chaining
   */
  public addTemplate(id: string, plain: string): ResponseTemplateManager {
    this.templates[id] = plain;
    return ResponseTemplateManager.instance;
  }

  /**
   * Get response template instance from template container
   * @param id template id
   * @returns template instance
   */
  public getTemplate(id: string): Response {
    if (this.hasTemplate(id)) {
      return new Response(id);
    }
    return new Response("notfound");
  }

  /**
   * Return all available response templates
   * @returns all available response template instances
   */
  public getTemplates(): any {
    const tpls: any = {};
    Object.keys(this.templates).forEach((val, key) => {
      tpls[key] = new Response(val);
    });
    return tpls;
  }

  /**
   * Check if given template exists in template container
   * @param id template id
   * @returns boolean result
   */
  public hasTemplate(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.templates, id);
  }

  /**
   * Check if given API response hash matches a given template by code and description
   * @param tpl2 api response hash
   * @param id template id
   * @returns boolean result
   */
  public isTemplateMatchHash(tpl2: any, id: string): boolean {
    const h = this.getTemplate(id).getHash();
    return h.CODE === tpl2.CODE && h.DESCRIPTION === tpl2.DESCRIPTION;
  }

  /**
   * Check if given API plain response matches a given template by code and description
   * @param plain API plain response
   * @param id template id
   * @returns boolean result
   */
  public isTemplateMatchPlain(plain: string, id: string): boolean {
    const h = this.getTemplate(id).getHash();
    const tpl2 = ResponseParser.parse(plain);
    return h.CODE === tpl2.CODE && h.DESCRIPTION === tpl2.DESCRIPTION;
  }
}

ResponseTemplateManager.getInstance();
