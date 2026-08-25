/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { AbstractResponseTemplateManager } from "../AbstractResponseTemplateManager.js";
import { Response } from "./Response.js";
import { ResponseParser as RP } from "./ResponseParser.js";
import type { ResponseParserInterface } from "../ResponseParserInterface.js";

/**
 * CNR ResponseTemplateManager
 */
export class ResponseTemplateManager extends AbstractResponseTemplateManager {
  /**
   * CNR's built-in templates. A `static readonly`, not a property: each
   * registry instance copies these at construction and mutates only its own
   * copy, so there is no route by which one caller's override reaches
   * another (RSRMID-2941).
   */
  private static readonly BUILTIN_TEMPLATES: { [templateId: string]: string } =
    {
      "404": "[RESPONSE]\r\nCODE=421\r\nDESCRIPTION=Page not found\r\nEOF\r\n",
      "500":
        "[RESPONSE]\r\nCODE=500\r\nDESCRIPTION=Internal server error\r\nEOF\r\n",
      empty:
        "[RESPONSE]\r\nCODE=423\r\nDESCRIPTION=Empty API response. Probably unreachable API end point {CONNECTION_URL}\r\nEOF\r\n",
      error:
        "[RESPONSE]\r\nCODE=421\r\nDESCRIPTION=Command failed due to server error. Client should try again\r\nEOF\r\n",
      expired:
        "[RESPONSE]\r\nCODE=530\r\nDESCRIPTION=SESSION NOT FOUND\r\nEOF\r\n",
      httperror:
        "[RESPONSE]\r\nCODE=421\r\nDESCRIPTION=Command failed due to HTTP communication error{HTTPERROR}.\r\nEOF\r\n",
      invalid:
        "[RESPONSE]\r\nCODE=423\r\nDESCRIPTION=Invalid API response. Contact Support\r\nEOF\r\n",
      notfound:
        "[RESPONSE]\r\nCODE=500\r\nDESCRIPTION=Response Template not found\r\nEOF\r\n",
      unauthorized:
        "[RESPONSE]\r\nCODE=530\r\nDESCRIPTION=Unauthorized\r\nEOF\r\n",
    };

  /**
   * The base constructor is `protected`; a concrete registry that consumers
   * and `ResponseTranslator.newTemplateManager()` can `new` up must redeclare
   * a `public` one, or the protected access carries over unchanged.
   */
  public constructor() {
    super();
  }

  protected override builtinTemplates(): { [templateId: string]: string } {
    return ResponseTemplateManager.BUILTIN_TEMPLATES;
  }

  /**
   * Generate API response template string for given code and description.
   */
  public override generateTemplate(code: string, description: string): string {
    return `[RESPONSE]\r\nCODE=${code}\r\nDESCRIPTION=${description}\r\nEOF\r\n`;
  }

  /**
   * Get response template instance from this registry.
   */
  public override getTemplate(templateId: string): Response {
    return this.createResponseFromTemplateId(
      this.hasTemplate(templateId) ? templateId : "notfound",
    );
  }

  /**
   * Create a CNR Response instance from a template id.
   *
   * The registry is handed to the Response so a template id resolves against
   * *this* object — that hand-off is what replaced the global lookup.
   */
  protected override createResponseFromTemplateId(
    templateId: string,
  ): Response {
    return new Response(templateId, {}, {}, {}, null, null, this);
  }

  /**
   * Instantiate the CNR response parser.
   */
  protected override newResponseParser(): ResponseParserInterface {
    return new RP();
  }

  /**
   * CNR compares templates on the CODE and DESCRIPTION hash keys.
   */
  protected override matchKeys(): readonly [string, string] {
    return ["CODE", "DESCRIPTION"];
  }
}
