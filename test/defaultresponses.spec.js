/* jshint -W024 */
/* jshint expr:true */
"use strict";

var expect = require('chai').expect;
var tpls = require('../defaultresponses.js');
var tplKeys = ['404', 'empty', 'error', 'expired'];

describe("defaultresponses.js", function() {
  describe("default response templates", function() {
    it("check the container structure", function() {
      expect(tpls).to.be.an('object');
    });
    it("check format of the default response templates in use", function() {
      tplKeys.forEach(function(key) {
        expect(tpls).to.have.property(key);
        expect(tpls[key]).to.be.an("string");
      });
    });
  });
});
