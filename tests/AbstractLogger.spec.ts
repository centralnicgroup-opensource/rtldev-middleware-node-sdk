import { expect } from "chai";
import "mocha";
import { AbstractLogger } from "../src/AbstractLogger.ts";
import { EchoSink } from "../src/EchoSink.ts";
import { Logger as CNRLogger } from "../src/CNR/Logger.ts";
import { Logger as IBSLogger } from "../src/IBS/Logger.ts";
import { Response as CNRResponse } from "../src/CNR/Response.ts";
import { Response as IBSResponse } from "../src/IBS/Response.ts";
import type { LogSinkInterface } from "../src/LogSinkInterface.ts";

/**
 * AbstractLogger — the format()/log() split (behaviour gap #17): format()
 * varies per brand, log() is intended final and always writes through a
 * LogSinkInterface (EchoSink by default). No spec existed for logger.ts/
 * customlogger.ts before this port.
 */
describe("AbstractLogger / brand Logger.format()", () => {
  class CollectingSink implements LogSinkInterface {
    public written: string[] = [];
    public write(message: string): void {
      this.written.push(message);
    }
  }

  const cnrResponse = new CNRResponse(
    "[RESPONSE]\r\nCODE=200\r\nDESCRIPTION=OK\r\nEOF\r\n",
    { COMMAND: "StatusAccount" },
  );
  const ibsResponse = new IBSResponse('{"status":"SUCCESS"}', {
    ResponseFormat: "JSON",
  });

  it("log() formats then hands the record to the sink, unmodified", () => {
    const sink = new CollectingSink();
    const logger = new CNRLogger(sink);
    logger.log("s_command=...", cnrResponse);

    expect(sink.written).to.have.lengthOf(1);
    expect(sink.written[0]).to.equal(
      logger.format("s_command=...", cnrResponse, null),
    );
  });

  it("defaults to EchoSink when no sink is given", () => {
    const logger = new CNRLogger();
    expect((logger as unknown as { sink: unknown }).sink).to.be.instanceOf(
      EchoSink,
    );
  });

  describe("CNR.Logger.format()", () => {
    it("includes the transport-error line only when an error is present and non-empty", () => {
      const logger = new CNRLogger();
      const withError = logger.format("post", cnrResponse, "boom");
      const noError = logger.format("post", cnrResponse, null);
      const emptyError = logger.format("post", cnrResponse, "");

      expect(withError).to.include("HTTP communication failed: boom");
      expect(noError).to.not.include("HTTP communication failed");
      expect(emptyError).to.not.include("HTTP communication failed");
    });
  });

  describe("IBS.Logger.format()", () => {
    it("includes the transport-error line only when an error is present and non-empty", () => {
      const logger = new IBSLogger();
      const withError = logger.format("post", ibsResponse, "boom");
      const noError = logger.format("post", ibsResponse, null);
      const emptyError = logger.format("post", ibsResponse, "");

      expect(withError).to.include("HTTP communication failed: boom");
      expect(noError).to.not.include("HTTP communication failed");
      expect(emptyError).to.not.include("HTTP communication failed");
      expect(withError).to.include("R E Q U E S T");
      expect(withError).to.include("R E S P O N S E");
    });
  });

  it("AbstractLogger.log is not overridden by any brand logger (final in spirit)", () => {
    expect(CNRLogger.prototype.log).to.equal(AbstractLogger.prototype.log);
    expect(IBSLogger.prototype.log).to.equal(AbstractLogger.prototype.log);
  });
});
