/// <reference types="node" />
import * as events from "events";
import * as clRequest from "./request";
export declare class Client extends events.EventEmitter {
    request(pcmd: any, pcfg: any, pcb: any, pcberr: any, ptype?: string): void;
    login(pparams: any, pcb: any, puri: string | undefined, pcmdparams: any): void;
    logout(pcfg: any, pcb: any): void;
    createConnection(pcmd: any, pcfg: any): clRequest.Request;
    commandEncode(pcmd: any): string;
    getDefaultOptions(puri?: string): any;
}
