/*
 * ispapi-apiconnector
 * Copyright(c) 2015 Kai Schwarz, 1API GmbH
 * MIT Licensed
 */
'use strict';

var util = require("util");
var events = require("events");
var Response = require("./response.js");

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
  this.socketcfg = p_cfg;
  this.data = p_data;
  this.cmd = Object.assign({}, p_command);
};
util.inherits(Request, events.EventEmitter);

/**
 * perform a command request to the 1API backend API
 */
Request.prototype.request = function() {
  var req, oself = this;
  req = require(oself.socketcfg.protocol.replace(/\:$/, '')).request(oself.socketcfg, function(res) {
    var response = "";
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      response += chunk;
    });
    res.on('end', function() {
      oself.emit("response", new Response(response, oself.cmd));
      response = "";
    });
    res.on('error', function() {
      //e.message = 'problem with response: ' + e.message;
      oself.emit('error', new Response(Response.responses.error, oself.cmd));
    });
  });
  req.setTimeout(250000); //250s (to be sure to get an API response)
  req.on('socket', function(socket) {
    socket.on('timeout', function() {
      req.abort();
    });
  });
  req.on('error', function() {
    //e.message = 'problem with request: ' + e.message;
    oself.emit('error', new Response(Response.responses.error, oself.cmd));
  });
  req.write(oself.data);
  req.end();
};

module.exports = Request;
