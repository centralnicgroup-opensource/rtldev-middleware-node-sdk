'use strict'

const expect = require('chai').expect
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const ResponseTemplate = require('../dist/responsetemplate').ResponseTemplate
const ResponseTemplateManager = require('../dist/responsetemplatemanager').ResponseTemplateManager
chai.use(dirtyChai)

let rtm

before(function () {
  rtm = ResponseTemplateManager.getInstance()
})

describe('ResponseTemplateManager class', function () {
  this.slow(1000)

  describe('#.getTemplate', function () {
    it('check return value [template not found]', function () {
      const tpl = rtm.getTemplate('IwontExist')
      expect(tpl.getCode()).to.equal(500)
      expect(tpl.getDescription()).to.equal('Response Template not found')
    })
  })

  describe('#.getTemplates', function () {
    it('check return value', function () {
      const defaultones = ['404', '500', 'error', 'httperror', 'empty', 'unauthorized', 'expired']
      expect(rtm.getTemplates()).to.include.all.keys(defaultones)
    })
  })

  describe('#.isTemplateMatchHash', function () {
    it('check return value [matched]', function () {
      const tpl = new ResponseTemplate('')
      expect(rtm.isTemplateMatchHash(tpl.getHash(), 'empty')).to.be.true()
    })
  })

  describe('#.isTemplateMatchPlain', function () {
    it('check return value [matched]', function () {
      const tpl = new ResponseTemplate('')
      expect(rtm.isTemplateMatchPlain(tpl.getPlain(), 'empty')).to.be.true()
    })
  })
})
