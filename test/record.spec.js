'use strict'

const expect = require('chai').expect
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const Record = require('../dist/record').Record
chai.use(dirtyChai)

let rec
const data = {
  DOMAIN: 'mydomain.com',
  RATING: '1',
  RNDINT: '321',
  SUM: '1'
}

before(() => {
  rec = new Record(data)
})

describe('Record class', function () {
  this.slow(1000)

  describe('#.getData', function () {
    it('check return value', function () {
      expect(rec.getData()).to.equal(data)
    })
  })

  describe('#.getDataByKey', function () {
    it('check return value [column key not found]', function () {
      expect(rec.getDataByKey('KEYNOTEXISTING')).to.be.null()
    })
  })
})
