'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const events = require('events')
const clRequest = require('./request')
const clResponse = require('./response')
class Client extends events.EventEmitter {
  request (p_cmd, p_cfg, p_cb, p_cberr, p_type = 'hash') {
    if (!/^(hash|list)$/.test(p_type)) {
      p_type = 'hash'
    }
    if (!p_cfg) {
      const r = new clResponse.Response(clResponse.responses.expired, p_cmd)
      p_cb(r[`as_${p_type}`]())
      return
    }
    var opts = p_cfg.options || exports.getDefaultOptions()
    if (!opts.headers) {
      opts.headers = {}
    }
    var c = this.createConnection(p_cmd, {
      options: opts,
      params: p_cfg.params
    })
    if (p_cb) {
      c.on('response', (r) => {
        p_cb(r[`as_${p_type}`]())
      })
    }
    if (p_cberr) {
      c.on('error', (r) => {
        p_cberr(r[`as_${p_type}`]())
      })
    } else {
      c.on('error', function () {
      })
    }
    c.request()
  }
  ;
  login (p_params, p_cb, p_uri = 'https://coreapi.1api.net/api/call.cgi', p_cmdparams) {
    if (!/^(http|https):\/\//.test(p_uri)) { throw new Error('Unsupported protocol within api connection uri.') }
    let cfg = {
      params: p_params,
      options: exports.getDefaultOptions(p_uri)
    }
    const cb = (r) => {
      if (r.CODE === '200') {
        delete cfg.params.pw
        delete cfg.params.login
        delete cfg.params.user
        cfg.params.session = r.PROPERTY.SESSION[0]
      }
      p_cb(r, cfg)
    }
    this.request(Object.assign({
      command: 'StartSession'
    }, p_cmdparams || {}), cfg, cb, cb)
  }
  ;
  logout (p_cfg, p_cb) {
    this.request({
      command: 'EndSession'
    }, p_cfg, p_cb, p_cb)
  }
  ;
  createConnection (p_cmd, p_cfg) {
    let data = ''
    Object.keys(p_cfg.params).forEach((key) => {
      data += encodeURIComponent('s_' + key)
      data += '=' + encodeURIComponent(p_cfg.params[key]) + '&'
    })
    data += encodeURIComponent('s_command')
    data += '=' + encodeURIComponent(exports.command_encode(p_cmd))
    return new clRequest.Request(p_cfg.options, data, p_cmd)
  }
  ;
}
exports.Client = Client

exports.command_encode = (p_cmd) => {
  let nullValueFound
  let tmp = ''
  if (!(typeof p_cmd === 'string' || p_cmd instanceof String)) {
    nullValueFound = false
    Object.keys(p_cmd).forEach((key) => {
      if (p_cmd[key] !== null || p_cmd[key] !== undefined) {
        tmp += key + '=' + p_cmd[key].toString().replace(/\r|\n/g, '') + '\n'
      } else {
        nullValueFound = true
      }
    })
    if (nullValueFound) {
      console.error('Command with null value in parameter.')
      console.error(p_cmd)
    }
  }
  return tmp
}
exports.getDefaultOptions = (p_uri = 'https://coreapi.1api.net/api/call.cgi') => {
  const tmp = require('url').parse(p_uri)
  return {
    method: 'POST',
    port: (tmp.port || (/^https/i.test(tmp.protocol) ? '443' : '80')),
    protocol: tmp.protocol,
    host: tmp.host.replace(/\:.+$/, ''),
    path: tmp.path
  }
}
// # sourceMappingURL=client.js.map
