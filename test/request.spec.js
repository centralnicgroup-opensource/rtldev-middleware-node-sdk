/* jshint -W024 */
/* jshint expr:true */
"use strict";

var expect = require('chai').expect;
var apiconnector = require('../index.js');
var events = require('events');

describe("request.js", function() {
  this.timeout(250000);
  this.slow(1000);
  var request;
  describe("check general class structure", function() {
    it("check constructor", function() {
      expect(apiconnector).to.have.property('Request');
      expect(apiconnector.Request).to.be.an('function');
      request = apiconnector.Request;

      var req = new request();
      expect(req).to.be.instanceof(request);
      expect(req).to.be.instanceof(events.EventEmitter); //inheritance
    });

    var methods = ["request"];
    methods.forEach(function(m) {
      it("check existance of prototype method '" + m + "'", function() {
        expect(request.prototype).to.have.property(m);
        expect(request.prototype[m]).to.be.an('function');
      });
    });
  });

  describe("perform test request", function() {
    it("check successful communication based on OT&E system", function(done) {
      var c = new request({
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
        expect(r).to.be.an('object');
        expect(r).to.be.instanceof(apiconnector.Response);
        expect(r.code()).to.equal('530');
        expect(r.description()).to.equal('Authentication failed; SESSION NOT FOUND');
        done();
      });
      c.on("error", function(r) {
        expect(r).to.be.an('object');
        expect(r).to.be.instanceof(apiconnector.Response);
        done();
      });
      c.request();
    });
  });
});
