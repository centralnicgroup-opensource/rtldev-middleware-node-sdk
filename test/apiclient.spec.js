'use strict'

const expect = require('chai').expect
const chai = require('chai')
const chaiPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const apiclient = require('../dist/apiclient')
const response = require('../dist/response')
const rtm = require('../dist/responsetemplatemanager').ResponseTemplateManager.getInstance()
const nock = require('nock')
let cl
chai.use(dirtyChai)
chai.use(chaiPromised)

after(() => {
  nock.cleanAll()
})

before(() => {
  cl = new apiclient.APIClient()
  rtm.addTemplate('login200', '[RESPONSE]\r\nPROPERTY[SESSION][0]=h8JLZZHdF2WgWWXlwbKWzEG3XrzoW4yshhvtqyg0LCYiX55QnhgYX9cB0W4mlpbx\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.169\r\nEOF\r\n')
    .addTemplate('login500', rtm.generateTemplate('530', 'Authentication failed'))
    .addTemplate('OK', rtm.generateTemplate('200', 'Command completed successfully'))
    .addTemplate('listP0', '[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[DOMAIN][1]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n')
    .addTemplate('listP1', '[RESPONSE]\r\nPROPERTY[TOTAL][0]=2701\r\nPROPERTY[FIRST][0]=2\r\nPROPERTY[DOMAIN][0]=0-qas-ao17-0.org\r\nPROPERTY[DOMAIN][1]=0-sunnyda222y.com\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=3\r\nPROPERTY[LIMIT][0]=2\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.032\r\nEOF\r\n')
    .addTemplate('listFP0', '[RESPONSE]\r\nPROPERTY[TOTAL][0]=3\r\nPROPERTY[FIRST][0]=0\r\nPROPERTY[DOMAIN][0]=0-60motorcycletimes.com\r\nPROPERTY[COUNT][0]=1\r\nPROPERTY[LAST][0]=1\r\nPROPERTY[LIMIT][0]=1\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.023\r\nEOF\r\n')
    .addTemplate('listFP1', '[RESPONSE]\r\nPROPERTY[TOTAL][0]=3\r\nPROPERTY[FIRST][0]=1\r\nPROPERTY[DOMAIN][0]=0-be-s01-0.com\r\nPROPERTY[COUNT][0]=1\r\nPROPERTY[LAST][0]=2\r\nPROPERTY[LIMIT][0]=1\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.032\r\nEOF\r\n')
    .addTemplate('listFP2', '[RESPONSE]\r\nPROPERTY[TOTAL][0]=3\r\nPROPERTY[FIRST][0]=2\r\nPROPERTY[DOMAIN][0]=0-qas-ao17-0.org\r\nPROPERTY[COUNT][0]=2\r\nPROPERTY[LAST][0]=3\r\nPROPERTY[LIMIT][0]=1\r\nDESCRIPTION=Command completed successfully\r\nCODE=200\r\nQUEUETIME=0\r\nRUNTIME=0.032\r\nEOF\r\n')
})

