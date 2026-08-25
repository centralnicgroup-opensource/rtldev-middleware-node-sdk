/**
 * CNIC\CNR
 * Copyright © Team Internet Group PLC
 */

import { AbstractResponseTranslator } from "../AbstractResponseTranslator.js";
import { ResponseTemplateManager as RTM } from "./ResponseTemplateManager.js";
import type { ResponseTemplateManagerInterface } from "../ResponseTemplateManagerInterface.js";
import type { StringHash } from "../types.js";

/**
 * CNR ResponseTranslator
 */
export class ResponseTranslator extends AbstractResponseTranslator {
  /**
   * Plain-string description keys for translation; keys are preg_quote'd
   * (escaped) before matching.
   */
  private static readonly DESCRIPTION_REGEX_MAP: StringHash = {
    // HX - just for future reference, can be cleaned up if we have something similar in place for CNR (used in test automation currently)
    "Authorization failed; Operation forbidden by ACL":
      "Authorization failed; Used Command `{COMMAND}` not white-listed by your Access Control List",
    // CNR
    "Missing required attribute; premium domain name. please provide required parameters":
      "Confirm the Premium pricing by providing the necessary premium domain price data.",
  };

  /**
   * Raw regex pattern keys for translation; keys are used as-is (not
   * escaped).
   */
  private static readonly DESCRIPTION_RAW_PATTERN_MAP: StringHash = {
    // CNR
    "Authorization failed.*(?:\\[.*(authori[sz]ation (information|code|password)|authinfo).*\\]|wrong auth code)":
      "The provided Authorization Code (EPP Code) is incorrect. Please verify the correct Authorization Code with the current registrar and try again.",
  };

  /**
   * A fresh CNR template registry holding the brand's built-ins.
   */
  protected override newTemplateManager(): ResponseTemplateManagerInterface {
    return new RTM();
  }

  protected override descriptionRegexMap(): StringHash {
    return ResponseTranslator.DESCRIPTION_REGEX_MAP;
  }

  protected override descriptionRawPatternMap(): StringHash {
    return ResponseTranslator.DESCRIPTION_RAW_PATTERN_MAP;
  }

  /**
   * CNR carries the human-readable text in the DESCRIPTION field.
   */
  protected override fieldName(): string {
    return "description";
  }

  /**
   * CNR falls back to the "invalid" template when CODE or DESCRIPTION is
   * missing, or DESCRIPTION is present but empty.
   */
  protected override hasMissingRequiredFields(raw: string): boolean {
    return (
      !/description[\s]*=/i.test(raw) ||
      /description[\s]*=\r\n/i.test(raw) ||
      !/code[\s]*=/i.test(raw)
    );
  }
}
