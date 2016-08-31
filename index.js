/*
 * ispapi-apiconnector
 * Copyright(c) 2015 Kai Schwarz, 1API GmbH
 * MIT Licensed
 */

/* jslint node:true */
/* jshint node:true */

'use strict';

var util = require("util");
var events = require("events");
var responses = {
  expired: "[RESPONSE]\ncode=530\ndescription=SESSION NOT FOUND.\nEOF\n",
  empty: "[RESPONSE]\ncode=423\ndescription=Empty API response\nTRANSLATIONKEY=FAPI.424\nEOF\n",
  error: "[RESPONSE]\ncode=421\ndescription=Command failed due to server error. Client should try again\nEOF\n"
};

/**
 * @alias node.ispapi-apiconnector.Request
 * @desc Used to connect to 1API API Backend
 * @augments events.EventEmitter
 * @param {Object} p_cfg socket configuration
 * @param {String} p_data post request data
 * @param {Object} p_command the API command to request (included in p_data)
 * @constructor
 */
var Request = function(p_cfg, p_data, p_command) {
  events.EventEmitter.call(this);
  this.socketcfg = p_cfg;
  this.data = p_data;
  this.cmd = JSON.parse(JSON.stringify(p_command));
};
util.inherits(Request, events.EventEmitter);

/**
 * perform a command request to the 1API backend API
 */
Request.prototype.request = function() {
  var req, oself = this;
  req = require(oself.socketcfg.protocol.replace(/\:$/, '')).request(
    oself.socketcfg,
    function(res) {
      var response = "";
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        response += chunk;
      });
      res.on('end', function() {
        oself.emit("response", new ispapi.Response(response, oself.cmd));
        response = "";
      });
      res.on('error', function(e) {
        //e.message = 'problem with response: ' + e.message;
        oself.emit('error', new ispapi.Response(responses.error, oself.cmd));
      });
    });
  req.setTimeout(250000); //250s (to be sure to get an API response)
  req.on('socket', function(socket) {
    socket.on('timeout', function() {
      req.abort();
    });
  });
  req.on('error', function(e) {
    //e.message = 'problem with request: ' + e.message;
    oself.emit('error', new ispapi.Response(responses.error, oself.cmd));
  });
  req.write(oself.data);
  req.end();
};

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
  var key, tmp = "";
  if (!(typeof p_cmd === 'string' || p_cmd instanceof String)) {
    for (key in p_cmd) {
      if (p_cmd.hasOwnProperty(key)) {
        if (!(typeof p_cmd[key] === 'string' || p_cmd[key] instanceof String))
          p_cmd[key] = p_cmd[key].toString();
        tmp += key + '=' + p_cmd[key].replace(/\r|\n/, "") + "\n";
      }
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
  if (!p_cfg)
    p_cb(responses.expired);
  if (!p_type || (p_type !== 'hash' && p_type !== 'list'))
    p_type = 'hash';
  //----- the socket configuration ----
  //keys that may change in cfg:
  //agent -> false to disable socket pooling (no parallel request limitation!),
  //port -> the socket port
  //protocol -> the socket protocol
  //headers -> custom headers to use
  var opts = p_cfg.options || this.getDefaultOptions();

  // set the expect header for performance improvement if not set
  if (!opts.headers)
    opts.headers = {
      Expect: ''
    };
  else if (!opts.headers.hasOwnProperty('Expect'))
    opts.headers.Expect = '';

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
  c.request();
};

Client.prototype.getDefaultOptions = function(p_uri) {
  var options = {
    method: 'POST',
    agent: false
  };
  var tmp = require("url").parse(p_uri ||
    'https://coreapi.1api.net/api/call.cgi');
  options.port = (
    tmp.port || (tmp.protocol.match(/^https/i) ? '443' : '80')
  );
  options.protocol = tmp.protocol;
  options.host = tmp.host;
  options.path = tmp.path;
  return options;
};

/**
 * method for api login / session start
 * @param {Object} p_params specifying the socket parameters
 * @param {Function} p_cb callback method
 * @param {String} [p_uri] specifying the socket uri to use
 * @param {Object} [p_cmd] specifying additional startsession command paramaeters
 */
Client.prototype.login = function(p_params, p_cb, p_uri, p_cmd) {
  if (!p_uri)
    p_uri = "https://coreapi.1api.net/api/call.cgi";
  else if (!p_uri.match(/^(http|https):\/\//))
    throw new Error("Unsupported protocol within api connection uri.");

  var cb, cfg;
  cfg = {
    params: p_params,
    options: this.getDefaultOptions(p_uri)
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
  }, p_cmd || {}), cfg, cb, cb);
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
  var key, data = "";
  for (key in p_cfg.params) {
    if (p_cfg.params.hasOwnProperty(key)) {
      data += encodeURIComponent('s_' + key);
      data += "=" + encodeURIComponent(p_cfg.params[key]) + "&";
    }
  }
  data += encodeURIComponent("s_command");
  data += "=" + encodeURIComponent(ispapi.Client.command_encode(p_cmd));
  return new ispapi.Request(p_cfg.options, data, p_cmd);
};

/**
 * @alias node.ispapi-apiconnector.Response
 * @desc Used to handle the response of the 1API backend API Constructor
 * @param {String} p_r String specifying the unparsed plain API response
 * @param {Object} p_command the API command of that request
 * @constructor
 */
var Response = function(p_r, p_command) {
  p_r = ((!p_r || p_r === "") ? responses.empty : p_r);
  this.colregexp = false;
  this.data = {
    unparsed: p_r,
    parsed: ispapi.Response.parse(p_r)
  };
  this.cmd = JSON.parse(JSON.stringify(p_command));
  this.it = (function(rows) {
    var index = 0;
    return {
      previous: function() {
        return (this.hasPrevious() ? rows[--index] : null);
      },
      hasPrevious: function() {
        return (index > 0);
      },
      next: function() {
        return (this.hasNext() ? rows[++index] : null);
      },
      hasNext: function() {
        return (index < (rows.length - 1));
      },
      rewind: function() {
        index = 0;
        return this.current();
      },
      current: function() {
        return rows[index];
      }
    };
  }(this.as_list().LIST || []));
};
/**
 * convert unparsed plain API response string to object notation
 * @param {String}   p_r String specifying the unparsed API response
 * @return {Object}      Response in hash format
 */
Response.parse = function(r) {
  var hash = {},
    regexp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/,
    m, mm;
  r = r.replace("\r\n", "\n").split("\n");
  while (r.length) {
    m = (r.shift()).match(regexp);
    if (m) {
      mm = m[1].match(/^property\[([^\]]*)\]/i);
      if (mm) {
        if (!hash.hasOwnProperty("PROPERTY")) hash.PROPERTY = {};
        mm[1] = mm[1].toUpperCase().replace(/\s/, '');
        if (!hash.PROPERTY.hasOwnProperty(mm[1])) hash.PROPERTY[mm[1]] = [];
        hash.PROPERTY[mm[1]].push(m[2].replace(/[\t ]*$/, ""));
      } else {
        hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, "");
      }
    }
  }
  if (!hash.hasOwnProperty("DESCRIPTION")) hash.DESCRIPTION = "";
  return hash;
};
/**
 * convert parsed plain API response to unparsed string notation
 * @param  {Object} p_r Object specifying the parsed API response
 * @return {Object}     Response in unparsed plain text
 */
