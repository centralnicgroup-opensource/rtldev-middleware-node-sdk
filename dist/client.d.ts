/// <reference types="node" />
import * as events from "events";
import * as clRequest from "./request";
export declare class Client extends events.EventEmitter {
    request(pcmd: any, pcfg: any, pcb: Function, pcberr: Function, ptype?: string): void;
    login(pparams: any, pcb: Function, puri: string | undefined, pcmdparams: any): void;
    logout(pcfg: any, pcb: Function): void;
    createConnection(pcmd: any, pcfg: any): clRequest.Request;
}
export declare const command_encode: (pcmd: any) => string;
export declare const getDefaultOptions: (puri?: string) => any;
