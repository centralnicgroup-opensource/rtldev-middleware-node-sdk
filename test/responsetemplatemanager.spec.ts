"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai from "chai";
import "mocha";
import { ResponseTemplate } from "../src/responsetemplate";
import { ResponseTemplateManager } from "../src/responsetemplatemanager";

const expect = chai.expect;
let rtm: ResponseTemplateManager;

before(() => {
  rtm = ResponseTemplateManager.getInstance();
});

describe("ResponseTemplateManager class", function () {
  this.slow(1000);

  describe("#.getTemplate", () => {
    it("check return value [template not found]", () => {
      const tpl = rtm.getTemplate("IwontExist");
      expect(tpl.getCode()).to.equal(500);
      expect(tpl.getDescription()).to.equal("Response Template not found");
    });
  });

  describe("#.getTemplates", () => {
    it("check return value", () => {
      const defaultones = [
        "404",
        "500",
        "error",
        "httperror",
        "invalid",
        "empty",
        "unauthorized",
        "expired",
      ];
      expect(rtm.getTemplates()).to.include.all.keys(defaultones);
    });
  });

  describe("#.isTemplateMatchHash", () => {
    it("check return value [matched]", () => {
      const tpl = new ResponseTemplate("");
      expect(rtm.isTemplateMatchHash(tpl.getHash(), "empty")).to.be.true;
    });
  });

  describe("#.isTemplateMatchPlain", () => {
    it("check return value [matched]", () => {
      const tpl = new ResponseTemplate("");
      expect(rtm.isTemplateMatchPlain(tpl.getPlain(), "empty")).to.be.true;
    });
  });
});
