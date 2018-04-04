'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const defresponses = require('./defaultresponses')
const it = require('./iterator')
exports.responses = defresponses.responses
exports.pagerRegexp = /^(TOTAL|FIRST|LAST|LIMIT|COUNT)$/
class Response {
  constructor (pr, pcommand) {
    this.colregexp = /\*/
    pr = ((!pr || pr === '') ? exports.responses.empty : pr)
    this.usecolregexp = false
    this.data = {
      parsed: this.parse(pr),
      unparsed: pr
    }
    this.cmd = Object.assign({}, pcommand)
    this.it = new it.ResponseIterator(this.asList().LIST || [])
  }
  useColumns (arr) {
    this.usecolregexp = false
    if (arr) {
      if (Array.isArray(arr)) {
        this.usecolregexp = true
        this.colregexp = new RegExp('^(' + arr.join('|') + ')$', 'i')
      } else if (arr !== '*') {
        this.usecolregexp = true
        this.colregexp = new RegExp('^' + arr + '$', 'i')
      }
    }
  }
  rewind () {
    return this.it.rewind()
  }
  hasNext () {
    return this.it.hasNext()
  }
  next () {
    return this.it.next()
  }
  hasPrevious () {
    return this.it.hasPrevious()
  }
  previous () {
    return this.it.previous()
  }
  current () {
    return this.it.current()
  }
  get (pprop) {
    if (this.data.parsed.hasOwnProperty(pprop)) {
      return this.data.parsed[pprop]
    }
    return null
  }
  getColumn (pprop) {
    const p = this.data.parsed.PROPERTY
    if (p && p.hasOwnProperty(pprop)) {
      return p[pprop]
    }
    return false
  }
  getColumnIndex (pprop, pidx, pcastint) {
    const col = this.getColumn(pprop)
    if (col && col[pidx]) {
      return (pcastint ? parseInt(col[pidx], 10) : col[pidx])
    }
    return false
  }
  applyCustomChanges (r) {
    return r
  }
  asString () {
    if (this.usecolregexp) {
      return this.serialize(this.asHash())
    }
    return this.data.unparsed
  }
  asHash () {
    let d
    if (this.usecolregexp) {
      d = Object.assign({}, this.data.parsed)
      Object.keys(d.PROPERTY).forEach((key) => {
        if (!this.colregexp.test(key)) {
          delete d.PROPERTY[key]
        }
      })
    } else {
      d = this.data.parsed
    }
    return this.applyCustomChanges(d)
  }
  asList () {
    let row2
    let i
    let count = 0
    let keys
    const r = this.asHash()
    const tmp = {}
    Object.keys(r).forEach((key) => {
      if (key !== 'PROPERTY') {
        tmp[key] = r[key]
      }
    })
    if (r.CODE === '200') {
      tmp.LIST = []
      if (r.PROPERTY) {
        keys = Object.keys(r.PROPERTY).filter((key) => {
          return !exports.pagerRegexp.test(key)
        })
        keys.forEach((key) => {
          if (r.PROPERTY[key].length > count) {
            count = r.PROPERTY[key].length
          }
        })
        for (i = 0; i < count; i++) {
          row2 = {}
          keys.forEach((key) => {
            if (r.PROPERTY[key][i] !== undefined) {
              row2[key] = r.PROPERTY[key][i]
            }
          })
          tmp.LIST.push(Object.assign({}, row2))
        }
      }
      tmp.meta = {
        columns: this.columns(),
        pg: this.getPagination()
      }
    }
    return tmp
  }
  code () {
    return this.get('CODE')
  }
  description () {
    return this.get('DESCRIPTION')
  }
  properties () {
    return this.get('PROPERTY')
  }
  runtime () {
    const rt = this.get('RUNTIME')
    return rt ? parseFloat(rt) : null
  }
  queuetime () {
    const qt = this.get('QUEUETIME')
    return qt ? parseFloat(qt) : null
  }
  isSuccess () {
    const code = this.get('CODE')
    return (code ? code.charAt(0) === '2' : false)
  }
  isTmpError () {
    const code = this.get('CODE')
    return (code ? code.charAt(0) === '4' : false)
  }
  isError () {
    return !(this.isSuccess() || this.isTmpError())
  }
  columns () {
    const props = this.properties()
    if (props) {
      return Object.keys(props).filter((key) => {
        return !exports.pagerRegexp.test(key)
      })
    }
    return []
  }
  getPagination () {
    return {
      COUNT: this.count(),
      FIRST: this.first(),
      LAST: this.last(),
      LIMIT: this.limit(),
      PAGE: this.page(),
      PAGENEXT: this.nextpage(),
      PAGEPREV: this.prevpage(),
      PAGES: this.pages(),
      TOTAL: this.total()
    }
  }
  first () {
    return (this.getColumnIndex('FIRST', 0, true) || 0)
  }
  count () {
    let c = this.getColumnIndex('COUNT', 0, true)
    let cols
    let i
    let max = 0
    if (c === false) {
      c = 0
      cols = this.columns()
      for (i = 0; i < cols.length; i++) {
        c = this.getColumn(cols[i]).length
        if (c > max) {
          max = c
        }
      }
      c = max
    }
    return c
  }
  last () {
    return (this.getColumnIndex('LAST', 0, true) || this.count() - 1)
  }
  limit () {
    return (this.getColumnIndex('LIMIT', 0, true) || this.count())
  }
  total () {
    return (this.getColumnIndex('TOTAL', 0, true) || this.count())
  }
  pages () {
    const t = this.total()
    if (t) {
      return Math.ceil(t / this.limit())
    }
    return 1
  }
  page () {
    if (this.count()) {
      return Math.floor(this.first() / this.limit()) + 1
    }
    return 1
  }
  prevpage () {
    return ((this.page() - 1) || 1)
  }
  nextpage () {
    const page = this.page() + 1
    const pages = this.pages()
    return (page <= pages ? page : pages)
  }
  parse (r) {
    let m
    let mm
    const hash = {}
    const regexp = /^([^=]*[^\t= ])[\t ]*=[\t ]*(.*)$/
    r = r.replace(/\r\n/g, '\n').split('\n')
    while (r.length) {
      m = (r.shift()).match(regexp)
      if (m) {
        mm = m[1].match(/^property\[([^\]]*)\]/i)
        if (mm) {
          if (!hash.hasOwnProperty('PROPERTY')) {
            hash.PROPERTY = {}
          }
          mm[1] = mm[1].toUpperCase().replace(/\s/g, '')
          if (!hash.PROPERTY.hasOwnProperty(mm[1])) {
            hash.PROPERTY[mm[1]] = []
          }
          hash.PROPERTY[mm[1]].push(m[2].replace(/[\t ]*$/, ''))
        } else {
          hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, '')
        }
      }
    }
    if (!hash.hasOwnProperty('DESCRIPTION')) {
      hash.DESCRIPTION = ''
    }
    return hash
  }
  serialize (pr) {
    const r = Object.assign({}, pr)
    let plain = '[RESPONSE]'
    if (r.hasOwnProperty('PROPERTY')) {
      Object.keys(r.PROPERTY).forEach((key) => {
        r.PROPERTY[key].forEach((val, index) => {
          plain += '\r\nPROPERTY[' + key + '][' + index + ']=' + val
        })
      })
    }
    if (r.hasOwnProperty('CODE')) {
      plain += '\r\ncode=' + r.CODE
    }
    if (r.hasOwnProperty('DESCRIPTION')) {
      plain += '\r\ndescription=' + r.DESCRIPTION
    }
    if (r.hasOwnProperty('QUEUETIME')) {
      plain += '\r\nqueuetime=' + r.QUEUETIME
    }
    if (r.hasOwnProperty('RUNTIME')) {
      plain += '\r\nruntime=' + r.RUNTIME
    }
    plain += '\r\nEOF\r\n'
    return plain
  }
  getTemplates () {
    return exports.responses
  }
  getTemplate (ptplid, pparse) {
    if (exports.responses[ptplid]) {
      if (pparse) {
        return this.parse(exports.responses[ptplid])
      } else {
        return exports.responses[ptplid]
      }
    }
    return false
  }
  isTemplateMatch (pr, ptplid) {
    const tpl = this.getTemplate(ptplid, true)
    return (tpl &&
            pr.CODE === tpl.CODE &&
            pr.DESCRIPTION === tpl.DESCRIPTION)
  }
}
exports.Response = Response
// # sourceMappingURL=response.js.map
