'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const defresponses = require('./defaultresponses')
exports.responses = defresponses.responses
exports.pagerRegexp = /^(TOTAL|FIRST|LAST|LIMIT|COUNT)$/
class ResponseIterator {
  constructor (rows) {
    this.index = 0
    this.rows = rows
  }
  hasPrevious () {
    return (this.index > 0)
  }
  previous () {
    return (this.hasPrevious() ? this.rows[--this.index] : null)
  }
  next () {
    return (this.hasNext() ? this.rows[++this.index] : null)
  }
  hasNext () {
    return (this.index < (this.rows.length - 1))
  }
  rewind () {
    this.index = 0
    return this.current()
  }
  current () {
    return this.rows[this.index]
  }
}
exports.ResponseIterator = ResponseIterator

class Response {
  constructor (p_r, p_command) {
    this.colregexp = /\*/
    p_r = ((!p_r || p_r === '') ? exports.responses.empty : p_r)
    this.usecolregexp = false
    this.data = {
      unparsed: p_r,
      parsed: exports.parse(p_r)
    }
    this.cmd = Object.assign({}, p_command)
    this.it = new ResponseIterator(this.as_list().LIST || [])
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
  ;
  rewind () {
    return this.it.rewind()
  }
  ;
  hasNext () {
    return this.it.hasNext()
  }
  ;
  next () {
    return this.it.next()
  }
  ;
  hasPrevious () {
    return this.it.hasPrevious()
  }
  ;
  previous () {
    return this.it.previous()
  }
  ;
  current () {
    return this.it.current()
  }
  ;
  get (p_prop) {
    if (this.data.parsed.hasOwnProperty(p_prop)) { return this.data.parsed[p_prop] }
    return null
  }
  ;
  getColumn (p_prop) {
    var p = this.data.parsed.PROPERTY
    if (p && p.hasOwnProperty(p_prop)) {
      return p[p_prop]
    }
    return false
  }
  ;
  getColumnIndex (p_prop, p_idx, p_cast_int) {
    const col = this.getColumn(p_prop)
    if (col && col[p_idx]) {
      return (p_cast_int ? parseInt(col[p_idx], 10) : col[p_idx])
    }
    return false
  }
  ;
  applyCustomChanges (r) {
    return r
  }
  ;
  as_string () {
    if (this.usecolregexp) {
      return exports.serialize(this.as_hash())
    }
    return this.data.unparsed
  }
  ;
  as_hash () {
    let d
    if (this.usecolregexp) {
      d = Object.assign({}, this.data.parsed)
      Object.keys(d.PROPERTY).forEach((key) => {
        if (!this.colregexp.test(key)) { delete d.PROPERTY[key] }
      })
    } else { d = this.data.parsed }
    return this.applyCustomChanges(d)
  }
  ;
  as_list () {
    let row2
    let i
    let count = 0
    let keys
    const r = this.as_hash()
    const tmp = {}
    Object.keys(r).forEach((key) => {
      if (key !== 'PROPERTY') { tmp[key] = r[key] }
    })
    if (r.CODE === '200') {
      tmp.LIST = []
      if (r.PROPERTY) {
        keys = Object.keys(r.PROPERTY).filter((key) => {
          return !exports.pagerRegexp.test(key)
        })
        keys.forEach((key) => {
          if (r.PROPERTY[key].length > count) { count = r.PROPERTY[key].length }
        })
        for (i = 0; i < count; i++) {
          row2 = {}
          keys.forEach((key) => {
            if (r.PROPERTY[key][i] !== undefined) { row2[key] = r.PROPERTY[key][i] }
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
  ;
  code () {
    return this.get('CODE')
  }
  ;
  description () {
    return this.get('DESCRIPTION')
  }
  ;
  properties () {
    return this.get('PROPERTY')
  }
  ;
  runtime () {
    const rt = this.get('RUNTIME')
    return rt ? parseFloat(rt) : null
  }
  ;
  queuetime () {
    const qt = this.get('QUEUETIME')
    return qt ? parseFloat(qt) : null
  }
  ;
  is_success () {
    const code = this.get('CODE')
    return (code ? code.charAt(0) === '2' : false)
  }
  ;
  is_tmp_error () {
    const code = this.get('CODE')
    return (code ? code.charAt(0) === '4' : false)
  }
  ;
  is_error () {
    return !(this.is_success() || this.is_tmp_error())
  }
  ;
  columns () {
    const props = this.properties()
    if (props) {
      return Object.keys(props).filter((key) => {
        return !exports.pagerRegexp.test(key)
      })
    }
    return []
  }
  ;
  getPagination () {
    return {
      FIRST: this.first(),
      LAST: this.last(),
      COUNT: this.count(),
      TOTAL: this.total(),
      LIMIT: this.limit(),
      PAGES: this.pages(),
      PAGE: this.page(),
      PAGENEXT: this.nextpage(),
      PAGEPREV: this.prevpage()
    }
  }
  ;
  first () {
    return (this.getColumnIndex('FIRST', 0, true) || 0)
  }
  ;
  count () {
    let c = this.getColumnIndex('COUNT', 0, true)
    let cols, i, max = 0
    if (c === false) {
      c = 0
      cols = this.columns()
      for (i = 0; i < cols.length; i++) {
        c = this.getColumn(cols[i]).length
        if (c > max) { max = c }
      }
      c = max
    }
    return c
  }
  ;
  last () {
    return (this.getColumnIndex('LAST', 0, true) || this.count() - 1)
  }
  ;
  limit () {
    return (this.getColumnIndex('LIMIT', 0, true) || this.count())
  }
  ;
  total () {
    return (this.getColumnIndex('TOTAL', 0, true) || this.count())
  }
  ;
  pages () {
    const t = this.total()
    if (t) { return Math.ceil(t / this.limit()) }
    return 1
  }
  ;
  page () {
    if (this.count()) {
      return Math.floor(this.first() / this.limit()) + 1
    }
    return 1
  }
  ;
  prevpage () {
    return ((this.page() - 1) || 1)
  }
  ;
  nextpage () {
    const page = this.page() + 1
    const pages = this.pages()
    return (page <= pages ? page : pages)
  }
  ;
}
exports.Response = Response
exports.parse = (r) => {
  let m, mm
  const hash = {}
  const regexp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/
  r = r.replace(/\r\n/g, '\n').split('\n')
  while (r.length) {
    m = (r.shift()).match(regexp)
    if (m) {
      mm = m[1].match(/^property\[([^\]]*)\]/i)
      if (mm) {
        if (!hash.hasOwnProperty('PROPERTY')) { hash.PROPERTY = {} }
        mm[1] = mm[1].toUpperCase().replace(/\s/g, '')
        if (!hash.PROPERTY.hasOwnProperty(mm[1])) { hash.PROPERTY[mm[1]] = [] }
        hash.PROPERTY[mm[1]].push(m[2].replace(/[\t ]*$/, ''))
      } else {
        hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, '')
      }
    }
  }
  if (!hash.hasOwnProperty('DESCRIPTION')) { hash.DESCRIPTION = '' }
  return hash
}
exports.serialize = (p_r) => {
  const r = Object.assign({}, p_r)
  let plain = '[RESPONSE]'
  if (r.hasOwnProperty('PROPERTY')) {
    Object.keys(r.PROPERTY).forEach(function (key) {
      r.PROPERTY[key].forEach((val, index) => {
        plain += '\r\nPROPERTY[' + key + '][' + index + ']=' + val
      })
    })
  }
  if (r.hasOwnProperty('CODE')) { plain += '\r\ncode=' + r.CODE }
  if (r.hasOwnProperty('DESCRIPTION')) { plain += '\r\ndescription=' + r.DESCRIPTION }
  if (r.hasOwnProperty('QUEUETIME')) { plain += '\r\nqueuetime=' + r.QUEUETIME }
  if (r.hasOwnProperty('RUNTIME')) { plain += '\r\nruntime=' + r.RUNTIME }
  plain += '\r\nEOF\r\n'
  return plain
}
exports.getTemplates = () => {
  return exports.responses
}
exports.getTemplate = (p_tplid, p_parse) => {
  if (exports.responses[p_tplid]) {
    if (p_parse) { return exports.parse(exports.responses[p_tplid]) } else { return exports.responses[p_tplid] }
  }
  return false
}
exports.isTemplateMatch = (p_r, p_tplid) => {
  var tpl = exports.getTemplate(p_tplid, true)
  return (tpl &&
        p_r.CODE === tpl.CODE &&
        p_r.DESCRIPTION === tpl.DESCRIPTION)
}
// # sourceMappingURL=response.js.map