describe('APIClient class', function () {
  this.timeout(apiclient.APIClient.socketTimeout)
  this.slow(1000)

  describe('#.setCustomLogger', function () {
    after(function () {
      cl.setDefaultLogger()
      cl.disableDebugMode()
    })
    it('test if working', async function () {
      cl.enableDebugMode()
      let myflag = false
      cl.setCustomLogger(() => {
        myflag = true
      })
      await cl.request({ COMMAND: 'GetUserIndex' })
      expect(myflag).to.be.true()
    })
  })

  describe('#.getPOSTData', function () {
    it('test object input with special chars', function () {
      const validate = 's_entity=54cd&s_command=COMMAND%3DModifyDomain%0AAUTH%3Dgwrgwqg%25%26%5C44t3%2A'
      const enc = cl.getPOSTData({
        COMMAND: 'ModifyDomain',
        AUTH: 'gwrgwqg%&\\44t3*'
      })
      expect(enc).to.equal(validate)
    })

    it('test string input', function () {
      const enc = cl.getPOSTData('gregergege')
      expect(enc).to.equal('s_entity=54cd&s_command=')
    })

    it('test object input with null value in parameter', function () {
      const validate = 's_entity=54cd&s_command=COMMAND%3DModifyDomain'
      const enc = cl.getPOSTData({
        COMMAND: 'ModifyDomain',
        AUTH: null
      })
      expect(enc).to.equal(validate)
    })

    it('test object input with undefined value in parameter', function () {
      const validate = 's_entity=54cd&s_command=COMMAND%3DModifyDomain'
      const enc = cl.getPOSTData({
        COMMAND: 'ModifyDomain',
        AUTH: undefined
      })
      expect(enc).to.equal(validate)
    })
  })

  describe('#.enableDebugMode', function () {
    it('activate debug mode', function () {
      cl.enableDebugMode()
    })
  })

  describe('#.disableDebugMode', function () {
    it('deactivate debug mode', function () {
      cl.disableDebugMode()
    })
  })

  describe('#.getSession', function () {
    it('validate response', function () {
      const session = cl.getSession()
      expect(session).to.be.null()
    })
  })

  describe('#.getSession', function () {
    it('validate response', function () {
      const sessid = 'testSessionID12345678'
      cl.setSession(sessid)
      const session = cl.getSession()
      expect(session).to.be.equal(sessid)
      cl.setSession('')
    })
  })

  describe('#.getURL', function () {
    it('validate default socket url', function () {
      const url = cl.getURL()
      expect(url).to.equal('https://api.ispapi.net/api/call.cgi')
    })
  })

  describe('#.getUserAgent', function () {
    it('validate response', function () {
      const ua = cl.getUserAgent()
      expect(ua).to.equal(`NODE-SDK (${process.platform}; ${process.arch}; rv:${cl.getVersion()}) node/${process.version}`)
    })
  })

  describe('#.setUserAgent', function () {
    it('validate response', function () {
      const cls = cl.setUserAgent('WHMCS', '7.7.0')
      const ua = cl.getUserAgent()
      expect(cls).to.be.instanceOf(apiclient.APIClient)
      expect(ua).to.equal(`WHMCS (${process.platform}; ${process.arch}; rv:7.7.0) node-sdk/${cl.getVersion()} node/${process.version}`)
    })
  })

  describe('#.setURL', function () {
    it('validate http socket url', function () {
      const url = cl.setURL('http://api.ispapi.net/api/call.cgi').getURL()
      expect(url).to.equal('http://api.ispapi.net/api/call.cgi')
      cl.setURL('https://api.ispapi.net/api/call.cgi')
    })
  })

  describe('#.setOTP', function () {
    it('validate getPOSTData response [otp set] ', function () {
      cl.setOTP('12345678')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_otp=12345678&s_command=COMMAND%3DStatusAccount')
    })

    it('validate getPOSTData response [otp reset]', function () {
      cl.setOTP('')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_command=COMMAND%3DStatusAccount')
    })
  })

  describe('#.setSession', function () {
    it('validate getPOSTData response [session set] ', function () {
      cl.setSession('12345678')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_session=12345678&s_command=COMMAND%3DStatusAccount')
    })

    it('validate getPOSTData response [credentials and session set] ', function () {
      // credentials and otp code have to be unset when session id is set
      cl.setRoleCredentials('myaccountid', 'myrole', 'mypassword')
        .setOTP('12345678')
        .setSession('12345678')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_session=12345678&s_command=COMMAND%3DStatusAccount')
    })

    it('validate getPOSTData response [session reset]', function () {
      cl.setSession('')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_command=COMMAND%3DStatusAccount')
    })
  })

  describe('#.saveSession/reuseSession', function () {
    after(function () {
      cl.setSession('')
    })

    it('validate correct settings', function () {
      const sessionobj = {}
      cl.setSession('12345678')
        .saveSession(sessionobj)
      const cl2 = new apiclient.APIClient()
      cl2.reuseSession(sessionobj)
      const tmp = cl2.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_session=12345678&s_command=COMMAND%3DStatusAccount')
    })
  })

  describe('#.setRemoteIPAddress', function () {
    it('validate getPOSTData response [ip set] ', function () {
      cl.setRemoteIPAddress('10.10.10.10')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_remoteaddr=10.10.10.10&s_command=COMMAND%3DStatusAccount')
    })

    it('validate getPOSTData response [ip reset]', function () {
      cl.setRemoteIPAddress('')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_command=COMMAND%3DStatusAccount')
    })
  })

  describe('#.setCredentials', function () {
    it('validate getPOSTData response [credentials set] ', function () {
      cl.setCredentials('myaccountid', 'mypassword')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_login=myaccountid&s_pw=mypassword&s_command=COMMAND%3DStatusAccount')
    })

    it('validate getPOSTData response [session reset]', function () {
      cl.setCredentials('', '')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_command=COMMAND%3DStatusAccount')
    })
  })

  describe('#.setRoleCredentials', function () {
    it('validate getPOSTData response [role credentials set] ', function () {
      cl.setRoleCredentials('myaccountid', 'myroleid', 'mypassword')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_login=myaccountid%21myroleid&s_pw=mypassword&s_command=COMMAND%3DStatusAccount')
    })

    it('validate getPOSTData response [role credentials reset]', function () {
      cl.setRoleCredentials('', '', '')
      const tmp = cl.getPOSTData({
        COMMAND: 'StatusAccount'
      })
      expect(tmp).to.equal('s_entity=54cd&s_command=COMMAND%3DStatusAccount')
    })
  })

  describe('#.login', function () {
    it('validate against mocked API response [login succeeded; no role used]', async function () {
      const tpl = new response.Response(rtm.getTemplate('login200').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, tpl.getPlain())
      cl.useOTESystem()
        .setCredentials('test.user', 'test.passw0rd')
      const r = await cl.login()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
      const rec = r.getRecord(0)
      expect(rec).not.to.be.null()
      expect(rec.getDataByKey('SESSION')).to.equal(tpl.getRecord(0).getDataByKey('SESSION'))
    })

    it('validate against mocked API response [login succeeded; role used]', async function () {
      const tpl = new response.Response(rtm.getTemplate('login200').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, tpl.getPlain())
      cl.useOTESystem()
        .setRoleCredentials('test.user', 'testrole', 'test.passw0rd')
      const r = await cl.login()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
      const rec = r.getRecord(0)
      expect(rec).not.to.be.null()
      expect(rec.getDataByKey('SESSION')).to.equal(tpl.getRecord(0).getDataByKey('SESSION'))
    })

    it('validate against mocked API response [login failed; wrong credentials]', async function () {
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('login500').getPlain())
      cl.setCredentials('test.user', 'WRONGPASSWORD')
      const r = await cl.login()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isError()).to.be.true()
    })

    it('validate against mocked API response [login failed; http timeout]', async function () {
      // nock.cleanAll()
      const tpl = rtm.getTemplate('httperror')
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .socketDelay(apiclient.APIClient.socketTimeout)
        .reply(200, tpl.getPlain())
      cl.setCredentials('test.user', 'WRONGPASSWORD')
      const r = await cl.login()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isTmpError()).to.be.true()
      expect(r.getDescription()).to.equal(tpl.getDescription())
    })

    it('validate against mocked API response [login succeeded; no session returned] ', async function () {
      // this case cannot really happen as the api always returns SESSION property.
      // this case is just to increase coverage
      const tpl = new response.Response(rtm.getTemplate('OK').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, tpl.getPlain())
      cl.useOTESystem()
        .setCredentials('test.user', 'test.passw0rd')
      const r = await cl.login()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
      const rec = r.getRecord(0)
      expect(rec).to.be.null()
    })
  })

  describe('#.loginExtended', function () {
    it('validate against mocked API response [login succeeded; no role used] ', async function () {
      const tpl = new response.Response(rtm.getTemplate('login200').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, tpl.getPlain())
      cl.useOTESystem()
        .setCredentials('test.user', 'test.passw0rd')
      const r = await cl.loginExtended({
        TIMEOUT: 60
      })
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
      const rec = r.getRecord(0)
      expect(rec).not.to.be.null()
      expect(rec.getDataByKey('SESSION')).to.equal(tpl.getRecord(0).getDataByKey('SESSION'))
    })
  })

  describe('#.logout', function () {
    it('validate against mocked API response [logout succeeded]', async function () {
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('OK').getPlain())
      const r = await cl.logout()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
    })

    it('validate against mocked API response [logout failed; session no longer exists]', async function () {
      const tpl = new response.Response(rtm.getTemplate('login200').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('login500').getPlain())
      cl.enableDebugMode()
        .setSession(tpl.getRecord(0).getDataByKey('SESSION'))
      const r = await cl.logout()
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isError()).to.be.true()
    })
  })

  describe('#.request', function () {
    // TODO additional test for statusMessage - currently not supported through nock [https://github.com/nock/nock/issues/558]
    it('validate against mocked API response [200 < r.statusCode > 299]', async function () {
      const tpl2 = new response.Response(rtm.getTemplate('httperror').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(404, rtm.getTemplate('404').getPlain())
      cl.enableDebugMode()
        .setCredentials('test.user', 'test.passw0rd')
        .useOTESystem()
      const r = await cl.request({ COMMAND: 'GetUserIndex' })
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isTmpError()).to.be.true()
      expect(r.getCode()).to.equal(tpl2.getCode())
      expect(r.getDescription()).to.equal(tpl2.getDescription())
    })

    it('validate against mocked API response [200 < r.statusCode > 299, no debug]', async function () {
      const tpl2 = new response.Response(rtm.getTemplate('httperror').getPlain())
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(404, rtm.getTemplate('404').getPlain())
      cl.disableDebugMode()
      const r = await cl.request({ COMMAND: 'GetUserIndex' })
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isTmpError()).to.be.true()
      expect(r.getCode()).to.equal(tpl2.getCode())
      expect(r.getDescription()).to.equal(tpl2.getDescription())
    })
  })

  describe('#.requestNextResponsePage', function () {
    it('validate against mocked API response [no LAST set]', async function () {
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('listP1').getPlain())
      const r = new response.Response(
        rtm.getTemplate('listP0').getPlain(),
        { COMMAND: 'QueryDomainList', LIMIT: 2, FIRST: 0 }
      )
      const nr = await cl.requestNextResponsePage(r)
      expect(r.isSuccess()).to.be.true()
      expect(nr.isSuccess()).to.be.true()
      expect(r.getRecordsLimitation()).to.equal(2)
      expect(nr.getRecordsLimitation()).to.equal(2)
      expect(r.getRecordsCount()).to.equal(2)
      expect(nr.getRecordsCount()).to.equal(2)
      expect(r.getFirstRecordIndex()).to.equal(0)
      expect(r.getLastRecordIndex()).to.equal(1)
      expect(nr.getFirstRecordIndex()).to.equal(2)
      expect(nr.getLastRecordIndex()).to.equal(3)
    })

    it('validate against mocked API response [LAST set]', function () {
      const r = new response.Response(
        rtm.getTemplate('listP0').getPlain(),
        { COMMAND: 'QueryDomainList', LIMIT: 2, FIRST: 0, LAST: 1 }
      )
      return expect(cl.requestNextResponsePage(r)).to.be.rejectedWith(Error, 'Parameter LAST in use. Please remove it to avoid issues in requestNextPage.')
    })

    it('validate against mocked API response [no FIRST set]', async function () {
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('listP1').getPlain())
      cl.disableDebugMode()
      const r = new response.Response(
        rtm.getTemplate('listP0').getPlain(),
        { COMMAND: 'QueryDomainList', LIMIT: 2 }
      )
      const nr = await cl.requestNextResponsePage(r)
      expect(r.isSuccess()).to.be.true()
      expect(nr.isSuccess()).to.be.true()
      expect(r.getRecordsLimitation()).to.equal(2)
      expect(nr.getRecordsLimitation()).to.equal(2)
      expect(r.getRecordsCount()).to.equal(2)
      expect(nr.getRecordsCount()).to.equal(2)
      expect(r.getFirstRecordIndex()).to.equal(0)
      expect(r.getLastRecordIndex()).to.equal(1)
      expect(nr.getFirstRecordIndex()).to.equal(2)
      expect(nr.getLastRecordIndex()).to.equal(3)
    })
  })

  describe('#.requestAllResponsePages', function () {
    it('validate against mocked API response [success case]', async function () {
      const scope = nock('https://api.ispapi.net')
        .persist()
        .post('/api/call.cgi')
        .reply(function (uri, requestBody) {
          if (requestBody === 's_entity=1234&s_login=test.user&s_pw=test.passw0rd&s_command=COMMAND%3DQueryDomainList%0ALIMIT%3D2%0AFIRST%3D0') {
            return rtm.getTemplate('listFP0').getPlain()
          }
          if (requestBody === 's_entity=1234&s_login=test.user&s_pw=test.passw0rd&s_command=COMMAND%3DQueryDomainList%0ALIMIT%3D2%0AFIRST%3D1') {
            return rtm.getTemplate('listFP1').getPlain()
          }
          return rtm.getTemplate('listFP2').getPlain()
        })
      const nr = await cl.requestAllResponsePages({ COMMAND: 'QueryDomainList', FIRST: 0, LIMIT: 1 })
      expect(nr.length).to.equal(3)
      scope.persist(false)
    })
  })

  describe('#.setUserView', function () {
    it('validate against mocked API response', async function () {
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('OK').getPlain())
      cl.setUserView('hexotestman.com')
      const r = await cl.request({ COMMAND: 'GetUserIndex' })
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
    })
  })

  describe('#.resetUserView', function () {
    it('validate against mocked API response', async function () {
      nock('https://api.ispapi.net')
        .post('/api/call.cgi')
        .reply(200, rtm.getTemplate('OK').getPlain())
      cl.resetUserView()
      const r = await cl.request({ COMMAND: 'GetUserIndex' })
      expect(r).to.be.instanceOf(response.Response)
      expect(r.isSuccess()).to.be.true()
    })
  })
})
