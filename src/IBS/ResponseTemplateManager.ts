/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import { AbstractResponseTemplateManager } from "../AbstractResponseTemplateManager.js";
import { Response } from "./Response.js";
import { ResponseParser } from "./ResponseParser.js";
import type { ResponseParserInterface } from "../ResponseParserInterface.js";

/**
 * IBS ResponseTemplateManager
 *
 * The container (add/get/has/match) is inherited from
 * `AbstractResponseTemplateManager`; this class supplies only the built-in
 * templates, the wire format and the two match keys.
 */
export class ResponseTemplateManager extends AbstractResponseTemplateManager {
  /**
   * IBS's built-in templates. A `static readonly`, not a property: each
   * registry instance copies these at construction (see the base class) and
   * mutates only its own copy, so no caller's `addTemplate()` reaches another
   * instance (RSRMID-2941).
   */
  private static readonly BUILTIN_TEMPLATES: { [templateId: string]: string } =
    {
      "403": "status=FAILURE\r\nmessage=403 Forbidden\r\n",
      "404": "status=FAILURE\r\nmessage=421 Page not found\r\n",
      "500": "status=FAILURE\r\nmessage=500 Internal server error\r\n",
      empty:
        "status=FAILURE\r\nmessage=423 Empty API response. Probably unreachable API end point {CONNECTION_URL}\r\n",
      error:
        "status=FAILURE\r\nmessage=421 Command failed due to server error. Please retry.\r\n",
      httperror:
        "status=FAILURE\r\nmessage=421 Command failed due to HTTP communication error{HTTPERROR}.\r\n",
      invalid:
        "status=FAILURE\r\nmessage=423 Invalid API response. Contact Support\r\n",
      notfound: "status=FAILURE\r\nmessage=500 Response Template not found\r\n",
      unauthorized: "status=FAILURE\r\nmessage=530 Unauthorized\r\n",
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
   * Generate API response template string for given status and description.
   *
   * @param code goes on the wire as IBS's `status` field
   */
  public override generateTemplate(code: string, description: string): string {
    return `status=${code}\r\nmessage=${description}\r\n`;
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
   * Create an IBS Response instance from a template id.
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
   * Instantiate the IBS response parser.
   */
  protected override newResponseParser(): ResponseParserInterface {
    return new ResponseParser();
  }

  /**
   * IBS compares templates on the status and message hash keys.
   */
  protected override matchKeys(): readonly [string, string] {
    return ["status", "message"];
  }
}
