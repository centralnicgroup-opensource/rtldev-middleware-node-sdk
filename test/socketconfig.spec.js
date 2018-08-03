'use strict'

const expect = require('chai').expect
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const SocketConfig = require('../dist/socketconfig').SocketConfig
chai.use(dirtyChai)

describe('SocketConfig class', function () {
  this.slow(1000)

  describe('#.getPOSTData', function () {
    it('check return value [no settings made]', function () {
      const d = new SocketConfig().getPOSTData()
      expect(d).to.be.empty()
    })
  })
})
