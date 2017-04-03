/* jshint -W024 */
/* jshint expr:true */
"use strict";

var expect = require('chai').expect;
var Request = require('./request.js');
var Response = require('./response.js');
var events = require('events');
var nock = require('nock');
var chkHlp = require('./test-check-helper.js');
var expectPropertyFn = chkHlp.expectPropertyFn;
var expectResponse = chkHlp.expectResponse;

describe("request.js", function() {
  this.timeout(250000);
  this.slow(1000);

  after(function(){
    nock.cleanAll();
  });

  describe("check general class structure", function() {
    it("check constructor", function() {
      expect(Request).to.be.an('function');
      var req = new Request();
      expect(req).to.be.instanceof(Request);
      expect(req).to.be.instanceof(events.EventEmitter); //inheritance
    });

    ["request"].forEach(function(m) {
      it("check existance of prototype method '" + m + "'", function() {
        expectPropertyFn(Request.prototype, m);
      });
    });
  });

  describe("perform test request", function() {
    it("check successful communication based on OT&E system", function(done) {
      var c = new Request({
          method: 'POST',
          protocol: 'http:',
          host: 'coreapi.1api.net',
          path: '/api/call.cgi'
        },
        's_entity=1234&s_session=__iWillNeverExist__&command=EndSession', {
          COMMAND: "EndSession"
        }
      );
      c.on("response", function(r) {
        expectResponse(r, '530', 'Authentication failed; SESSION NOT FOUND');
        done();
      });
      c.on("error", function(r) {
        expectResponse(r);
        done();
      });
      c.request();
    });

    it("check connection error [connection timeout]", function(done) {
      nock('http://coreapi.1api.net')
        .post('/api/call.cgi')
        .socketDelay(300000) //300s; API timeout is 250s
        .reply(200, Response.responses.expired);
      //note: even though timeout is defined, app comes directly backorder
      //but as requested: as a timeout! great!
      var c = new Request({
          method: 'POST',
          protocol: 'http:',
          host: 'coreapi.1api.net',
          path: '/api/call.cgi'
        },
        's_entity=1234&s_session=__iWillNeverExist__&command=EndSession', {
          COMMAND: "EndSession"
        }
      );
      c.on("error", function(r) {
        expectResponse(r, '421', 'Command failed due to server error. Client should try again');
        done();
      });
      c.request();
    });

    it("check connection error [connection error]", function(done) {
      nock('http://coreapi.1api.net')
        .post('/api/call.cgi')
        .replyWithError('Internal Server Error');
      var c = new Request({
          method: 'POST',
          protocol: 'http:',
          host: 'coreapi.1api.net',
          path: '/api/call.cgi'
        },
        's_entity=1234&s_session=__iWillNeverExist__&command=EndSession', {
          COMMAND: "EndSession"
        }
      );
      c.on("error", function(r) {
        expectResponse(r, '421', 'Command failed due to server error. Client should try again');
        done();
      });
      c.request();
    });

  });
});
