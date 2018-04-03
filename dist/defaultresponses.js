'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.responses = {
  '404': '[RESPONSE]\r\ncode=421\r\ndescription=Page not found\r\nEOF\r\n',
  '500': '[RESPONSE]\r\ncode=500\r\ndescription=Internal server error\r\nEOF\r\n',
  empty: '[RESPONSE]\r\ncode=423\r\ndescription=Empty API response\r\nTRANSLATIONKEY=FAPI.424\r\nEOF\r\n',
  error: '[RESPONSE]\r\ncode=421\r\ndescription=Command failed due to server error. Client should try again\r\nEOF\r\n',
  expired: '[RESPONSE]\r\ncode=530\r\ndescription=SESSION NOT FOUND\r\nTRANSLATIONKEY=FAPI.530\r\nEOF\r\n',
  unauthorized: '[RESPONSE]\r\ncode=530\r\ndescription=Unauthorized\r\nTRANSLATIONKEY=FAPI.530.UNAUTHORIZED\r\nEOF\r\n'
}
// # sourceMappingURL=defaultresponses.js.map
