/**
 * CNIC\IBS
 * Copyright © Team Internet Group PLC
 */

import { AbstractResponseTranslator } from "../AbstractResponseTranslator.js";
import { ResponseTemplateManager } from "./ResponseTemplateManager.js";
import type { ResponseTemplateManagerInterface } from "../ResponseTemplateManagerInterface.js";

/**
 * IBS ResponseTranslator
 *
 * IBS has no brand-specific message rewrites, so it declares neither
 * description map and inherits the empty defaults from
 * `AbstractResponseTranslator` (RSRMID-2970). The two rewrite loops in the
 * shared `translate()` pipeline therefore iterate over nothing and
 * `findMatch()` is never reached. To add the first IBS rewrite, override
 * the relevant hook here — see `CNR.ResponseTranslator` for the shape.
 */
export class ResponseTranslator extends AbstractResponseTranslator {
  /**
   * A fresh IBS template registry holding the brand's built-ins.
   */
  protected override newTemplateManager(): ResponseTemplateManagerInterface {
    return new ResponseTemplateManager();
  }

  /**
   * IBS carries the human-readable text in the message field.
   */
  protected override fieldName(): string {
    return "message";
  }

  /**
   * IBS falls back to the "invalid" template when status is missing (JSON or
   * plain) or present but empty. message is optional in success cases and is
   * deliberately not checked.
   */
  protected override hasMissingRequiredFields(raw: string): boolean {
    const missingStatus = !/"status":/i.test(raw) && !/^status=/im.test(raw);
    const emptyStatusJson = /"status":\s*""/i.test(raw);
    const emptyStatusPlain = /^status=\r?$/im.test(raw);
    return missingStatus || emptyStatusJson || emptyStatusPlain;
  }
}
