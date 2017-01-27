/* jshint -W024 */
/* jshint expr:true */
"use strict";

var assert = require('chai').assert;
var expect = require('chai').expect;
var apiconnector = require('../index.js');

var responseHashFormatCheck = function(r) {
  expect(r).to.be.an('object');
  expect(r).to.have.property('CODE');
  expect(r).to.have.property('DESCRIPTION');
  expect(r.CODE).to.be.a('string');
  expect(r.DESCRIPTION).to.be.a('string');
};

var responseListRowCheck = function(row) {
  expect(row).to.be.an('object');
  expect(row).to.be.an.instanceof(Object);
};

var arrayCheck = function(col) {
  expect(col).to.be.an('array');
  expect(col).to.be.an.instanceof(Array);
};

var stringCheck = function(str) {
  expect(str).to.be.a('string');
};

var defaultResponseTemplates = ['404', 'error', 'empty', 'expired'];
describe("response.js", function() {
  var response = apiconnector.Response;

  describe("check general class structure", function() {
    it("check constructor", function() {
      expect(apiconnector).to.have.property('Response');
      expect(apiconnector.Response).to.be.an('function');
    });
    it("check non-prototype vars", function() {
      expect(apiconnector.Response).to.have.property('pagerRegexp');
      expect(apiconnector.Response.pagerRegexp).to.be.an('regexp');
    });
    var methods = ["parse", "serialize", "getTemplates", "getTemplate", "isTemplateMatch"];
    methods.forEach(function(m) {
      it("check existance of non-prototype method '" + m + "'", function() {
        expect(apiconnector.Response).to.have.property(m);
        expect(apiconnector.Response[m]).to.be.an('function');
      });
    });
    methods = [
      "useColumns", "rewind", "hasNext", "next", "hasPrevious", "previous", "current", "get",
      "getColumn", "getColumnIndex", "applyCustomChanges", "as_string", "as_hash", "as_list",
      "code", "description", "properties", "runtime", "queuetime", "is_success", "is_tmp_error",
      "is_error", "columns", "getPagination", "first", "count", "last", "limit", "total",
      "pages", "page", "prevpage", "nextpage"
    ];
    methods.forEach(function(m) {
      it("check existance of prototype method '" + m + "'", function() {
        expect(apiconnector.Response.prototype).to.have.property(m);
        expect(apiconnector.Response.prototype[m]).to.be.an('function');
      });
    });
  });

  describe("Response.getTemplate", function() {
    defaultResponseTemplates.forEach(function(tpl) {
      (function(rtpl) {
        it("return unparsed template '" + rtpl + "'", function() {
          var r = response.getTemplate(rtpl);
          stringCheck(r);
        });
        it("return parsed template '" + rtpl + "'", function() {
          var r = response.getTemplate(rtpl, true);
          responseHashFormatCheck(r);
        });
      }(tpl));
    });

    it("return non existing template '__iWillNeverExist__'", function() {
      var r = response.getTemplate('__iWillNeverExist__');
      expect(r).to.be.false; //false
    });
  });

  describe("Response.getTemplates", function() {
    it("return all default response templates", function() {
      var tpls = response.getTemplates();
      expect(tpls).to.be.an('object');
    });
  });

  describe("Response.parse", function() {
    defaultResponseTemplates.forEach(function(tpl) {
      (function(rtpl) {
        it("return parsed response template response", function() {
          //the below equals to Response.getTemplate(tpl, true);
          var r = response.getTemplate(rtpl);
          var hash = response.parse(r);
          responseHashFormatCheck(hash);
        });
      }(tpl));
    });
  });

  describe("Response.serialize", function() {
    defaultResponseTemplates.forEach(function(tpl) {
      (function(rtpl) {
        it("return parsed response template response", function() {
          //the below equals to Response.getTemplate(tpl, true);
          var r = response.getTemplate(rtpl);
          var hash = response.parse(r);
          responseHashFormatCheck(hash);
        });
      }(tpl));
    });
    it("serialize a parsed API response to plain text", function() {
      var r = response.getTemplate('error');
      var hash = response.parse(r);
      var plain = response.serialize(hash);
      stringCheck(plain);
      expect(plain).to.equal(r);
    });
  });

  describe("Response.isTemplateMatch", function() {
    it("check if parsed API response matches a default response template", function() {
      var hash = response.getTemplate('error', true);
      var ismatch = response.isTemplateMatch(hash, 'error');
      expect(ismatch).to.be.true;
      ismatch = response.isTemplateMatch(hash, 'expired');
      expect(ismatch).to.be.false;
      ismatch = response.isTemplateMatch(hash, '__iWillNeverExist__');
      expect(ismatch).to.be.false;
    });
  });

  describe("Response Instance", function() {
    var exampleTPL = require('./test-commands.js');
    var r;

    it("construct success example response template", function() {
      r = new apiconnector.Response(null, exampleTPL.success.COMMAND);
      expect(r).to.be.an('object');
      expect(r).to.be.an.instanceof(apiconnector.Response);
    });

    it("construct success example response template", function() {
      r = new apiconnector.Response(exampleTPL.success.RESPONSE, exampleTPL.success.COMMAND);
      expect(r).to.be.an('object');
      expect(r).to.be.an.instanceof(apiconnector.Response);
    });

    it("iterator and its methods", function() {
      var it = r.it;
      expect(it).to.be.an('object');
      assert.isFunction(it.hasNext);
      expect(it.hasNext()).to.equal(true);
      assert.isFunction(it.hasPrevious);
      expect(it.hasPrevious()).to.equal(false);
      assert.isFunction(it.rewind);
      expect(it.rewind()).to.equal(it.current());
      assert.isFunction(it.previous);
      expect(it.previous()).to.equal(null);
      assert.isFunction(it.next);
      expect(it.next()).to.not.equal(null);
      expect(it.next()).to.equal(null);
      assert.isFunction(it.current);
      expect(it.current()).to.be.an('object');
      it.rewind();
    });

    it("useColumns", function() {
      r.useColumns(["DOMAIN", "REPOSITORY"]);
      expect(r.colregexp).to.be.an('regexp');
      expect(r.colregexp.toString()).to.equal('/^(DOMAIN|REPOSITORY)$/i');
      r.useColumns('*'); //restore defaults: this.colregexp set to false
      expect(r.colregexp).to.be.false;
    });

    it("hasNext", function() {
      var flag;
      assert.isFunction(r.hasNext);
      flag = r.hasNext();
      expect(flag).to.be.true; //index 0 (of two items)
    });

    it("hasPrevious", function() {
      var flag;
      assert.isFunction(r.hasPrevious);
      flag = r.hasPrevious();
      expect(flag).to.be.false; //index 0 (of two items)
    });

    it("rewind", function() {
      var row, flag;
      assert.isFunction(r.rewind);
      row = r.rewind();
      responseListRowCheck(row);
      flag = r.hasNext();
      expect(flag).to.be.true; //index 0 (of two items)
      flag = r.hasPrevious();
      expect(flag).to.be.false; //index 0 (of two items)
    });

    it("next", function() {
      var row, flag;
      assert.isFunction(r.next);
      row = r.next();
      responseListRowCheck(row);
      flag = r.hasNext();
      expect(flag).to.be.false; //index 1 (of two items)
      flag = r.hasPrevious();
      expect(flag).to.be.true; //index 1 (of two items)
    });

    it("previous", function() {
      var row, flag;
      assert.isFunction(r.previous);
      row = r.previous();
      responseListRowCheck(row);
      flag = r.hasNext();
      expect(flag).to.be.true; //index 0 (of two items)
      flag = r.hasPrevious();
      expect(flag).to.be.false; //index 0 (of two items)
    });

    it("current", function() {
      var row;
      assert.isFunction(r.current);
      row = r.current();
      responseListRowCheck(row); //index 0
    });

    it("get", function() {
      var pt;
      assert.isFunction(r.get);
      pt = r.get('PROPERTY');
      expect(pt).to.be.an('object');
      pt = r.get('__iWillNeverExist__');
      expect(pt).to.be.false;
    });

    it("getColumn", function() {
      var col;
      assert.isFunction(r.getColumn);
      col = r.getColumn('CREATEDDATE');
      arrayCheck(col);
      col = r.get('__iWillNeverExist__');
      expect(col).to.be.false;
    });

    it("getColumnIndex", function() {
      var cell;
      assert.isFunction(r.getColumnIndex);
      cell = r.getColumnIndex('PREPAIDPERIOD', 1);
      stringCheck(cell);
      expect(cell).to.equal("0");
      cell = r.getColumnIndex('PREPAIDPERIOD', 1, true);
      expect(cell).to.be.a('number');
      expect(cell).to.equal(0);
    });

    it("applyCustomChanges", function() { //nothings changes here, but can be overriden on demand
      assert.isFunction(r.applyCustomChanges);
      var test = {
        test: true
      };
      var tmp;
      tmp = r.applyCustomChanges(test);
      expect(tmp).to.equal(test);
    });

    it("as_string", function() {
      assert.isFunction(r.as_string);
      r.useColumns('*'); //reset to default
      var plain1, plain2;
      plain1 = r.as_string();
      stringCheck(plain1);
      r.useColumns(["DOMAIN", "REPOSITORY"]);
      plain2 = r.as_string();
      stringCheck(plain2);
      expect(plain1).to.not.equal(plain2);
      r.useColumns('*'); //reset to default
      plain2 = r.as_string();
      stringCheck(plain2);
      expect(plain1).to.equal(plain2);
    });

    it("as_hash", function() {
      assert.isFunction(r.as_hash);
      r.useColumns('*'); //reset to default
      var h1, h2;
      h1 = r.as_hash();
      r.useColumns(["DOMAIN", "REPOSITORY"]);
      h2 = r.as_hash();
      expect(h1).to.not.equal(h2);
      r.useColumns('*'); //reset to default
      h2 = r.as_hash();
      expect(h1).to.equal(h2);
    });

    it("getPagination", function() {
      var pg = r.getPagination();
      expect(pg).to.be.an('object');
      ['FIRST', 'LAST', 'COUNT', 'TOTAL', 'LIMIT', 'PAGES', 'PAGE', 'PAGENEXT', 'PAGEPREV'].forEach(function(key) {
        expect(pg).to.have.property(key);
      });
      expect(pg.FIRST).to.equal(0);
      expect(pg.LAST).to.equal(1);
      expect(pg.COUNT).to.equal(2);
      expect(pg.TOTAL).to.equal(2);
      expect(pg.LIMIT).to.equal(exampleTPL.success.COMMAND.LIMIT);
      expect(pg.PAGES).to.equal(1);
      expect(pg.PAGE).to.equal(1);
      expect(pg.PAGENEXT).to.equal(1);
      expect(pg.PAGEPREV).to.equal(1);
    });

    it("as_list", function() {
      assert.isFunction(r.as_list);
      r.useColumns('*'); //reset to default
      var l1, l2;
      l1 = r.as_list();
      r.useColumns(["DOMAIN", "REPOSITORY"]);
      l2 = r.as_list();
      expect(l1).to.not.equal(l2);
      r.useColumns('*'); //reset to default
      l2 = r.as_list();
      expect(l1).to.deep.equal(l2);
      //just in success case '200', we have:
      expect(l1).to.have.property('LIST');
      arrayCheck(l1.LIST);
      expect(l1).to.have.property('meta');
      expect(l1.meta).to.have.property('columns');
      arrayCheck(l1.meta.columns);
      expect(l1.meta).to.have.property('pg');
      expect(l1.meta.pg).to.be.an('object');
    });

    it("code", function() {
      assert.isFunction(r.code);
      var c = r.code();
      stringCheck(c);
      expect(c).to.equal('200');
    });

    it("description", function() {
      assert.isFunction(r.description);
      var d = r.description();
      stringCheck(d);
      expect(d).to.equal('Command completed successfully');
    });

    it("properties", function() {
      assert.isFunction(r.properties);
      var p = r.properties();
      expect(p).to.be.a('object'); //in success case!
    });

    it("runtime", function() {
      assert.isFunction(r.runtime);
      var p = r.runtime();
      expect(p).to.be.a('number');
      expect(p).to.equal(0.12);
    });

    it("queuetime", function() {
      assert.isFunction(r.queuetime);
      var p = r.queuetime();
      expect(p).to.be.a('number');
      expect(p).to.equal(0);
    });

    it("is_success", function() {
      assert.isFunction(r.is_success);
      var p, r2;
      p = r.is_success();
      expect(p).to.equal(true);
      r2 = new apiconnector.Response(exampleTPL.error.RESPONSE, exampleTPL.error.COMMAND);
      p = r2.is_success();
      expect(p).to.equal(false);
      r2 = new apiconnector.Response(exampleTPL.tmperror.RESPONSE, exampleTPL.tmperror.COMMAND);
      p = r2.is_success();
      expect(p).to.equal(false);
    });

    it("is_tmp_error", function() {
      assert.isFunction(r.is_tmp_error);
      var p, r2;
      p = r.is_tmp_error();
      expect(p).to.equal(false);
      r2 = new apiconnector.Response(exampleTPL.error.RESPONSE, exampleTPL.error.COMMAND);
      p = r2.is_tmp_error();
      expect(p).to.equal(false);
      r2 = new apiconnector.Response(exampleTPL.tmperror.RESPONSE, exampleTPL.tmperror.COMMAND);
      p = r2.is_tmp_error();
      expect(p).to.equal(true);
    });

    it("is_error", function() {
      assert.isFunction(r.is_error);
      var p, r2;
      p = r.is_error();
      expect(p).to.be.false;
      r2 = new apiconnector.Response(exampleTPL.error.RESPONSE, exampleTPL.error.COMMAND);
      p = r2.is_error();
      expect(p).to.be.true;
      r2 = new apiconnector.Response(exampleTPL.tmperror.RESPONSE, exampleTPL.tmperror.COMMAND);
      p = r2.is_error();
      expect(p).to.be.false;
    });

    it("columns", function() {
      assert.isFunction(r.columns);
      var cols = r.columns();
      arrayCheck(cols);
    });

    it("first", function() {
      assert.isFunction(r.first);
      var d = r.first();
      expect(d).to.equal(0);
    });

    it("count", function() {
      assert.isFunction(r.count);
      var d = r.count();
      expect(d).to.equal(2);
    });

    it("last", function() {
      assert.isFunction(r.last);
      var d = r.last();
      expect(d).to.equal(1);
    });

    it("limit", function() {
      assert.isFunction(r.limit);
      var d = r.limit();
      expect(d).to.equal(exampleTPL.success.COMMAND.LIMIT); //if not api would have it ignored
    });

    it("total", function() {
      assert.isFunction(r.total);
      var d = r.total();
      expect(d).to.equal(2);
    });

    it("pages", function() {
      assert.isFunction(r.pages);
      var d = r.pages();
      expect(d).to.equal(1);
    });

    it("page", function() {
      assert.isFunction(r.page);
      var d = r.page();
      expect(d).to.equal(1);
    });

    it("prevpage", function() {
      assert.isFunction(r.prevpage);
      var d = r.prevpage();
      expect(d).to.equal(1);
    });

    it("nextpage", function() {
      assert.isFunction(r.nextpage);
      var d = r.nextpage();
      expect(d).to.equal(1);
    });

  });

});
