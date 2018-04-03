const DEFAULT_SOCKET_TIMEMOUT = 300000;
import * as events from "events";
import * as http from "http";
import * as net from "net";
import * as clResponse from "./response";

/**
 * @alias node.ispapi-apiconnector.Request
 * @desc Used to connect to 1API API Backend
 * @augments events.EventEmitter
 * @param {Object} pcfg socket configuration
 * @param {String} pdata post request data
 * @param {Object} pcommand the API command to request (included in p_data)
 * @constructor
 */
/*
  --- example for p_cfg ---
  {
      method: 'POST',
      protocol: 'http:',
      host: 'coreapi.1api.net',
      path: '/api/call.cgi'
  }
  --- example for p_data ---
  's_entity=1234&s_session=__iWillNeverExist__&command=EndSession'
  --- example for p_command ---
  {
    COMMAND: "EndSession"
  }
 */
export class Request extends events.EventEmitter {

  public socketcfg: any;
  public data: any;
  public cmd: any;

  constructor(pcfg: any, pdata: any, pcommand: any) {
    super();
    this.socketcfg = Object.assign({}, pcfg);
    this.data = pdata;
    this.cmd = Object.assign({}, pcommand);
  }

  /**
   * http request callback method
   * @param  {Object} res http client response object
   */
  public requestCallback(res: http.IncomingMessage) {
    let response = "";
    res.setEncoding("utf8");
    res.on("data", (chunk: Buffer) => {
      response += chunk;
    });
    res.on("end", () => {
      this.emit("response", new clResponse.Response(response, this.cmd));
      response = "";
    });
  }

  /**
   * perform a command request to the 1API backend API
   */
  public request() {
    const req = require(this.socketcfg.protocol.replace(/:$/, "")).request(
      this.socketcfg,
      this.requestCallback,
    );
    // 300s (to be sure to get an API response)
    req.on("socket", (socket: net.Socket) => {
      socket.setTimeout(DEFAULT_SOCKET_TIMEMOUT, () => {
        req.abort();
      });
    });
    // e.message = 'problem with request: ' + e.message;
    req.on("error", () => {
      this.emit("error", new clResponse.Response(clResponse.responses.error, this.cmd));
    });
    req.write(this.data);
    req.end();
  }
}
