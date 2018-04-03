const DEFAULT_SOCKET_TIMEMOUT = 300000;
import * as util from "util";
import * as events from 'events';
import * as Response from "./response";

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
var Request = function(p_cfg, p_data, p_command) {
  events.EventEmitter.call(this);
  this.socketcfg = Object.assign({}, p_cfg);
  this.data = p_data;
  this.cmd = Object.assign({}, p_command);
};
util.inherits(Request, events.EventEmitter);

/**
 * http request callback method
 * @param  {Object} res http client response object
 */
Request.prototype.requestCallback = function(res) {
  var oself = this;
  var response = "";
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    response += chunk;
  });
  res.on('end', function() {
    oself.emit("response", new Response(response, oself.cmd));
    response = "";
  });
};

/**
 * perform a command request to the 1API backend API
 */
Request.prototype.request = function() {
  var req;
  req = require(this.socketcfg.protocol.replace(/\:$/, '')).request(
    this.socketcfg,
    this.requestCallback.bind(this)
  );
  //300s (to be sure to get an API response)
  req.on('socket', function(socket) {
    socket.setTimeout(DEFAULT_SOCKET_TIMEMOUT, function() {
      req.abort();
    });
  });
  //e.message = 'problem with request: ' + e.message;
  req.on('error', function() {
    this.emit('error', new Response(Response.responses.error, this.cmd));
  }.bind(this));
  req.write(this.data);
  req.end();
};

module.exports = Request;
