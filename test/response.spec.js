'use strict'

const expect = require('chai').expect
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const Response = require('../dist/response').Response
const ResponseTemplateManager = require('../dist/responsetemplatemanager').ResponseTemplateManager
const ResponseParser = require('../dist/responseparser').ResponseParser
chai.use(dirtyChai)

let rtm = ResponseTemplateManager.getInstance()

before(function () {
  rtm.addTemplate('listP0', '[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[DOMAIN][1]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n')
  rtm.addTemplate('OK', rtm.generateTemplate('200', 'Command completed successfully'))
})

describe('Response class', function () {
  this.slow(1000)

  describe('#.getCurrentPageNumber', function () {
    it('check return value [w/ entries in response]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      expect(r.getCurrentPageNumber()).to.equal(1)
    })

    it('check return value [w/o entries in response]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.getCurrentPageNumber()).to.equal(null)
    })
  })

  describe('#.getFirstRecordIndex', function () {
    it('check return value [w/o FIRST in response, no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.getFirstRecordIndex()).to.equal(null)
    })

    it('check return value [w/o FIRST in response, rows]', function () {
      let h = rtm.getTemplate('OK').getHash()
      h.PROPERTY = {
        DOMAIN: ['mydomain1.com', 'mydomain2.com']
      }
      const r = new Response(ResponseParser.serialize(h))
      expect(r.getFirstRecordIndex()).to.equal(0)
    })
  })

  describe('#.getColumns', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const cols = r.getColumns()
      expect(cols.length).to.equal(6)
    })
  })

  describe('#.getColumnIndex', function () {
    it('check return value [colum exists]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const data = r.getColumnIndex('DOMAIN', 0)
      expect(data).to.equal('0-60motorcycletimes.com')
    })

    it('check return value [colum does not exist]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const data = r.getColumnIndex('COLUMN_NOT_EXISTS', 0)
      expect(data).to.be.null()
    })
  })

  describe('#.getColumnKeys', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const colkeys = r.getColumnKeys()
      expect(colkeys.length).to.equal(6)
      expect(colkeys).to.include.members(['COUNT', 'DOMAIN', 'FIRST', 'LAST', 'LIMIT', 'TOTAL'])
    })
  })

  describe('#.getCurrentRecord', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const rec = r.getCurrentRecord()
      expect(rec.getData()).to.eql({
        COUNT: '2',
        DOMAIN: '0-60motorcycletimes.com',
        FIRST: '0',
        LAST: '1',
        LIMIT: '2',
        TOTAL: '2701'
      })
    })

    it('check return value [no records available]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      const rec = r.getCurrentRecord()
      expect(rec).to.be.null()
    })
  })

  describe('#.getListHash', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const lh = r.getListHash()
      expect(lh.LIST.length).to.equal(2)
      expect(lh.meta.columns).to.eql(r.getColumnKeys())
      expect(lh.meta.pg).to.eql(r.getPagination())
    })
  })

  describe('#.getNextRecord', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      let rec = r.getNextRecord()
      expect(rec.getData()).to.eql({ DOMAIN: '0-be-s01-0.com' })
      rec = r.getNextRecord()
      expect(rec).to.be.null()
    })
  })

  describe('#.getPagination', function () {
    it('check return value [next record]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      const pager = r.getPagination()
      expect(pager).to.have.all.keys(['COUNT', 'CURRENTPAGE', 'FIRST', 'LAST', 'LIMIT', 'NEXTPAGE', 'PAGES', 'PREVIOUSPAGE', 'TOTAL'])
    })
  })

  describe('#.getPreviousRecord', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      let rec = r.getNextRecord()
      rec = r.getPreviousRecord()
      expect(rec.getData()).to.eql({
        COUNT: '2',
        DOMAIN: '0-60motorcycletimes.com',
        FIRST: '0',
        LAST: '1',
        LIMIT: '2',
        TOTAL: '2701'
      })
      rec = r.getPreviousRecord()
      expect(rec).to.be.null()
    })
  })

  describe('#.hasNextPage', function () {
    it('check return value [no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.hasNextPage()).to.be.false()
    })

    it('check return value [rows]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      expect(r.hasNextPage()).to.be.true()
    })
  })

  describe('#.hasPreviousPage', function () {
    it('check return value [no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.hasPreviousPage()).to.be.false()
    })

    it('check return value [rows]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      expect(r.hasPreviousPage()).to.be.false()
    })
  })

  describe('#.getLastRecordIndex', function () {
    it('check return value [no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.getLastRecordIndex()).to.be.null()
    })

    it('check return value [w/o LAST in response, rows]', function () {
      let h = rtm.getTemplate('OK').getHash()
      h.PROPERTY = {
        DOMAIN: ['mydomain1.com', 'mydomain2.com']
      }
      const r = new Response(ResponseParser.serialize(h))
      expect(r.getLastRecordIndex()).to.equal(1)
    })
  })

  describe('#.getNextPageNumber', function () {
    it('check return value [no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.getNextPageNumber()).to.be.null()
    })

    it('check return value [rows]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      expect(r.getNextPageNumber()).to.be.equal(2)
    })
  })

  describe('#.getNumberOfPages', function () {
    it('check return value [no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.getNumberOfPages()).to.equal(0)
    })
  })

  describe('#.getPreviousPageNumber', function () {
    it('check return value [no rows]', function () {
      const r = new Response(rtm.getTemplate('OK').getPlain())
      expect(r.getPreviousPageNumber()).to.be.null()
    })

    it('check return value [rows]', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      expect(r.getPreviousPageNumber()).to.be.null()
    })
  })

  describe('#.rewindRecordList', function () {
    it('check return value', function () {
      const r = new Response(rtm.getTemplate('listP0').getPlain())
      expect(r.getPreviousRecord()).to.be.null()
      expect(r.getNextRecord()).not.to.be.null()
      expect(r.getNextRecord()).to.be.null()
      expect(r.rewindRecordList().getPreviousRecord()).to.be.null()
    })
  })
})
