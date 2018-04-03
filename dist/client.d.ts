/// <reference types="node" />
import * as events from "events";
import * as clRequest from "./request";
export declare class Client extends events.EventEmitter {
    request(p_cmd: any, p_cfg: any, p_cb: Function, p_cberr: Function, p_type?: string): void;
    login(p_params: any, p_cb: Function, p_uri: string | undefined, p_cmdparams: any): void;
    logout(p_cfg: any, p_cb: Function): void;
    createConnection(p_cmd: any, p_cfg: any): clRequest.Request;
}
export declare const command_encode: (p_cmd: any) => string;
export declare const getDefaultOptions: (p_uri?: string) => any;
