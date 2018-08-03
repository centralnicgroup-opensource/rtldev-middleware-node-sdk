'use strict'

const expect = require('chai').expect
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const Column = require('../dist/column').Column
chai.use(dirtyChai)

let col

before(() => {
  col = new Column('DOMAIN', ['mydomain1.com', 'mydomain2.com', 'mydomain3.com'])
})

describe('Column class', function () {
  this.slow(1000)

  describe('#.getKey', function () {
    it('check return value', function () {
      expect(col.getKey()).to.equal('DOMAIN')
    })
  })
})
