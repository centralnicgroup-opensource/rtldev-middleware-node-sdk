/* jslint node:true */
/* jshint node:true */

'use strict';

var util = require("util")
  , events = require("events")
  , ispapi = {};

/**
 * Class ispapi.Client
 *
 * @description Used to connect to 1API API Backend
 * @inherits from events.EventEmitter to be able to fire events Constructor
 */
ispapi.Client = function() {
  events.EventEmitter.call(this);
};
util.inherits(ispapi.Client, events.EventEmitter);

/**
 * @method command_encode
 * @description convert given command object to string
 * @param {Object} p_cmd Object specifying the command to encode
 */
ispapi.Client.command_encode = function(p_cmd) {
  var key
    , tmp = "";
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
 * @method login
 * @description set login config for later request(s)
 * @param {String} p_user String specifying the username
 * @param {String} p_pw String specifying the password
 * @param {String} p_entity String specifying the system environment / entity.
 * Use "1234" for OT&E, "54cd" for LIVE System
 * @param {String} p_remoteaddr String specifying the remote address + port
 * e.g. 1.2.3.4:80
 * @param {String} p_subuser String specifying a subuser for api requests
 */
ispapi.Client.prototype.login = function(p_user, p_pw, p_entity, p_remoteaddr,
        p_subuser) {
  this.logincfg = {
    login: p_user,
    pw: p_pw
  };
  if (p_entity) this.logincfg.entity = p_entity;
  if (p_subuser) this.logincfg.user = p_subuser;
  if (p_remoteaddr) this.setRemoteAddr(p_remoteaddr);
};
/**
 * @method setRemoteAddr
 * @description set remote address including remote port e.g. 1.2.3.4:80
 * @param {String} p_remoteaddr String specifying the remote address + port
 * e.g. 1.2.3.4:80
 */
ispapi.Client.prototype.setRemoteAddr = function(p_remoteaddr) {
  this.logincfg.remoteaddr = p_remoteaddr;
};
/**
 * @method connect
 * @description set socket configuration for later request(s)
 * @param {String} p_url String specifying the connection uri
 */
ispapi.Client.prototype.connect = function(p_url) {
  this.socketcfg = require("url").parse(p_url);
  if (!this.socketcfg.protocol.match(/^(http|https):$/))
    throw new Error( "Unsupported protocol within connection uri.");
  this.socketcfg.method = 'POST';
  //disable socket pooling (limitation maxSockets: 5 sockets per host)
  this.socketcfg.agent = false;

  if (!this.socketcfg.port)
    this.socketcfg.port = (
      this.socketcfg.protocol.match(/^https/i) ?
        '443' :
        '80'
    );
  this.headers();// set the expect header performance improvement
};
/**
 * @method headers
 * @description set custom request headers
 * @param {Object} p_head Object specifying the headers to apply
 */
ispapi.Client.prototype.headers = function(p_head) {
  if (p_head && !p_head.hasOwnProperty('Expect')) p_head.Expect = '';
  this.socketcfg.headers = (p_head || { 'Expect': '' });
};
/**
 * @method request
 * @description perform a command request to the 1API backend api
 * @param {Object} p_cmd Object specifying the command to request
 */
ispapi.Client.prototype.request = function(p_cmd) {
  var key
    , data = ""
    , req
    , oself = this;
  for (key in oself.logincfg) {
    if (oself.logincfg.hasOwnProperty(key)){
      data += encodeURIComponent('s_' + key);
      data += "=" + encodeURIComponent(oself.logincfg[key]) + "&";
    }
  }
  data += encodeURIComponent("s_command");
  data += "=" + encodeURIComponent(ispapi.Client.command_encode(p_cmd));

  req = require(oself.socketcfg.protocol.replace(/\:$/, '')).request(
          oself.socketcfg, function(res) {
            var response = "";
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
              response += chunk;
            });
            res.on('end', function() {
              oself.emit("response", new ispapi.Response(response));
              response = "";
            });
            res.on('error', function(e) {
              e.message = 'problem with response: ' + e.message;
              oself.emit('error', e);
            });
          });
  req.setTimeout(10000);
  req.on('socket', function (socket) {
    socket.on('timeout', function() {
      req.abort();
    });
  });
  req.on('error', function(e) {
    e.message = 'problem with request: ' + e.message;
    oself.emit('error', e);
  });
  req.write(data);
  req.end();
};

/**
 * Class ispapi.Response
 *
 * @description Used to handle the response of the 1API backend api Constructor
 * @param {String} p_r String specifying the unparsed plain api response
 */
