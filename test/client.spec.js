/* jshint -W024 */
/* jshint expr:true */
"use strict";

var expect = require('chai').expect;
var apiconnector = require('../index.js');
var events = require('events');

describe("client.js", function() {
  this.timeout(250000);
  this.slow(1000);
  var client;
  describe("check general class structure", function() {
    it("check constructor", function() {
      expect(apiconnector).to.have.property('Client');
      expect(apiconnector.Request).to.be.an('function');
      client = apiconnector.Client;

      var req = new client();
      expect(req).to.be.instanceof(client);
      expect(req).to.be.instanceof(events.EventEmitter); //inheritance
    });

    var methods = ["command_encode", "getDefaultOptions"];
    methods.forEach(function(m) {
      it("check existance of non-prototype method '" + m + "'", function() {
        expect(client).to.have.property(m);
        expect(client[m]).to.be.an('function');
      });
    });

    methods = ["request", "login", "logout", "createConnection"];
    methods.forEach(function(m) {
      it("check existance of prototype method '" + m + "'", function() {
        expect(client.prototype).to.have.property(m);
        expect(client.prototype[m]).to.be.an('function');
      });
    });
  });

  describe("Client.command_encode", function() {
    it("test if stringifying JSON object and data encoding works basically", function() {
      var enc, validate;
      validate = "COMMAND=ModifyDomain\nAUTH=gwrgwqg%&\\44t3*\n";
      enc = client.command_encode({
        COMMAND: "ModifyDomain",
        AUTH: "gwrgwqg%&\\44t3*"
      });
      expect(enc).to.equal(validate);
      enc = client.command_encode("gregergege");
      expect(enc).to.be.a('string');
      expect(enc).to.be.empty;
    });
  });

  describe("Client.getDefaultOptions", function() {
    it("test if generating configuration defaults works", function() {
      var cfg = client.getDefaultOptions();
      expect(cfg).to.be.an('object');
      ['host', 'port', 'protocol', 'method', 'path'].forEach(function(key) {
        expect(cfg).to.have.property(key);
      });
      expect(cfg.protocol).to.equal('https:');
      expect(cfg.host).to.equal('coreapi.1api.net');
      expect(cfg.port).to.equal('443');
      expect(cfg.method).to.equal('POST');
      expect(cfg.path).to.equal('/api/call.cgi');
    });
    it("test if generating configuration default works for given uri", function() {
      var cfg = client.getDefaultOptions('http://coreapi.1api.net/api/call.cgi');
      expect(cfg).to.be.an('object');
      ['host', 'port', 'protocol', 'method', 'path'].forEach(function(key) {
        expect(cfg).to.have.property(key);
      });
      expect(cfg.protocol).to.equal('http:');
      expect(cfg.host).to.equal('coreapi.1api.net');
      expect(cfg.port).to.equal('80');
      expect(cfg.method).to.equal('POST');
      expect(cfg.path).to.equal('/api/call.cgi');
    });
  });

  var cl = new apiconnector.Client();
  var socketcfg;

  describe("Client.createConnection", function() {
    it("create a connection service", function() {
      var c = cl.createConnection({
        COMMAND: "StatusAccount"
      }, {
        params: {
          entity: '1234',
          session: '__iWillNeverExist__'
        },
        options: {
          method: 'POST',
          port: '443',
          protocol: 'https:',
          host: 'coreapi.1api.net',
          path: '/api/call.cgi',
          headers: {
            Expect: ''
          }
        }
      });
      expect(c).to.be.an('object');
      expect(c).to.be.instanceof(apiconnector.Request);
    });
  });

  describe("Client.login", function() {
    it("check if API login with not-accepted uri protocol throws Error", function(done) {
      var fn = function() {
        cl.login({
          entity: "1234", //OT&E system, use "54cd" for LIVE system
          login: "test.user", //your user id, here: the OT&E demo user
          pw: "test.passw0rd" //your user password
          //remoteaddr: provide it, if you have an ip address filter activated in your account for security reasons
        }, done, 'ftp://coreapi.1api.net/api/call/.cgi');
      };
      expect(fn).to.throw(Error);
      done();
    });
    it("perform an API login with demo credentials", function(done) {
      var fn = function() {
        cl.login({
          entity: "1234", //OT&E system, use "54cd" for LIVE system
          login: "test.user", //your user id, here: the OT&E demo user
          pw: "test.passw0rd" //your user password
          //remoteaddr: provide it, if you have an ip address filter activated in your account for security reasons
        }, function(r, sockcfg) {
          expect(r).to.be.an('object'); //maybe we can improve here with apiconnector.Response instance
          expect(r).to.have.property('CODE');
          if (r.CODE !== "200") {
            expect(parseInt(r.CODE), 10).to.be.within(200, 499);
            return;
          }
          expect(sockcfg).to.be.an('object');
          expect(sockcfg).to.have.property('options');
          expect(sockcfg).to.have.property('params');
          expect(sockcfg.params).to.have.property('session');
          expect(sockcfg.params).to.have.property('entity');
          expect(sockcfg.params).to.not.have.property('pw');
          expect(sockcfg.params).to.not.have.property('login');
          expect(sockcfg.params).to.not.have.property('user');
          socketcfg = sockcfg;
          done();
        });
      };
      expect(fn).to.not.throw(Error);
    });
  });

  describe("Client.request", function() {
    var uidxCB = function(r, done) {
      expect(r).to.be.an('object');
      expect(r).to.have.property('CODE');
      if (r.CODE === '200') {
        expect(r).to.have.property('PROPERTY');
        expect(r.PROPERTY).to.have.property('USERINDEX');
        expect(r.PROPERTY.USERINDEX).to.be.an('array');
        expect(r.PROPERTY.USERINDEX).to.have.lengthOf(1);
        expect(r.PROPERTY.USERINDEX[0]).to.equal('659');
      }
      done();
    };

    it("perform an API request [no callback provided]", function() {
      expect(socketcfg).to.be.an('object');
      cl.request({
        COMMAND: 'GetUserIndex'
      }, socketcfg);
    });

    it("perform an API request [no socket cfg provided]", function(done) {
      var cb = function(r) {
        expect(r).to.be.an('object');
        expect(r).to.have.property('CODE');
        expect(r.CODE).to.be.equal('530');
        expect(r.DESCRIPTION).to.be.equal('SESSION NOT FOUND');
        done();
      };
      cl.request({
        COMMAND: 'GetUserIndex'
      }, null, cb, cb, 'hash');
    });

    it("perform an API request [socket cfg w/o options and headers]", function(done) {
      expect(socketcfg).to.be.an('object');
      var cb = function(r) {
        uidxCB(r, done);
      };
      var newcfg = Object.assign({}, socketcfg);
      delete newcfg.options;
      cl.request({
        COMMAND: 'GetUserIndex'
      }, newcfg, cb, cb, 'hash');
    });

    it("perform an API request [socket cfg w/o expect header]", function(done) {
      expect(socketcfg).to.be.an('object');
      var newcfg = Object.assign({}, socketcfg);
      var cb = function(r) {
        uidxCB(r, done);
      };
      newcfg.options.headers = {};
      cl.request({
        COMMAND: 'GetUserIndex'
      }, newcfg, cb, cb, 'hash');
    });

    it("perform an API request [hash response]", function(done) {
      expect(socketcfg).to.be.an('object');
      var cb = function(r) {
        uidxCB(r, done);
      };
      cl.request({
        COMMAND: 'GetUserIndex'
      }, socketcfg, cb, cb, 'hash');
    });
    it("perform an API request [list response]", function(done) {
      var cb = function(r) {
        expect(r).to.be.an('object');
        expect(r).to.have.property('CODE');
        if (r.CODE === '200') {
          expect(r).to.have.property('LIST');
          expect(r.LIST).to.be.an('array');
          expect(r.LIST).to.have.lengthOf(2);
        }
        done();
      };
      cl.request({
        COMMAND: 'QueryDomainList',
        LIMIT: 2
      }, socketcfg, cb, cb, 'list');
    });
  });

  describe("Client.logout", function() {
    it("perform an API logout using previous session", function(done) {
      expect(socketcfg).to.be.an('object');
      cl.logout(socketcfg, function(r) {
        expect(r).to.be.an('object');
        expect(r).to.have.property('CODE');
        expect(r.CODE).to.equal('200');
        done();
      });
    });
  });
});
