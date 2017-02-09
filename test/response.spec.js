/* jshint -W024 */
/* jshint expr:true */
"use strict";

var expect = require('chai').expect;
var Response = require('../response.js');
var chkHlp = require('./check-helper.js');
var expectResponse = chkHlp.expectResponse;
var expectResponseHash = chkHlp.expectResponseHash;
var expectPropertyFn = chkHlp.expectPropertyFn;

var defaultResponseTemplates = ['404', 'error', 'empty', 'expired'];
describe("response.js", function() {

  describe("check general class structure", function() {
    it("check constructor", function() {
      expect(Response).to.be.an('function');
    });
    it("check non-prototype vars", function() {
      expect(Response).to.have.property('pagerRegexp');
      expect(Response.pagerRegexp).to.be.a('regexp');
    });
    var methods = ["parse", "serialize", "getTemplates", "getTemplate", "isTemplateMatch"];
    methods.forEach(function(m) {
      it("check existance of non-prototype method '" + m + "'", function() {
        expectPropertyFn(Response, m);
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
        expectPropertyFn(Response.prototype, m);
      });
    });
  });

  describe("Response.getTemplate", function() {
    defaultResponseTemplates.forEach(function(tpl) {
      (function(rtpl) {
        it("return unparsed template '" + rtpl + "'", function() {
          expect(Response.getTemplate(rtpl)).to.be.a('string');
        });
        it("return parsed template '" + rtpl + "'", function() {
          expectResponseHash(Response.getTemplate(rtpl, true));
        });
      }(tpl));
    });

    it("return non existing template '__iWillNeverExist__'", function() {
      expect(Response.getTemplate('__iWillNeverExist__')).to.be.false;
    });
  });

  describe("Response.getTemplates", function() {
    it("return all default response templates", function() {
      expect(Response.getTemplates()).to.be.an('object');
    });
  });

  describe("Response.parse", function() {
    defaultResponseTemplates.forEach(function(tpl) {
      (function(rtpl) {
        it("return parsed response template response", function() {
          //the below equals to Response.getTemplate(tpl, true);
          expectResponseHash(Response.parse(Response.getTemplate(rtpl)));
        });
      }(tpl));
    });

    it("return parsed response for a response without DESCRIPTION", function() {
      expectResponseHash(Response.parse("[RESPONSE]\r\ncode=421\r\nEOF\r\n"), '421', "");
    });
  });

  describe("Response.serialize", function() {
    defaultResponseTemplates.forEach(function(tpl) {
      (function(rtpl) {
        it("return parsed response template response", function() {
          //the below equals to Response.getTemplate(tpl, true);
          var r = Response.getTemplate(rtpl);
          var hash = Response.parse(r);
          expectResponseHash(hash);
        });
      }(tpl));
    });
    it("serialize a parsed API response to plain text", function() {
      var r = Response.getTemplate('error');
      var plain = Response.serialize(Response.parse(r));
      expect(plain).to.be.a('string');
      expect(plain).to.equal(r);
    });
    it("serialize a parsed API response to plain text [w/o CODE and DESCRIPTION]", function() {
      expect(Response.serialize({
        QUEUETIME: "0.00"
      })).to.equal("[RESPONSE]\r\nqueuetime=0.00\r\nEOF\r\n");
    });
  });

  describe("Response.isTemplateMatch", function() {
    it("check if parsed API response matches a default response template", function() {
      var hash = Response.getTemplate('error', true);
      var ismatch = Response.isTemplateMatch(hash, 'error');
      expect(ismatch).to.be.true;
      ismatch = Response.isTemplateMatch(hash, 'expired');
      expect(ismatch).to.be.false;
      ismatch = Response.isTemplateMatch(hash, '__iWillNeverExist__');
      expect(ismatch).to.be.false;
    });
  });

  describe("Response Instance", function() {
    var testcmds = require('./test-commands.js').querydomainlist;
    var r;

    it("construct success example response template [w/o response]", function() {
      r = new Response(null, testcmds.success.COMMAND);
      expectResponse(r);
    });

    it("construct success example response template", function() {
      r = new Response(testcmds.success.RESPONSE, testcmds.success.COMMAND);
      expectResponse(r);
    });

    it("iterator and its methods", function() {
      var it = r.it;
      expect(it).to.be.an('object');
      expectPropertyFn(it, 'hasNext');
      expectPropertyFn(it, 'hasPrevious');
      expectPropertyFn(it, 'rewind');
      expectPropertyFn(it, 'previous');
      expectPropertyFn(it, 'next');
      expectPropertyFn(it, 'current');
      expect(it.hasNext()).to.equal(true);
      expect(it.hasPrevious()).to.equal(false);
      expect(it.rewind()).to.equal(it.current());
      expect(it.previous()).to.equal(null);
      expect(it.next()).to.not.equal(null);
      expect(it.next()).to.equal(null);
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
      expect(r.hasNext()).to.be.true; //index 0 (of two items)
    });

    it("hasPrevious", function() {
      expect(r.hasPrevious()).to.be.false; //index 0 (of two items)
    });

    it("rewind", function() {
      var row, flag;
      row = r.rewind();
      expect(row).to.be.an('object');
      flag = r.hasNext();
      expect(flag).to.be.true; //index 0 (of two items)
      flag = r.hasPrevious();
      expect(flag).to.be.false; //index 0 (of two items)
    });

    it("next", function() {
      var row, flag;
      row = r.next();
      expect(row).to.be.an('object');
      flag = r.hasNext();
      expect(flag).to.be.false; //index 1 (of two items)
      flag = r.hasPrevious();
      expect(flag).to.be.true; //index 1 (of two items)
    });

    it("previous", function() {
      var row, flag;
      row = r.previous();
      expect(row).to.be.an('object');
      flag = r.hasNext();
      expect(flag).to.be.true; //index 0 (of two items)
      flag = r.hasPrevious();
      expect(flag).to.be.false; //index 0 (of two items)
    });

    it("current", function() {
      expect(r.current()).to.be.an('object'); //index 0
    });

    it("get", function() {
      var pt = r.get('PROPERTY');
      expect(pt).to.be.an('object');
      pt = r.get('__iWillNeverExist__');
      expect(pt).to.be.false;
    });

    it("getColumn", function() {
      var col = r.getColumn('CREATEDDATE');
      expect(col).to.be.an('array');
      col = r.get('__iWillNeverExist__');
      expect(col).to.be.false;
    });

    it("getColumnIndex", function() {
      var cell = r.getColumnIndex('PREPAIDPERIOD', 1);
      expect(cell).to.be.a('string');
      expect(cell).to.equal("0");
      cell = r.getColumnIndex('PREPAIDPERIOD', 1, true);
      expect(cell).to.be.a('number');
      expect(cell).to.equal(0);
    });

    it("applyCustomChanges", function() { //nothings changes here, but can be overriden on demand
      var test, tmp;
      test = {
        test: true
      };
      tmp = r.applyCustomChanges(test);
      expect(tmp).to.equal(test);
    });

    it("as_string", function() {
      var plain1, plain2;
      r.useColumns('*'); //reset to default
      plain1 = r.as_string();
      expect(plain1).to.be.a('string');
      r.useColumns(["DOMAIN", "REPOSITORY"]);
      plain2 = r.as_string();
      expect(plain2).to.be.a('string');
      expect(plain1).to.not.equal(plain2);
      r.useColumns('*'); //reset to default
      plain2 = r.as_string();
      expect(plain2).to.be.a('string');
      expect(plain1).to.equal(plain2);
    });

    it("as_hash", function() {
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
      expect(pg.FIRST).to.equal(0);
      expect(pg.LAST).to.equal(1);
      expect(pg.COUNT).to.equal(2);
      expect(pg.TOTAL).to.equal(2);
      expect(pg.LIMIT).to.equal(testcmds.success.COMMAND.LIMIT);
      expect(pg.PAGES).to.equal(1);
      expect(pg.PAGE).to.equal(1);
      expect(pg.PAGENEXT).to.equal(1);
      expect(pg.PAGEPREV).to.equal(1);
    });

    it("as_list", function() {
      var l1, l2;
      r.useColumns('*'); //reset to default
      l1 = r.as_list();
      r.useColumns(["DOMAIN", "REPOSITORY"]);
      l2 = r.as_list();
      expect(l1).to.not.equal(l2);
      r.useColumns('*'); //reset to default
      l2 = r.as_list();
      expect(l1).to.deep.equal(l2);
      //just in success case '200', we have:
      expect(l1).to.have.property('LIST');
      expect(l1.LIST).to.be.an('array');
      expect(l1).to.have.property('meta');
      expect(l1.meta).to.have.property('columns');
      expect(l1.meta.columns).to.be.an('array');
      expect(l1.meta).to.have.property('pg');
      expect(l1.meta.pg).to.be.an('object');
    });

    it("as_list [with different hash property count]", function() {
      //PROPERTY[TRANSFERLOCK][1] removed
      //especially in domain list we might have properties with different hash property count
      var r2 = new Response(testcmds.indexlength.RESPONSE, testcmds.indexlength.COMMAND);
      var l = r2.as_list();
      expect(l).to.have.property('LIST');
      expect(l.LIST).to.be.an('array');
      expect(l).to.have.property('meta');
      expect(l.meta).to.have.property('columns');
      expect(l.meta.columns).to.be.an('array');
      expect(l.meta).to.have.property('pg');
      expect(l.meta.pg).to.be.an('object');
    });

    it("code", function() {
      expect(r.code()).to.equal('200');
    });

    it("description", function() {
      expect(r.description()).to.equal('Command completed successfully');
    });

    it("properties", function() {
      expect(r.properties()).to.be.a('object'); //in success case!
    });

    it("runtime", function() {
      var p = r.runtime();
      expect(p).to.be.a('number');
      expect(p).to.equal(0.12);
    });

    it("queuetime", function() {
      var p = r.queuetime();
      expect(p).to.be.a('number');
      expect(p).to.equal(0);
    });

    it("is_success", function() {
      var r2;
      expect(r.is_success()).to.equal(true);
      r2 = new Response(testcmds.error.RESPONSE, testcmds.error.COMMAND);
      expect(r2.is_success()).to.equal(false);
      r2 = new Response(testcmds.tmperror.RESPONSE, testcmds.tmperror.COMMAND);
      expect(r2.is_success()).to.equal(false);
    });

    it("is_tmp_error", function() {
      var r2;
      expect(r.is_tmp_error()).to.equal(false);
      r2 = new Response(testcmds.error.RESPONSE, testcmds.error.COMMAND);
      expect(r2.is_tmp_error()).to.equal(false);
      r2 = new Response(testcmds.tmperror.RESPONSE, testcmds.tmperror.COMMAND);
      expect(r2.is_tmp_error()).to.equal(true);
    });

    it("is_error", function() {
      var r2;
      expect(r.is_error()).to.be.false;
      r2 = new Response(testcmds.error.RESPONSE, testcmds.error.COMMAND);
      expect(r2.is_error()).to.be.true;
      r2 = new Response(testcmds.tmperror.RESPONSE, testcmds.tmperror.COMMAND);
      expect(r2.is_error()).to.be.false;
    });

    it("columns", function() {
      expect(r.columns()).to.be.an('array');
    });

    it("first", function() {
      expect(r.first()).to.equal(0);
    });

    it("count", function() {
      expect(r.count()).to.equal(2);
    });

    it("last", function() {
      expect(r.last()).to.equal(1);
    });

    it("limit", function() {
      expect(r.limit()).to.equal(testcmds.success.COMMAND.LIMIT); //if not api would have it ignored
    });

    it("total", function() {
      expect(r.total()).to.equal(2);
    });

    it("pages", function() {
      expect(r.pages()).to.equal(1);
    });

    it("page", function() {
      expect(r.page()).to.equal(1);
    });

    it("prevpage", function() {
      expect(r.prevpage()).to.equal(1);
    });

    it("nextpage", function() {
      expect(r.nextpage()).to.equal(1);
    });

    it("nextpage [response with multiple pages]", function() {
      r = new Response(testcmds.multipage.RESPONSE, testcmds.multipage.COMMAND);
      expect(r.nextpage()).to.equal(2);
    });

  });

});
