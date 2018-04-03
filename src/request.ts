const DEFAULT_SOCKET_TIMEMOUT = 300000;
import * as events from "events";
import * as http from "http";
import * as net from "net";
import * as clResponse from "./response";

/**
 * @alias node.ispapi-apiconnector.Request
 * @desc Used to connect to 1API API Backend
 * @augments events.EventEmitter
 * @param {Object} p_cfg socket configuration
 * @param {String} p_data post request data
 * @param {Object} p_command the API command to request (included in p_data)
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

  socketcfg: any;
  data: any;
  cmd: any;

  constructor(p_cfg: any, p_data: any, p_command: any) {
    super();
    this.socketcfg = Object.assign({}, p_cfg);
    this.data = p_data;
    this.cmd = Object.assign({}, p_command);
  }

  /**
   * http request callback method
   * @param  {Object} res http client response object
   */
  requestCallback(res: http.IncomingMessage) {
    let response = "";
    res.setEncoding('utf8');
    res.on('data', (chunk: Buffer) => {
      response += chunk;
    });
    res.on('end', () => {
      this.emit("response", new clResponse.Response(response, this.cmd));
      response = "";
    });
  };

  /**
   * perform a command request to the 1API backend API
   */
  request() {
    let req = require(this.socketcfg.protocol.replace(/\:$/, '')).request(
      this.socketcfg,
      this.requestCallback
    );
    //300s (to be sure to get an API response)
    req.on('socket', (socket: net.Socket) => {
      socket.setTimeout(DEFAULT_SOCKET_TIMEMOUT, () => {
        req.abort();
      });
    });
    //e.message = 'problem with request: ' + e.message;
    req.on('error', () => {
      this.emit('error', new Response(clResponse.responses.error, this.cmd));
    });
    req.write(this.data);
    req.end();
  }
};