Response.serialize = function(r) {
  if (r.DESCRIPTION === "") delete r.DESCRIPTION;
  var plain = "[RESPONSE]",
    key, i;
  if (r.hasOwnProperty("PROPERTY")) {
    for (key in r.PROPERTY) {
      if (r.PROPERTY.hasOwnProperty(key)) {
        for (i = 0; i < r.PROPERTY[key].length; i++) {
          plain += "\nPROPERTY[" + key + "][" + i + "]=" + r.PROPERTY[key][i];
        }
      }
    }
  }
  if (r.hasOwnProperty("DESCRIPTION"))
    plain += "\nDESCRIPTION=" + r.DESCRIPTION;
  if (r.hasOwnProperty("CODE")) plain += "\nCODE=" + r.CODE;
  if (r.hasOwnProperty("QUEUETIME")) plain += "\n\nQUEUETIME=" + r.QUEUETIME;
  if (r.hasOwnProperty("RUNTIME")) plain += "\nRUNTIME=" + r.RUNTIME;
  plain += "\n\nEOF\n";
  return plain;
};

Response.pagerRegexp = /^(TOTAL|FIRST|LAST|LIMIT|COUNT)$/;

Response.prototype = {
  /**
   * sets the columns to be available in the response
   * @param {String|Array} [arr] regexp or * to filter response columns
   */
  useColumns: function(arr) {
    if (arr === "*") arr = false;
    this.colregexp = (
      arr ? new RegExp("^(" + arr.join("|") + ")$", "i") : false
    );
  },
  /**
   * resets the iterator to start value 0 and returns first row
   * @return {Object|null} iterator
   */
  rewind: function() {
    return this.it.rewind();
  },
  /**
   * checks if next row can be iterared
   * @return {Boolean} returns true if next row can be iterated, false otherwise
   */
  hasNext: function() {
    return this.it.hasNext();
  },
  /**
   * returns the row of the next iterator position
   * @return {Object|null} returns the row for the next iterator position
   */
  next: function() {
    return this.it.next();
  },
  /**
   * checks if previous row can be iterated
   * @return {Boolean} returns true if prev. row can be iterated, false otherwise
   */
  hasPrevious: function() {
    return this.it.hasPrevious();
  },
  /**
   * returns the row of the previous iterator position
   * @return {Object|null} returns the row for the previous iterator position
   */
  previous: function() {
    return this.it.previous();
  },
  /**
   * returns the list row for the current iterator value
   * @return {Object} the current iterator row
   */
  current: function() {
    return this.it.current();
  },
  /**
   * returns the property value of the response object if found
   * @param {String} p_prop String specifying the property for value lookup
   * @return {Object|String|Boolean} Object/String if property found and is of type Object/String, false otherwise
   */
  get: function(p_prop) {
    if (this.data.parsed.hasOwnProperty(p_prop))
      return this.data.parsed[p_prop];
    return false;
  },
  /**
   * return all values of the given column/property identifier
   * @param {String} p_prop String specifying the column/property identifier
   * @return {Array}        column values
   */
  getColumn: function(p_prop) {
    var p = this.get("PROPERTY");
    if (p && p.hasOwnProperty(p_prop)) return p[p_prop]; // return whole column
    return false;
  },
  /**
   * return the value by given row index and column identifier
   * @param {String}  p_prop     String specifying the column identifier
   * @param {Integer} p_idx      Integer specifying the row index
   * @param {Boolean} p_cast_int Boolean integer cast the value [optional]
   * @return {String|Boolean} String if succeeded, Boolean (false) otherwise
   */
  getColumnIndex: function(p_prop, p_idx, p_cast_int) {
    var col = this.getColumn(p_prop);
    if (col && col[p_idx])
      return (
        p_cast_int ? parseInt(col[p_idx], 10) : col[p_idx]
      );
    return false;
  },
  /**
   * Overridable method to apply custom changes to the API response
   * Note: Adding new keys to the object may be a valid change (but use it with caution)
   * @param  {Object} r the response object
   * @return {Object} the customized response
   */
  applyCustomChanges: function(r) {
    return r;
  },
  /**
   * return the unparsed API response
   * @return {String} unparsed API response
   */
  as_string: function() {
    if (this.colregexp) return ispapi.Response.serialize(this.as_hash());
    return this.data.unparsed;
  },
  /**
   * return the parsed API response
   * @return {Object} parsed API response
   */
  as_hash: function() {
    var key, d;
    if (this.colregexp) {
      d = JSON.parse(JSON.stringify(this.data.parsed));
      if (d.hasOwnProperty("PROPERTY")) {
        for (key in d.PROPERTY) {
          if (d.PROPERTY.hasOwnProperty(key)) {
            if (!key.match(this.colregexp)) delete d.PROPERTY[key];
          }
        }
      }
    } else d = this.data.parsed;
    return this.applyCustomChanges(d);
  },
  /**
   * return the parsed API response as list
   * @return {Object} parse API response in list format
   */
  as_list: function() {
    var r = this.as_hash(),
      tmp = {},
      key, row, row2, i, count = 0;
    for (key in r) {
      if (r.hasOwnProperty(key) && !key.match(/^PROPERTY$/))
        tmp[key] = r[key];
    }
    if (r.CODE === "200") {
      tmp.LIST = [];
      row = {};
      for (key in r.PROPERTY) {
        if (r.PROPERTY.hasOwnProperty(key)) {
          if (!key.match(ispapi.Response.pagerRegexp)) { // paging info
            row[key] = "";
            if (r.PROPERTY[key].length > count) count = r.PROPERTY[key].length;
          }
        }
      }
      if (count) {
        for (i = 0; i < count; i++) { // run up to max index found
          row2 = {};
          for (key in row) { // run over all columns (properties) found
            // NOTE: do not add column indexes that are not available
            // -- avoids blowing up response size
            // -- requires implementation of mechanisms to avoid access on
            // these not existing indexes later (not part of this lib!)
            if (row.hasOwnProperty(key) && r.PROPERTY[key][i] !== undefined)
              row2[key] = r.PROPERTY[key][i];
          }
          tmp.LIST.push(JSON.parse(JSON.stringify(row2)));
        }
      }
      tmp.meta = {
        columns: this.columns(),
        pg: this.getPagination()
      };
    }
    return tmp;
  },
  /**
   * return the API response code
   * @return {String} API response code
   */
  code: function() {
    return this.get("CODE");
  },
  /**
   * return the API response description
   * @return {String} API response description
   */
  description: function() {
    return this.get("DESCRIPTION");
  },
  /**
   * return the API response PROPERTY Object
   * @return {Object} API response PROPERTY Object
   */
  properties: function() {
    return this.get("PROPERTY");
  },
  /**
   * return the API response runtime
   * @return {String} API response runtime
   */
  runtime: function() {
    return parseFloat(this.get("RUNTIME"));
  },
  /**
   * return the API response queuetime
   * @return {String} API response queuetime
   */
  queuetime: function() {
    return parseFloat(this.get("QUEUETIME"));
  },
  /**
   * check if the API response code stands for success
   * @return {Boolean} true if the API request succeeded, false otherwise
   */
  is_success: function() {
    return (this.get("CODE").charAt(0) === '2');
  },
  /**
   * check if the API response code stands for a temporary error
   * @return {Boolean} true if the API request run into a temp. error, false otherwise
   */
  is_tmp_error: function() {
    return (this.get("CODE").charAt(0) === '4');
  },
  /**
   * check if the API response code stand for an error
   * @return {Boolean} true if the API request failed, false otherwise
   */
  is_error: function() {
    return !(this.is_success() || this.is_tmp_error());
  },
  /**
   * return the API response PROPERTY key names
   * @return {Array} API response PROPERTY key names
   */
  columns: function() {
    var key, cols = [],
      props = this.properties(),
      regexp = ispapi.Response.pagerRegexp;
    if (props) {
      for (key in props) {
        if (props.hasOwnProperty(key) && !key.match(regexp)) cols.push(key);
      }
    }
    return cols;
  },
  /**
   * return pagination meta data of the API response
   * @return {Object} pagination meta data
   */
  getPagination: function() {
    return {
      FIRST: this.first(),
      LAST: this.last(),
      COUNT: this.count(),
      TOTAL: this.total(),
      LIMIT: this.limit(),
      PAGES: this.pages(),
      PAGE: this.page(),
      PAGENEXT: this.nextpage(),
      PAGEPREV: this.prevpage()
    };
  },
  /**
   * return the index of the first response entry
   * @return {Integer} index of the first response entry
   */
  first: function() {
    return (this.getColumnIndex("FIRST", 0, true) || 0);
  },
  /**
   * return the count of items in the API list response
   * @return {Integer} count of items in the response
   */
  count: function() {
    var c = this.getColumnIndex("COUNT", 0, true),
      cols, i, max = 0;
    if (c === false) {
      c = 0;
      cols = this.columns();
      for (i = 0; i < cols.length; i++) {
        c = this.getColumn(cols[i]).length;
        if (c > max) max = c;
      }
      c = max;
    }
    return c;
  },
  /**
   * return the index of the last response entry
   * @return {Integer} index of the last response entry
   */
  last: function() {
    return (this.getColumnIndex("LAST", 0, true) || this.count() - 1);
  },
  /**
   * @description return the count of items per page
   * @return {Integer} count of items per page
   */
  limit: function() {
    return (this.getColumnIndex("LIMIT", 0, true) || this.count() || 100);
  },
  /**
   * return the count of the total items matching the API request
   * @return {Integer} count of total items matching the API request
   */
  total: function() {
    return (this.getColumnIndex("TOTAL", 0, 10) || this.count());
  },
  /**
   * return the count of result pages matching the request
   * @return {Integer} count of result pages matching the request
   */
  pages: function() {
    var t = this.total();
    if (t) return (Math.ceil(t / this.limit()) || 1);
    return 1;
  },
  /**
   * return the current page number
   * @return {Integer} current page number
   */
  page: function() {
    if (this.count()) {
      var limit = this.limit();
      if (limit) return Math.floor(this.first() / limit) + 1;
    }
    return 1;
  },
  /**
   * return the previous page number
   * @return {Integer} previous page number
   */
  prevpage: function() {
    return ((this.page() - 1) || 1);
  },
  /**
   * return the next page number
   * @return {Integer} next page number
   */
  nextpage: function() {
    var page = this.page() + 1,
      pages = this.pages();
    return (page <= pages ? page : pages);
  }
};

/**
 * @alias node.ispapi-apiconnector
 * @desc Used to interact with the 1API Backend API
 * @property {node.ispapi-apiconnector.Request} Request
 * @property {node.ispapi-apiconnector.Client} Client
 * @property {node.ispapi-apiconnector.Response} Response
 */
var ispapi = {
  Request: Request,
  Client: Client,
  Response: Response
};

module.exports = ispapi;
