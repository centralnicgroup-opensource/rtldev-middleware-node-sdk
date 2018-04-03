'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const DEFAULT_SOCKET_TIMEMOUT = 300000
const events = require('events')
const clResponse = require('./response')
class Request extends events.EventEmitter {
  constructor (p_cfg, p_data, p_command) {
    super()
    this.socketcfg = Object.assign({}, p_cfg)
    this.data = p_data
    this.cmd = Object.assign({}, p_command)
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
  ;
  request () {
    let req = require(this.socketcfg.protocol.replace(/\:$/, '')).request(this.socketcfg, this.requestCallback)
    req.on('socket', (socket) => {
      socket.setTimeout(DEFAULT_SOCKET_TIMEMOUT, () => {
        req.abort()
      })
    })
    req.on('error', () => {
      this.emit('error', new Response(clResponse.responses.error, this.cmd))
    })
    req.write(this.data)
    req.end()
  }
}
exports.Request = Request

// # sourceMappingURL=request.js.map
