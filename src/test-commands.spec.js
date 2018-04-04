'use strict'

var expect = require('chai').expect
var tpls = require('./test-commands.js')

describe('test-commands.js', function () {
  describe('command response example templates', function () {
    it('check the container structure', function () {
      expect(tpls).to.be.an('object')
    })
    it('check format of the example templates in use', function () {
      ['querydomainlist', 'getuserindex'].forEach(function (tpl) {
        expect(tpls).to.have.property(tpl)
        var cfg = tpls[tpl]
        expect(cfg).to.be.an('object')
        switch (tpl) {
          case 'querydomainlist':
            ['error', 'success', 'tmperror', 'indexlength', 'multipage'].forEach(function (key) {
              expect(cfg).to.have.property(key)
              expect(cfg[key]).to.have.property('COMMAND')
              expect(cfg[key]).to.have.property('RESPONSE')
              expect(cfg[key].COMMAND).to.be.an('object')
              expect(cfg[key].RESPONSE).to.be.an('string')
            })
            break
          case 'getuserindex':
            expect(cfg).to.have.property('COMMAND')
            expect(cfg).to.have.property('RESPONSE')
            expect(cfg.COMMAND).to.be.an('object')
            expect(cfg.RESPONSE).to.be.an('object');
            ['error', 'success'].forEach(function (key) {
              expect(cfg.RESPONSE).to.have.property(key)
              expect(cfg.RESPONSE[key]).to.be.an('string')
            })
            break
        }
      })
    })
  })
})
