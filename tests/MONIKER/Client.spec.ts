import { expect } from "chai";
import "mocha";
import { ClientFactory as CF } from "../../src/ClientFactory.ts";
import { Client as IBSClient } from "../../src/IBS/Client.ts";
import { Response as IBSResponse } from "../../src/IBS/Response.ts";
import { Cassettes } from "../Support/Cassettes.ts";

/**
 * MONIKER.Client — same platform as IBS, only the endpoints differ
 * (decision 1). No Response/Parser/Translator/Logger/TemplateManager of its
 * own, so this is deliberately small: confirm the inheritance, the distinct
 * endpoints, and that the inherited request() lifecycle works end to end.
 */
describe("MONIKER.Client", () => {
  const cassetteDir = new URL("./cassettes", import.meta.url).pathname;

  it("extends IBS.Client and reuses its Response type", () => {
    const cl = CF.moniker();
    expect(cl).to.be.instanceOf(IBSClient);
  });

  it("has its own OT&E/LIVE endpoints, distinct from IBS's", () => {
    const cl = CF.moniker();
    expect(cl.getLiveUrl()).to.equal("https://api.moniker.com/");
    cl.useOTESystem();
    expect(cl.getURL()).to.equal("https://testapi.moniker.com/");
  });

  it("request() runs the inherited IBS lifecycle end to end (replay)", async () => {
    const cl = CF.moniker();
    const tape = Cassettes.attach(cl, cassetteDir);
    tape.useCassette("request-success-dbg");
    cl.setCredentials("test.user", "test.pw").useOTESystem();

    const r = await cl.request({ domain: "tronexats.com" }, "Domain/Check");
    expect(r).to.be.instanceOf(IBSResponse);
    expect(r.isSuccess(), r.getDescription()).to.be.true;
  });

  it("a transport failure is reported the same way as on IBS", async () => {
    const cl = CF.moniker();
    const tape = Cassettes.attach(cl, cassetteDir);
    tape.useCassette("conn-error");
    cl.useOTESystem();

    const r = await cl.request({ domain: "tronexats.com" }, "Domain/Info");
    expect(r.isSuccess()).to.be.false;
    expect(r.getDescription()).to.include(
      "Command failed due to HTTP communication error",
    );
  });
});
