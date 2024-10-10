import { expect } from "chai";
import "mocha";
import { ResponseParser } from "../src/responseparser.ts";
import { ResponseTemplateManager } from "../src/responsetemplatemanager.ts";

const rtm = ResponseTemplateManager.getInstance();

before(() => {
  rtm.addTemplate(
    "OK",
    rtm.generateTemplate("200", "Command completed successfully"),
  );
});
