import { ResponseTemplateManager as RTM } from "./responsetemplatemanager.js";

function preg_quote(str: string, delimiter: string = "") {
  // MIT, from: https://locutus.io/php/preg_quote/
  return (str + "").replace(
    new RegExp("[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\" + delimiter + "-]", "g"),
    "\\$&",
  );
}

/**
 * ResponseTranslator class
 */
export class ResponseTranslator {
  /**
   * Regular Expression Mapping for API DESCRIPTION Property translation
   */
  private static descriptionRegexMap: Object = {
    // HX
    "Authorization failed; Operation forbidden by ACL":
      "Authorization failed; Used Command `{COMMAND}` not white-listed by your Access Control List",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY STATUS (clientTransferProhibited)/WRONG AUTH":
      "This Domain is locked and the given Authorization Code is wrong. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY STATUS (clientTransferProhibited)":
      "This Domain is locked. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY STATUS (requested)":
      "Registration of this Domain Name has not yet completed. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY STATUS (requestedcreate)":
      "Registration of this Domain Name has not yet completed. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY STATUS (requesteddelete)":
      "Deletion of this Domain Name has been requested. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY STATUS (pendingdelete)":
      "Deletion of this Domain Name is pending. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY WRONG AUTH":
      "The given Authorization Code is wrong. Initiating a Transfer is therefore impossible.",
    "Request is not available; DOMAIN TRANSFER IS PROHIBITED BY AGE OF THE DOMAIN":
      "This Domain Name is within 60 days of initial registration. Initiating a Transfer is therefore impossible.",
    "Attribute value is not unique; DOMAIN is already assigned to your account":
      "You cannot transfer a domain that is already on your account at the registrar's system.",
    // CNR
    "Missing required attribute; premium domain name. please provide required parameters":
      "Confirm the Premium pricing by providing the necessary premium domain price data.",
    SkipPregQuote: {
      // HX
      "Invalid attribute value syntax; resource record [(.+)]":
        "Invalid Syntax for DNSZone Resource Record: $1",
      "Missing required attribute; CLASS(?:=| [MUST BE )PREMIUM_([w+]+)[s]]":
        "Confirm the Premium pricing by providing the parameter CLASS with the value PREMIUM_$1.",
      "Syntax error in Parameter DOMAIN ((.+))":
        "The Domain Name $1 is invalid.",
    },
  };

  /**
   * translate a raw api response
   * @param raw API raw response
   * @param cmd requested API command
   * @param ph list of place holder vars
   * @returns new translated raw response
   */
  public static translate(raw: string, cmd: any, ph: any = {}): string {
    let httperror = "";
    let newraw = raw || "empty";
    // Hint: Empty API Response (replace {CONNECTION_URL} later)

    // curl error handling
    const isHTTPError = newraw.substring(0, 10) === "httperror|";
    if (isHTTPError) {
      [newraw, httperror] = newraw.split("|");
    }

    // Explicit call for a static template
    if (RTM.getInstance().hasTemplate(newraw)) {
      // don't use getTemplate as it leads to endless loop as of again
      // creating a response instance
      newraw = RTM.getInstance().templates[newraw];
      if (isHTTPError && httperror.length) {
        newraw = newraw.replace(/\{HTTPERROR\}/, " (" + httperror + ")");
      }
    }

    // Missing CODE or DESCRIPTION in API Response
    if (
      (!/description[\s]*=/i.test(newraw) || // missing description
        /description[\s]*=\r\n/i.test(newraw) || // empty description
        !/code[\s]*=/i.test(newraw)) && // missing code
      RTM.getInstance().hasTemplate("invalid")
    ) {
      newraw = RTM.getInstance().templates.invalid;
    }

    // Iterate through the description-to-regex mapping
    // generic API response description rewrite
    let data: string = "";
    for (const [regex, val] of Object.entries(
      ResponseTranslator.descriptionRegexMap,
    )) {
      // Check if regex should be treated as multiple patterns
      if (regex === "SkipPregQuote") {
        // Iterate through each temporary pattern in val
        for (const [tmpregex, tmpval] of Object.entries(val)) {
          // Attempt to find a match using the temporary pattern
          data = ResponseTranslator.findMatch(
            tmpregex,
            newraw,
            "" + tmpval,
            cmd,
            ph,
          );

          // If a match is found, exit the inner loop
          if (data) {
            newraw = data;
            break;
          }
        }
      } else {
        // Escape the pattern and attempt to find a match for it
        const escapedregex = preg_quote(regex);
        console.log(newraw);
        data = ResponseTranslator.findMatch(escapedregex, newraw, val, cmd, ph);
        console.log(newraw);
      }

      // If a match is found, exit the outer loop
      if (data) {
        newraw = data;
        break;
      }
    }

    const cregex = /\{.+\}/;
    if (cregex.test(newraw)) {
      newraw = newraw.replace(cregex, "");
    }

    return newraw;
  }

  /**
   * Finds a match in the given text and performs replacements based on patterns and placeholders.
   *
   * This function searches for a specified regular expression pattern in the provided text and
   * performs replacements based on the matched pattern, command data, and placeholder values.
   *
   * @param regex The regular expression pattern to search for.
   * @param newraw The input text where the match will be searched for.
   * @param val The value to be used in replacement if a match is found.
   * @param cmd The command data containing replacements, if applicable.
   * @param ph An array of placeholder values for further replacements.
   *
   * @return Returns non-empty string if replacements were performed, empty string otherwise.
   */
  protected static findMatch(
    regex: string,
    newraw: string,
    val: string,
    cmd: any = {},
    ph: any = {},
  ): string {
    // match the response for given description
    // NOTE: we match if the description starts with the given description
    // it would also match if it is followed by additional text
    const qregex = new RegExp("/descriptions*=s*" + regex + "([^\\r\\n]+)?/i");
    let ret = "";

    if (qregex.test(newraw)) {
      // If "COMMAND" exists in cmd, replace "{COMMAND}" in val
      if (Object.prototype.hasOwnProperty.call(cmd, "COMMAND")) {
        val = val.replace("{COMMAND}", cmd.COMMAND);
      }

      // If $newraw matches $qregex, replace with "description=" . $val
      let tmp = newraw.replace(qregex, "description=" + val);
      if (newraw !== tmp) {
        ret = tmp;
      }
    }

    // Generic replacing of placeholder vars
    const vregex = /\{[^}]+\}/;
    if (vregex.test(newraw)) {
      for (const [tkey, tval] of Object.entries(ph)) {
        newraw = newraw.replace("{" + tkey + "}", "" + tval);
      }
      newraw = newraw.replace(vregex, "");
      ret = newraw;
    }
    return ret;
  }
}
