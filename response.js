/*
 * ispapi-apiconnector
 * Copyright(c) 2015 Kai Schwarz, 1API GmbH
 * MIT Licensed
 */
'use strict';

var responses = require("./defaultresponses.js");

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
    parsed: Response.parse(p_r)
  };
  this.cmd = Object.assign({}, p_command);
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
  var hash, regexp, m, mm;
  hash = {};
  regexp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/;
  r = r.replace(/\r\n/g, '\n').split('\n');
  while (r.length) {
    m = (r.shift()).match(regexp);
    if (m) {
      mm = m[1].match(/^property\[([^\]]*)\]/i);
      if (mm) {
        if (!hash.hasOwnProperty("PROPERTY")) hash.PROPERTY = {};
        mm[1] = mm[1].toUpperCase().replace(/\s/g, '');
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
 * convert parsed plain API response to unparsed string notation
 * @param  {Object} p_r Object specifying the parsed API response
 * @return {Object}     Response in unparsed plain text
 */
Response.serialize = function(p_r) {
  var plain, r;
  r = Object.assign({}, p_r);
  plain = "[RESPONSE]";
  if (r.hasOwnProperty("PROPERTY")) {
    Object.keys(r.PROPERTY).forEach(function(key){
      r.PROPERTY[key].forEach(function(val, index){
        plain += "\r\nPROPERTY[" + key + "][" + index + "]=" + val;
      });
    });
  }
  if (r.hasOwnProperty("CODE")) plain += "\r\ncode=" + r.CODE;
  if (r.hasOwnProperty("DESCRIPTION")) plain += "\r\ndescription=" + r.DESCRIPTION;
  if (r.hasOwnProperty("QUEUETIME")) plain += "\r\nqueuetime=" + r.QUEUETIME;
  if (r.hasOwnProperty("RUNTIME")) plain += "\r\nruntime=" + r.RUNTIME;
  plain += "\r\nEOF\r\n";
  return plain;
};
/**
 * returns the default response templates
 * @return {Object}  default response templates
 */
Response.getTemplates = function() {
  return responses;
};
/**
 * returns a default response template as parsed js object hash
 * @param {String} p_tplid the id of the template to return
 * @param {Boolean} p_parse flag to toggle the returned format. true: parsed, otherwise: unparsed
 * @return {Object|String|Boolean}  default response template of false if not found
 */
Response.getTemplate = function(p_tplid, p_parse) {
  if (responses[p_tplid])
    if (p_parse)
      return Response.parse(responses[p_tplid]);
    else
      return responses[p_tplid];
  return false;
};
/**
 * check if the given response matches a default response template
 * @param  {Object} p_r given response
 * @param  {String} p_tplid given default template id
 * @return {Boolean}  the check result
 */
Response.isTemplateMatch = function(p_r, p_tplid) {
  var tpl = Response.getTemplate(p_tplid, true);
  if (tpl && p_r.CODE === tpl.CODE && p_r.DESCRIPTION === tpl.DESCRIPTION)
    return true;
  return false;
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
    if (this.colregexp) return Response.serialize(this.as_hash());
    return this.data.unparsed;
  },
  /**
   * return the parsed API response
   * @return {Object} parsed API response
   */
  as_hash: function() {
    var d;
    if (this.colregexp) {
      d = Object.assign({}, this.data.parsed);
      if (d.hasOwnProperty("PROPERTY")) {
        Object.keys(d.PROPERTY).forEach(function(key){
          if (!key.match(this.colregexp)) delete d.PROPERTY[key];
        }.bind(this));
      }
    }
    else d = this.data.parsed;
    return this.applyCustomChanges(d);
  },
  /**
   * return the parsed API response as list
   * @return {Object} parse API response in list format
   */
  as_list: function() {
    var r, tmp, key, row, row2, i, count;
    r = this.as_hash();
    tmp = {};
    count = 0;
    for (key in r) {
      if (r.hasOwnProperty(key) && !key.match(/^PROPERTY$/))
        tmp[key] = r[key];
    }
    if (r.CODE === "200") {
      tmp.LIST = [];
      row = {};
      for (key in r.PROPERTY) {
        if (r.PROPERTY.hasOwnProperty(key)) {
          if (!key.match(Response.pagerRegexp)) { // paging info
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
          tmp.LIST.push(Object.assign({}, row2));
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
      regexp = Response.pagerRegexp;
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

module.exports = Response;
