/* jshint -W024 */
/* jshint expr:true */
"use strict";

var expect = require('chai').expect;
var tpls = require('./test-commands.js');

describe("test-commands.js", function() {
  describe("command response example templates", function() {
    it("check the container structure", function() {
      expect(tpls).to.be.an('object');
    });
    it("check format of the example templates in use", function() {
      ['success', 'tmperror', 'error'].forEach(function(tpl){
        expect(tpls).to.have.property(tpl);
        var cfg = tpls[tpl];
        expect(cfg).to.be.an("object");
        expect(cfg).to.have.property("COMMAND");
        expect(cfg).to.have.property("RESPONSE");
        expect(cfg.COMMAND).to.be.an("object");
        expect(cfg.RESPONSE).to.be.an("string");
      });
    });
  });
});
