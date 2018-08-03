'use strict'

const expect = require('chai').expect
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const ResponseTemplate = require('../dist/responsetemplate').ResponseTemplate
chai.use(dirtyChai)

describe('ResponseTemplate class', function () {
  this.slow(1000)

  describe('#.constructor', function () {
    it('check instance [raw empty string]', function () {
      const tpl = new ResponseTemplate('')
      expect(tpl.getCode()).to.equal(423)
      expect(tpl.getDescription()).to.equal('Empty API response')
    })
  })

  describe('#.getHash', function () {
    it('check return value', function () {
      const h = new ResponseTemplate('').getHash()
      expect(h.CODE).to.equal('423')
      expect(h.DESCRIPTION).to.equal('Empty API response')
    })
  })

  describe('#.getQueuetime', function () {
    it('check return value [n/a in API response]', function () {
      const tpl = new ResponseTemplate('')
      expect(tpl.getQueuetime()).to.equal(0)
    })

    it('check return value [in API response]', function () {
      const tpl = new ResponseTemplate('[RESPONSE]\r\ncode=423\r\ndescription=Empty API response\r\nqueuetime=0\r\nEOF\r\n')
      expect(tpl.getQueuetime()).to.equal(0)
    })
  })

  describe('#.getRuntime', function () {
    it('check return value [n/a in API response]', function () {
      const tpl = new ResponseTemplate('')
      expect(tpl.getRuntime()).to.equal(0)
    })

    it('check return value [in API response]', function () {
      const tpl = new ResponseTemplate('[RESPONSE]\r\ncode=423\r\ndescription=Empty API response\r\nruntime=0.12\r\nEOF\r\n')
      expect(tpl.getRuntime()).to.equal(0.12)
    })
  })
})
