/* jshint -W024 */
/* jshint expr:true */
'use strict'

var apiconnector = require('./index.js')
var expectPropertyFn = require('./test-check-helper.js').expectPropertyFn

describe('response.js', function () {
  describe('check general class structure', function () {
    ['Response', 'Request', 'Client'].forEach(function (key) {
      it('check constructor "' + key + '"', function () {
        expectPropertyFn(apiconnector, key)
      })
    })
  })
})
