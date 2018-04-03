/// <reference types="node" />
import * as events from "events";
import * as http from "http";
export declare class Request extends events.EventEmitter {
    socketcfg: any;
    data: any;
    cmd: any;
    constructor(pcfg: any, pdata: any, pcommand: any);
    requestCallback(res: http.IncomingMessage): void;
    request(): void;
}
