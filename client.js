/*
 * ispapi-apiconnector
 * Copyright(c) 2015 Kai Schwarz, 1API GmbH
 * MIT Licensed
 */
'use strict';

var util = require("util");
var events = require("events");
var Request = require("./request.js");
var Response = require("./response.js");

/**
 * @alias node.ispapi-apiconnector.Client
 * @desc Used to return 1API API Backend connections
 * @augments events.EventEmitter
 * @constructor
 */
var Client = function() {
  events.EventEmitter.call(this);
};
util.inherits(Client, events.EventEmitter);
/**
 * convert given command object to string
 * @param {Object} p_cmd Object specifying the command to encode
 */
Client.command_encode = function(p_cmd) {
  var nullValueFound, tmp = "";
  if (!(typeof p_cmd === 'string' || p_cmd instanceof String)) {
    nullValueFound = false;
    Object.keys(p_cmd).forEach(function(key) {
      if (p_cmd[key]) { //sentry #1785 "TypeError: Cannot read property 'toString' of null"
        tmp += key + '=' + p_cmd[key].toString().replace(/\r|\n/g, "") + "\n";
      }
      else {
        nullValueFound = true;
      }
    });
    if (nullValueFound) {
      console.error('Command with null value in parameter.');
      console.error(p_cmd);
    }
  }
  return tmp;
};

/**
 * method to be used for api requests AFTER login procedure
 * @param {Object} p_cmd        API command to request
 * @param {Object} p_cfg        the socket config
 * @param {Function} [p_cb]     the callback method (success case)
 * @param {Function} [p_cberr]  the callback method (error case)
 * @param {Function} [p_type]   the response type format: hash or list
 */
Client.prototype.request = function(p_cmd, p_cfg, p_cb, p_cberr, p_type) {
  if (!p_type || !/^(hash|list)$/.test(p_type))
    p_type = 'hash';
  if (!p_cfg) {
    var r = new Response(Response.responses.expired, p_cmd);
    p_cb(r["as_" + p_type]());
    return;
  }
  //----- the socket configuration ----
  //keys that may change in cfg:
  //agent -> false to disable socket pooling (no parallel request limitation!),
  //port -> the socket port
  //protocol -> the socket protocol
  //headers -> custom headers to use
  var opts = p_cfg.options || Client.getDefaultOptions();

  if (!opts.headers)
    opts.headers = {};

  //----- the socket parameters ----
  //object keys -> login, pw, entity, remoteaddr, user (aka. subuser)
  //login -> the user account id to use for login
  //pw -> the corresponding user account password
  //entity -> system entity ("1234" for OT&E system, "54cd" for LIVE system)
  //remoteaddr -> the remote ip address of the customer incl. port (1.2.3.4:80)

  var c = this.createConnection(p_cmd, {
    options: opts,
    params: p_cfg.params
  });
  if (p_cb) {
    c.on("response", function(r) {
      p_cb(r["as_" + p_type]());
    });
  }
  if (p_cberr) {
    c.on("error", function(r) {
      p_cberr(r["as_" + p_type]());
    });
  }
  else {
    c.on("error", function( /*r*/ ) {
      //console.error('ispapi-apiconnector: error event thrown in request method but no error callback method provided.');
      //console.error(JSON.stringify(r["as_" + p_type]()));
    });
  }
  c.request();
};

Client.getDefaultOptions = function(p_uri) {
  var options = {
    method: 'POST'
    //, agent: false //default usage of http.globalAgent
  };
  var tmp = require("url").parse(p_uri || 'https://coreapi.1api.net/api/call.cgi');
  options.port = (tmp.port || (/^https/i.test(tmp.protocol) ? '443' : '80'));
  options.protocol = tmp.protocol;
  options.host = tmp.host.replace(/\:.+$/, ''); //remove port
  options.path = tmp.path;
  return options;
};

/**
 * method for api login / session start
 * @param {Object} p_params specifying the socket parameters
 * @param {Function} p_cb callback method
 * @param {String} [p_uri] specifying the socket uri to use
 * @param {Object} [p_cmdparams] specifying additional startsession command paramaeters
 */
Client.prototype.login = function(p_params, p_cb, p_uri, p_cmdparams) {
  if (!p_uri)
    p_uri = "https://coreapi.1api.net/api/call.cgi";
  if (!/^(http|https):\/\//.test(p_uri))
    throw new Error("Unsupported protocol within api connection uri.");

  var cb, cfg;
  cfg = {
    params: p_params,
    options: Client.getDefaultOptions(p_uri)
  };
  cb = function(r) {
    if (r.CODE === "200") {
      delete cfg.params.pw;
      delete cfg.params.login;
      delete cfg.params.user;
      cfg.params.session = r.PROPERTY.SESSION[0];
    }
    //return the socket configuration for reuse
    p_cb(r, cfg);
  };
  this.request(Object.assign({
    command: "StartSession"
  }, p_cmdparams || {}), cfg, cb, cb);
};

/**
 * method for api logout / ending session
 * @param {Object} p_cfg the socket config
 * @param {Function} p_cb callback method
 */
Client.prototype.logout = function(p_cfg, p_cb) {
  this.request({
    command: "EndSession"
  }, p_cfg, p_cb, p_cb);
};

/**
 * perform a command request to the 1API backend API
 * @param {Object} p_cmd Object specifying the command to request
 * @param {Object} p_cfg the socket config
 */
Client.prototype.createConnection = function(p_cmd, p_cfg) {
  var data = "";
  Object.keys(p_cfg.params).forEach(function(key) {
    data += encodeURIComponent('s_' + key);
    data += "=" + encodeURIComponent(p_cfg.params[key]) + "&";
  });
  data += encodeURIComponent("s_command");
  data += "=" + encodeURIComponent(Client.command_encode(p_cmd));
  return new Request(p_cfg.options, data, p_cmd);
};

module.exports = Client;
