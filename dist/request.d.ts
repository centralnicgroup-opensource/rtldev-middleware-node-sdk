/// <reference types="node" />
import * as events from "events";
import * as http from "http";
export declare class Request extends events.EventEmitter {
    socketcfg: any;
    data: any;
    cmd: any;
    constructor(p_cfg: any, p_data: any, p_command: any);
    requestCallback(res: http.IncomingMessage): void;
    request(): void;
}
