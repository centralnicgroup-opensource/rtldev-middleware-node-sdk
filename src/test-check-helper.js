'use strict'

var expect = require('chai').expect
var Response = require('../dist/response.js')

var expectResponse = function (r, code, description) {
  expect(r).to.be.an('object')
  expect(r).to.be.an.instanceof(Response)
  if (code) { expect(r.code()).to.equal(code) }
  if (description) { expect(r.description()).to.equal(description) }
}

var expectPropertyFn = function (obj, key) {
  expect(obj).to.have.property(key)
  expect(obj[key]).to.be.a('function')
}

var expectResponseHash = function (r, code, description) {
  expect(r).to.be.an('object')
  expect(r).to.have.property('CODE')
  expect(r).to.have.property('DESCRIPTION')
  expect(r.CODE).to.be.a('string')
  expect(r.DESCRIPTION).to.be.a('string')
  if (code) { expect(r.CODE).to.equal(code) }
  if (description) { expect(r.DESCRIPTION).to.equal(description) }
}

var expectValidSocketConfig = function (cfg) {
  expect(cfg).to.be.an('object')
  expect(cfg).to.have.property('options')
  expect(cfg).to.have.property('params')
  expect(cfg.params).to.have.property('session')
  expect(cfg.params).to.have.property('entity')
  expect(cfg.params).to.not.have.property('pw')
  expect(cfg.params).to.not.have.property('login')
  expect(cfg.params).to.not.have.property('user')
}

module.exports = {
  expectPropertyFn: expectPropertyFn,
  expectResponseHash: expectResponseHash,
  expectResponse: expectResponse,
  expectValidSocketConfig: expectValidSocketConfig
}
