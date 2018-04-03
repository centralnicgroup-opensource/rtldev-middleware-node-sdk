'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const events = require('events')
const clRequest = require('./request')
const clResponse = require('./response')
class Client extends events.EventEmitter {
  request (pcmd, pcfg, pcb, pcberr, ptype = 'hash') {
    if (!/^(hash|list)$/.test(ptype)) {
      ptype = 'hash'
    }
    if (!pcfg) {
      const r = new clResponse.Response(clResponse.responses.expired, pcmd)
      pcb(r[`as_${ptype}`]())
      return
    }
    var opts = pcfg.options || exports.getDefaultOptions()
    if (!opts.headers) {
      opts.headers = {}
    }
    var c = this.createConnection(pcmd, {
      options: opts,
      params: pcfg.params
    })
    if (pcb) {
      c.on('response', (r) => {
        pcb(r[`as_${ptype}`]())
      })
    }
    if (pcberr) {
      c.on('error', (r) => {
        pcberr(r[`as_${ptype}`]())
      })
    } else {
      c.on('error', function () {
      })
    }
    c.request()
  }
  ;
  login (pparams, pcb, puri = 'https://coreapi.1api.net/api/call.cgi', pcmdparams) {
    if (!/^(http|https):\/\//.test(puri)) { throw new Error('Unsupported protocol within api connection uri.') }
    let cfg = {
      params: pparams,
      options: exports.getDefaultOptions(puri)
    }
    const cb = (r) => {
      if (r.CODE === '200') {
        delete cfg.params.pw
        delete cfg.params.login
        delete cfg.params.user
        cfg.params.session = r.PROPERTY.SESSION[0]
      }
      pcb(r, cfg)
    }
    this.request(Object.assign({
      command: 'StartSession'
    }, pcmdparams || {}), cfg, cb, cb)
  }
  ;
  logout (pcfg, pcb) {
    this.request({
      command: 'EndSession'
    }, pcfg, pcb, pcb)
  }
  ;
  createConnection (pcmd, pcfg) {
    let data = ''
    Object.keys(pcfg.params).forEach((key) => {
      data += encodeURIComponent('s_' + key)
      data += '=' + encodeURIComponent(pcfg.params[key]) + '&'
    })
    data += encodeURIComponent('s_command')
    data += '=' + encodeURIComponent(exports.command_encode(pcmd))
    return new clRequest.Request(pcfg.options, data, pcmd)
  }
  ;
}
exports.Client = Client

exports.command_encode = (pcmd) => {
  let nullValueFound
  let tmp = ''
  if (!(typeof pcmd === 'string' || pcmd instanceof String)) {
    nullValueFound = false
    Object.keys(pcmd).forEach((key) => {
      if (pcmd[key] !== null || pcmd[key] !== undefined) {
        tmp += key + '=' + pcmd[key].toString().replace(/\r|\n/g, '') + '\n'
      } else {
        nullValueFound = true
      }
    })
    if (nullValueFound) {
      console.error('Command with null value in parameter.')
      console.error(pcmd)
    }
  }
  return tmp
}
exports.getDefaultOptions = (puri = 'https://coreapi.1api.net/api/call.cgi') => {
  const tmp = require('url').parse(puri)
  return {
    method: 'POST',
    port: (tmp.port || (/^https/i.test(tmp.protocol) ? '443' : '80')),
    protocol: tmp.protocol,
    host: tmp.host.replace(/:.+$/, ''),
    path: tmp.path
  }
}
// # sourceMappingURL=client.js.map
