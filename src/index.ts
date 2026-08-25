/**
 * CNIC
 * Copyright © Team Internet Group PLC
 *
 * Single-barrel entry point. `package.json#exports` only resolves `"."`, so
 * this file is the sole way in — a deep import like
 * `@team-internet/apiconnector/dist/CNR/Client.js` will not resolve. Every
 * brand-specific capability is reached through the `CNR`/`IBS`/`MONIKER`
 * namespace objects below, mirroring PHP's `CNIC\CNR`/`CNIC\IBS`/`CNIC\MONIKER`
 * sub-namespaces; the flat re-exports mirror the classes/interfaces PHP
 * consumers reach directly off `CNIC\` (every class there carries
 * `@psalm-api` in the PHP source — that annotation is what fixes this list).
 */

export { ClientFactory } from "./ClientFactory.js";

import * as CNR from "./CNR/index.js";
import * as IBS from "./IBS/index.js";
import * as MONIKER from "./MONIKER/index.js";
import * as Exception from "./Exception/index.js";

export { CNR, IBS, MONIKER, Exception };

// Shared concretes.
export { ApiDateTime } from "./ApiDateTime.js";
export { Column } from "./Column.js";
export { EchoSink } from "./EchoSink.js";
export { Paginator } from "./Paginator.js";
export { Record } from "./Record.js";
export { System } from "./System.js";

// Shared abstracts — the extension points a consumer's own brand/transport/
// logger implementation would build on.
export { AbstractClient } from "./AbstractClient.js";
export { AbstractLogger } from "./AbstractLogger.js";
export { AbstractResponse } from "./AbstractResponse.js";
export { AbstractSocketConfig } from "./AbstractSocketConfig.js";

// Shared interfaces (type-only — erased at build, `verbatimModuleSyntax`
// requires the explicit `type` keyword so they do not survive to a value
// import).
export type { ColumnInterface } from "./ColumnInterface.js";
export type { ExtendedResponseInterface } from "./ExtendedResponseInterface.js";
export type { LoggerInterface } from "./LoggerInterface.js";
export type { LogSinkInterface } from "./LogSinkInterface.js";
export type { RecordInterface } from "./RecordInterface.js";
export type { ResponseInterface } from "./ResponseInterface.js";
export type { ResponseParserInterface } from "./ResponseParserInterface.js";
export type { ResponseTemplateFactoryInterface } from "./ResponseTemplateFactoryInterface.js";
export type { ResponseTemplateManagerInterface } from "./ResponseTemplateManagerInterface.js";
export type { RoleCredentialsInterface } from "./RoleCredentialsInterface.js";
export type {
  RequestOptions,
  TransportInterface,
  TransportOptions,
} from "./TransportInterface.js";
