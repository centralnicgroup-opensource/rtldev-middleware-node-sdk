'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
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
// # sourceMappingURL=iterator.js.map
