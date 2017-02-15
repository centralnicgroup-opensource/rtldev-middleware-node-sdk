/* jshint -W024 */
/* jshint expr:true */
"use strict";

var testcmds = require('./test-commands.js');
var expect = require('chai').expect;
var events = require('events');
var apiconnector = require('../index.js');
var nock = require('nock');
var Request = apiconnector.Request;
var Response = apiconnector.Response;
var Client = apiconnector.Client;
var chkHlp = require('./check-helper.js');
var expectPropertyFn = chkHlp.expectPropertyFn;
var expectResponseHash = chkHlp.expectResponseHash;
var expectValidSocketConfig = chkHlp.expectValidSocketConfig;

after(function() {
  nock.cleanAll();
});

describe("client.js", function() {
  this.timeout(250000);
  this.slow(1000);

  describe("check general class structure", function() {
    it("check constructor", function() {
      var req = new Client();
      expect(req).to.be.instanceof(Client);
      expect(req).to.be.instanceof(events.EventEmitter); //inheritance
    });

    var methods = ["command_encode", "getDefaultOptions"];
    methods.forEach(function(m) {
      it("check existance of non-prototype method '" + m + "'", function() {
        expectPropertyFn(Client, m);
      });
    });

    methods = ["request", "login", "logout", "createConnection"];
    methods.forEach(function(m) {
      it("check existance of prototype method '" + m + "'", function() {
        expectPropertyFn(Client.prototype, m);
      });
    });
  });

  describe("Client.command_encode", function() {
    it("test if stringifying JSON object and data encoding works basically", function() {
      var enc, validate;
      validate = "COMMAND=ModifyDomain\nAUTH=gwrgwqg%&\\44t3*\n";
      enc = Client.command_encode({
        COMMAND: "ModifyDomain",
        AUTH: "gwrgwqg%&\\44t3*"
      });
      expect(enc).to.equal(validate);
      enc = Client.command_encode("gregergege");
      expect(enc).to.equal('');
    });
  });

  describe("Client.getDefaultOptions", function() {
    it("test if generating socket configuration defaults works", function() {
      var cfg = Client.getDefaultOptions();
      expect(cfg).to.be.an('object');
      expect(cfg.protocol).to.equal('https:');
      expect(cfg.host).to.equal('coreapi.1api.net');
      expect(cfg.port).to.equal('443');
      expect(cfg.method).to.equal('POST');
      expect(cfg.path).to.equal('/api/call.cgi');
    });

    it("test if generating configuration default works for given uri", function() {
      var cfg = Client.getDefaultOptions('http://coreapi.1api.net/api/call.cgi');
      expect(cfg).to.be.an('object');
      expect(cfg.protocol).to.equal('http:');
      expect(cfg.host).to.equal('coreapi.1api.net');
      expect(cfg.port).to.equal('80');
      expect(cfg.method).to.equal('POST');
      expect(cfg.path).to.equal('/api/call.cgi');
    });
  });

  var cl = new Client();
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
      expect(c).to.be.instanceof(Request);
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
        }, null, 'ftp://coreapi.1api.net/api/call.cgi');
      };
      expect(fn).to.throw(Error);
      done();
    });

    it("perform an API login with invalid credentials", function(done) {
      var fn = function() {
        nock('http://coreapi.1api.net')
          .post('/api/call.cgi')
          .reply(200, "[RESPONSE]\r\ncode=530\r\ndescription=Authentication failed\r\nqueuetime=0\r\nruntime=0.001\r\nEOF\r\n");

        cl.login({
          entity: "1234", //OT&E system, use "54cd" for LIVE system
          login: "test.user.donotexists", //your user id, here: the OT&E demo user
          pw: "####" //your user password
          //remoteaddr: provide it, if you have an ip address filter activated in your account for security reasons
        }, function(r) {
          nock.restore();
          expectResponseHash(r, '530', 'Authentication failed'); //maybe we can improve here with apiconnector.Response instance
          done();
        }, 'http://coreapi.1api.net/api/call.cgi');
      };
      expect(fn).to.not.throw(Error);
    });

    it("perform an API login with demo credentials", function(done) {
      var fn = function() {
        cl.login({
          entity: "1234", //OT&E system, use "54cd" for LIVE system
          login: "test.user", //your user id, here: the OT&E demo user
          pw: "test.passw0rd" //your user password
          //remoteaddr: provide it, if you have an ip address filter activated in your account for security reasons
        }, function(r, sockcfg) {
          socketcfg = sockcfg;
          expectResponseHash(r); //maybe we can improve here with apiconnector.Response instance
          if (r.CODE !== "200") {
            expect(parseInt(r.CODE, 10)).to.be.within(200, 499);
            done();
            return;
          }
          done();
        });
      };
      expect(fn).to.not.throw(Error);
    });
  });

  describe("Client.request", function() {

    beforeEach(function() {
      expectValidSocketConfig(socketcfg);
    });

    afterEach(function() {
      nock.restore();
    });

    var uidxCB = function(r, done) {
      expectResponseHash(r);
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
      nock('https://coreapi.1api.net')
        .post('/api/call.cgi')
        .reply(200, testcmds.getuserindex.RESPONSE.success);
      cl.request(testcmds.getuserindex.COMMAND, socketcfg);
    });

    it("perform an API request [no socket cfg provided]", function(done) {
      //no connection will be established!
      var cb = function(r) {
        expectResponseHash(r, '530', 'SESSION NOT FOUND');
        done();
      };
      cl.request(testcmds.getuserindex.COMMAND, null, cb, cb, 'hash');
    });

    it("perform an API request [socket cfg w/o options and headers]", function(done) {
      nock.activate(); //reuse setting from 2 test before
      var cb = function(r) {
        uidxCB(r, done);
      };
      var newcfg = JSON.parse(JSON.stringify(socketcfg));
      delete newcfg.options;
      cl.request(testcmds.getuserindex.COMMAND, newcfg, cb, cb, 'hash');
    });

    it("perform an API request [socket cfg w/o expect header]", function(done) {
      nock.activate(); //reuse setting from last test
      var newcfg = JSON.parse(JSON.stringify(socketcfg));
      var cb = function(r) {
        uidxCB(r, done);
      };
      newcfg.options.headers = {};
      cl.request(testcmds.getuserindex.COMMAND, newcfg, cb, cb, 'hash');
    });

    it("perform an API request [hash response]", function(done) {
      nock.cleanAll();
      //NOTE: here we perform a real API request for test purpose
      var cb = function(r) {
        uidxCB(r, done);
      };
      cl.request(testcmds.getuserindex.COMMAND, socketcfg, cb, cb, 'hash');
    });

    it("perform an API request [list response]", function(done) {
      //here we fake again to save test runtime
      nock('https://coreapi.1api.net')
        .post('/api/call.cgi')
        .reply(200, testcmds.querydomainlist.success.RESPONSE);
      var cb = function(r) {
        expectResponseHash(r);
        if (r.CODE === '200') {
          expect(r).to.have.property('LIST');
          expect(r.LIST).to.be.an('array');
          expect(r.LIST).to.have.lengthOf(2);
        }
        done();
      };
      cl.request(testcmds.querydomainlist.success.COMMAND, socketcfg, cb, cb, 'list');
    });

    it("perform an API request [connection error]", function(done) {
      //cannot nock connection error as nock is not on the network layer
      var cfg = JSON.parse(JSON.stringify(socketcfg));
      cfg.options.port = '8123';
      cfg.options.protocol = 'http:';
      cfg.options.host = 'gregergegegegerwrgwe.com';
      var cb = function(r) {
        var rv = Response.parse(Response.responses.error);
        expectResponseHash(rv);
        expectResponseHash(r, rv.CODE);
        done();
      };
      cl.request(testcmds.getuserindex.COMMAND, cfg, cb, cb, 'hash');
      //perform it again without callback for code coverage
      //that's basically ok, as someone might really just want to do an API
      //request without caring about the api response
      cl.request(testcmds.getuserindex.COMMAND, cfg);
    });
  });

  describe("Client.logout", function() {
    it("perform an API logout using previous session", function(done) {
      cl.logout(socketcfg, function(r) {
        socketcfg = null; //logged out
        expectResponseHash(r, '200'); //maybe better Response instance here
        //now try to logout again
        //that's basically happening in case a customer opens the logout url
        //even though he is not logged in
        cl.logout(socketcfg, function(r) {
          expectResponseHash(r, '530');
          done();
        });
      });
    });
  });
});
