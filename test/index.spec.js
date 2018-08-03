'use strict'

const expect = require('chai').expect
const chai = require('chai')
const chaiPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const apiconnector = require('../dist/index')

chai.use(dirtyChai)
chai.use(chaiPromised)

describe('index file', function () {
  this.slow(1000)

  it('check access to APIClient class', function () {
    const cl = new apiconnector.APIClient()
    expect(cl).to.be.instanceOf(apiconnector.APIClient)
  })

  it('check access to Response class', function () {
    const cl = new apiconnector.Response('')
    expect(cl).to.be.instanceOf(apiconnector.Response)
  })

  it('check access to ResponseTemplateManager class', function () {
    const cl = apiconnector.ResponseTemplateManager.getInstance()
    expect(cl).to.be.instanceOf(apiconnector.ResponseTemplateManager)
  })
})
