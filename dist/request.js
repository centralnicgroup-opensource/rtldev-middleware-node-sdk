'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const DEFAULT_SOCKET_TIMEMOUT = 300000
const events = require('events')
const clResponse = require('./response')
class Request extends events.EventEmitter {
  constructor (pcfg, pdata, pcommand) {
    super()
    this.socketcfg = Object.assign({}, pcfg)
    this.data = pdata
    this.cmd = Object.assign({}, pcommand)
  }
  requestCallback (res) {
    let response = ''
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      response += chunk
    })
    res.on('end', () => {
      this.emit('response', new clResponse.Response(response, this.cmd))
      response = ''
    })
  }
  request () {
    const req = require(this.socketcfg.protocol.replace(/:$/, '')).request(this.socketcfg, this.requestCallback)
    req.on('socket', (socket) => {
      socket.setTimeout(DEFAULT_SOCKET_TIMEMOUT, () => {
        req.abort()
      })
    })
    req.on('error', () => {
      this.emit('error', new clResponse.Response(clResponse.responses.error, this.cmd))
    })
    req.write(this.data)
    req.end()
  }
}
exports.Request = Request
// # sourceMappingURL=request.js.map