ispapi.Response = function(p_r) {
  p_r = (
    (!p_r || p_r === "")
      ? "[RESPONSE]\ncode=423\ndescription=Empty response from API\nEOF\n"
      : p_r
  );
  this.colregexp = false;
  this.data = {
    unparsed: p_r,
    parsed: ispapi.Response.parse(p_r)
  };
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
 * @method parse
 * @description convert unparsed plain api response string to object notation
 * @param {String} p_r String specifying the unparsed api response
 * @return {Object}
 */
ispapi.Response.parse = function(r) {
  var hash = {}
    , regexp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/
    , m
    , mm;
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
      }
      else {
        hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, "");
      }
    }
  }
  if (!hash.hasOwnProperty("DESCRIPTION")) hash.DESCRIPTION = "";
  return hash;
};
/**
 * @method serialize
 * @description convert parsed plain api response to unparsed string notation
 * @param {Object} p_r Object specifying the parsed api response
 * @return {Object}
 */
ispapi.Response.serialize = function(r) {
  if (r.DESCRIPTION === "") delete r.DESCRIPTION;
  var plain = "[RESPONSE]"
    , key
    , i;
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

ispapi.Response.pagerRegexp = /^(TOTAL|FIRST|LAST|LIMIT|COUNT)$/;

ispapi.Response.prototype = {
  /**
   * @method useColumns
   * @description sets the columns to be available in the response
   * if false it returns all columns (default)
   * @return {Object || null}
   */
  useColumns: function(arr) {
    if (arr === "*") arr = false;
    this.colregexp = (
      arr
        ? new RegExp("^(" + arr.join("|") + ")$", "i")
        : false
    );
  },
  /**
   * @method rewind
   * @description resets the iterator to start value 0 and returns first row
   * @return {Object || null}
   */
  rewind: function() {
    return this.it.rewind();
  },
  /**
   * @method hasNext
   * @description returns true if next row can be iterated, false otherwise
   * @return {Boolean}
   */
  hasNext: function() {
    return this.it.hasNext();
  },
  /**
   * @method next
   * @description returns the list row for the next iterator position
   * @return {Object || null}
   */
  next: function() {
    return this.it.next();
  },
  /**
   * @method hasNext
   * @description returns true if prev. row can be iterated, false otherwise
   * @return {Boolean}
   */
  hasPrevious: function() {
    return this.it.hasPrevious();
  },
  /**
   * @method next
   * @description returns the list row for the previous iterator position
   * @return {Object || null}
   */
  previous: function() {
    return this.it.previous();
  },
  /**
   * @method current
   * @description returns the list row for the current iterator value
   * @return {Object}
   */
  current: function() {
    return this.it.current();
  },
  /**
   * @method get
   * @description returns the property value of the response object if found
   * @param {String} p_prop String specifying the property for value lookup
   * @return {Object || String || Boolean}
   * Object if property found and is of type Object
   * String if property found and is of type String
   * Boolean (false) if property is not found
   */
  get: function(p_prop) {
    if (this.data.parsed.hasOwnProperty(p_prop))
      return this.data.parsed[p_prop];
    return false;
  },
  /**
   * @method getColumn
   * @description return all values of the given column/property identifier
   * @param {String} p_prop String specifying the column/property identifier
   * @return {Array}
   */
  getColumn: function(p_prop) {
    var p = this.get("PROPERTY");
    if (p && p.hasOwnProperty(p_prop)) return p[p_prop];// return whole column
    return false;
  },
  /**
   * @method getColumnIndex
   * @description return the value by given row index and column identifier
   * @param {String} p_prop String specifying the column identifier
   * @param {Integer} p_idx Integer specifying the row index
   * @param {Boolean} p_cast_int Boolean integer cast the value [optional]
   * @return {String || Boolean} String if succeeded, Boolean (false) otherwise
   */
  getColumnIndex: function(p_prop, p_idx, p_cast_int) {
    var col = this.getColumn(p_prop);
    if (col && col[p_idx])
      return (
        p_cast_int
          ? parseInt(col[p_idx], 10)
          : col[p_idx]
        );
    return false;
  },
  /**
   * @method as_string
   * @description return the unparsed api response
   * @return {String}
   */
  as_string: function() {
    if (this.colregexp) return ispapi.Response.serialize(this.as_hash());
    return this.data.unparsed;
  },
  /**
   * @method as_hash
   * @description return the parsed api response
   * @return {Object}
   */
  as_hash: function() {
    if (this.colregexp) {
      var d = JSON.parse(JSON.stringify(this.data.parsed))
        , key;
      if (d.hasOwnProperty("PROPERTY")) {
        for (key in d.PROPERTY) {
          if (d.PROPERTY.hasOwnProperty(key)){
            if (!key.match(this.colregexp)) delete d.PROPERTY[key];
          }
        }
      }
      return d;
    }
    return this.data.parsed;
  },
  /**
   * @method as_list
   * @description return the parsed api response as list
   * @return {Object}
   */
  as_list: function() {
    var r = this.as_hash()
      , tmp = {}
      , key
      , row
      , row2
      , i
      , count = 0;
    for (key in r) {
      if (r.hasOwnProperty(key) && !key.match(/^PROPERTY$/))
        tmp[key] = r[key];
    }
    if (r.CODE === "200") {
      tmp.LIST = [];
      row = {};
      for (key in r.PROPERTY) {
        if (r.PROPERTY.hasOwnProperty(key)){
          if (!key.match(ispapi.Response.pagerRegexp)) {// paging info
            row[key] = "";
            if (r.PROPERTY[key].length > count) count = r.PROPERTY[key].length;
          }
        }
      }
      if (count) {
        for (i = 0; i < count; i++) {// run up to max index found
          row2 = {};
          for (key in row) {// run over all columns (properties) found
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
   * @method code
   * @description return the api response code
   * @return {String}
   */
  code: function() {
    return this.get("CODE");
  },
  /**
   * @method description
   * @description return the api response description
   * @return {String}
   */
  description: function() {
    return this.get("DESCRIPTION");
  },
  /**
   * @method properties
   * @description return the api response PROPERTY Object
   * @return {Object}
   */
  properties: function() {
    return this.get("PROPERTY");
  },
  /**
   * @method runtime
   * @description return the api response runtime
   * @return {String}
   */
  runtime: function() {
    return parseFloat(this.get("RUNTIME"));
  },
  /**
   * @method queuetime
   * @description return the api response queuetime
   * @return {String}
   */
  queuetime: function() {
    return parseFloat(this.get("QUEUETIME"));
  },
  /**
   * @method is_success
   * @description check if the api response code stands for success
   * @return {Boolean}
   */
  is_success: function() {
    return (this.get("CODE").charAt(0) === '2');
  },
  /**
   * @method is_tmp_error
   * @description check if the api response code stands for a temporary error
   * @return {Boolean}
   */
  is_tmp_error: function() {
    return (this.get("CODE").charAt(0) === '4');
  },
  /**
   * @method is_error
   * @description check if the api response code stand for an error
   * @return {Boolean}
   */
  is_error: function() {
    return !(this.is_success() || this.is_tmp_error());
  },
  /**
   * @method columns
   * @description return the api response PROPERTY key names
   * @return {Array}
   */
  columns: function() {
    var key
      , cols = []
      , props = this.properties()
      , regexp = ispapi.Response.pagerRegexp;
    if (props){
      for (key in props) {
        if (props.hasOwnProperty(key) && !key.match(regexp)) cols.push(key);
      }
    }
    return cols;
  },
  /**
   * @method getPagination
   * @description return pagination meta data of the api response
   * @return {Object}
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
   * @method first
   * @description return the index of the first response entry
   * @return {Integer}
   */
  first: function() {
    return (this.getColumnIndex("FIRST", 0, true) || 0);
  },
  /**
   * @method count
   * @description return the count of items in the api list response
   * @return {Integer}
   */
  count: function() {
    var c = this.getColumnIndex("COUNT", 0, true)
      , cols
      , i
      , max = 0;
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
   * @method last
   * @description return the index of the last response entry
   * @return {Integer}
   */
  last: function() {
    return (this.getColumnIndex("LAST", 0, true) || this.count() - 1);
  },
  /**
   * @method limit
   * @description return the amount of items per page
   * @return {Integer}
   */
  limit: function() {
    return (this.getColumnIndex("LIMIT", 0, true) || this.count() || 100);
  },
  /**
   * @method total
   * @description return the amount of the total items matching the api request
   * @return {Integer}
   */
  total: function() {
    return (this.getColumnIndex("TOTAL", 0, 10) || this.count());
  },
  /**
   * @method pages
   * @description return the count of result pages matching the request
   * @return {Integer}
   */
  pages: function() {
    var t = this.total();
    if (t) return (Math.ceil(t / this.limit()) || 1);
    return 1;
  },
  /**
   * @method page
   * @description return the current page number
   * @return {Integer}
   */
  page: function() {
    if (this.count()) {
      var limit = this.limit();
      if (limit) return Math.floor(this.first() / limit) + 1;
    }
    return 1;
  },
  /**
   * @method prevpage
   * @description return the previous page number
   * @return {Integer}
   */
  prevpage: function() {
    return ((this.page() - 1) || 1);
  },
  /**
   * @method nextpage
   * @description return the next page number
   * @return {Integer}
   */
  nextpage: function() {
    var page = this.page() + 1, pages = this.pages();
    return (page <= pages ? page : pages);
  }
};

module.exports = ispapi;
