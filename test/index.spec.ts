"use strict";

/* tslint:disable:no-unused-expression */
// https://github.com/palantir/tslint/issues/2614

import chai from "chai";
import "mocha";
import { APIClient, Response, ResponseTemplateManager } from "../src/index";
const expect = chai.expect;

describe("index file", function () {
  this.slow(1000);

  it("check access to APIClient class", () => {
    const cl = new APIClient();
    expect(cl).to.be.instanceOf(APIClient);
  });

  it("check access to Response class", () => {
    const cl = new Response("", { COMMAND: "StatusAccount" });
    expect(cl).to.be.instanceOf(Response);
  });

  it("check access to ResponseTemplateManager class", () => {
    const cl = ResponseTemplateManager.getInstance();
    expect(cl).to.be.instanceOf(ResponseTemplateManager);
  });
});
