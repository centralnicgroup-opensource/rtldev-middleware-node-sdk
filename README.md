# node-sdk

[![npm version](https://img.shields.io/npm/v/@hexonet/ispapi-apiconnector.svg?style=flat)](https://www.npmjs.com/package/@hexonet/ispapi-apiconnector)
[![node](https://img.shields.io/node/v/@hexonet/ispapi-apiconnector.svg)](https://www.npmjs.com/package/@hexonet/ispapi-apiconnector)
[![build](https://travis-ci.org/hexonet/node-sdk.svg?branch=master)](https://travis-ci.org/hexonet/node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hexonet/node-sdk/blob/master/CONTRIBUTING.md)
[![Slack Widget](https://camo.githubusercontent.com/984828c0b020357921853f59eaaa65aaee755542/68747470733a2f2f73332e65752d63656e7472616c2d312e616d617a6f6e6177732e636f6d2f6e6774756e612f6a6f696e2d75732d6f6e2d736c61636b2e706e67)](https://hexonet-sdk.slack.com/messages/CBFDZ6G3W) [![Greenkeeper badge](https://badges.greenkeeper.io/hexonet/node-sdk.svg)](https://greenkeeper.io/)

This module is a connector library for the insanely fast HEXONET Backend API. For further informations visit our [homepage](https://www.hexonet.net) and do not hesitate to [contact us](https://www.hexonet.net/contact).

## Resources

* [Usage Guide](https://github.com/hexonet/node-sdk/blob/master/README.md#how-to-use-this-module-in-your-project)
* [Migration Guide](https://github.com/hexonet/node-sdk/wiki/Migration-Guide)
* [SDK Documenation](http://rawgit.com/hexonet/node-sdk/master/docs/typedoc/index.html)
* [HEXONET Backend API Documentation](https://github.com/hexonet/hexonet-api-documentation/tree/master/API)
* [Release Notes](https://github.com/hexonet/node-sdk/releases)
* [Development Guide](https://github.com/hexonet/node-sdk/wiki/Development-Guide)

## How to use this module in your project

We have also a demo app available showing how to integrate and use our SDK. See [here](https://github.com/hexonet/node-sdk-demo).

### Requirements

* Installed nodejs/npm. We suggest using [nvm](https://github.com/creationix/nvm).

### NodeJS Version Compatibility

| Version | NodeJS |
| ------- | ------ |
| 4.x and below | >= 4.x |
| 5.0.0 - 5.0.1 | >= 7.6.0 |
| >= 5.0.2 | >= 8.3.0 |

### Installation / Update

```bash
    npm i @hexonet/ispapi-apiconnector@latest --save
```

### Usage Examples

We provide only documentation and examples for the latest release.

#### API response format

If you got the API communication working, you will notice that we provide two response formats via this library.
a) Plain Format
b) Hash Format
c) ListHash Format

The different response formats can be accessed through the Response object itself that is returned by login, logout and request method:

```js
// console.log(r.getPlain())
// console.log(r.getHash())
// console.log(l.getListHash())
```

The plain format represents the API plain response.
The hash format represents the API response parsed into a js object.
The list format makes sense, if you're working with table libraries based on our list commands and need the hash format parsed into a list format.

#### API response codes

The API response (a JSON object) provides always two keys: CODE and DESCRIPTION.
CODE represents a return code which indicates the following cases:
"200" -> The command has been processed successfully by the API
"4xx" -> A temporary API error occured, retry later
"5xx" -> An API error occured

In case of a (temporary) error the DESCRIPTION may provide more details on the reason.

The hash format provides a PROPERTY key that covers potential data.
The list format provides a LIST key that covers potential data.

#### Session based API Communication

This example is thought for anyone who builds up his own frontend including user login and logout functionality.
See how login and logout works and how the request method depends on the login mechanism!
The logout can be done at any time separetely triggered. After logout no further requests reusing the by login returned socketcfg are possible.
Note: you have to first finish your requests before doing logout. Running queued requests may fail after logout.

```js
async function main () {
  const apiconnector = require('@hexonet/ispapi-apiconnector')
  const cl = new apiconnector.APIClient()
  // Use OT&E system, omitting this points by default to the LIVE system
  cl.useOTESystem()
  // Set your user id, here: the OT&E demo user
    .setCredentials('test.user', 'test.passw0rd')
  // Set Remote IP Address (in case of IP Filter setting)
    .setRemoteIPAddress('1.2.3.4:80')
  // Set a subuser view
  // cl.setUserView('hexotestman.com');

  console.log('login ...')
  let r = await cl.login()
  // Provide an one time password (active 2FA)
  // const r = await cl.login('12345678');
  if (r.getCode() !== 200) { // login failed
    console.log(`LOGIN FAILED -> ${r.getCode()} ${r.getDescription()}`)
    return
  }
  console.log('LOGIN SUCCEEDED')

  console.log('request further commands ...')
  r = await cl.request({
    COMMAND: 'StatusUser'
  })
  console.log(`RESPONSE -> ${r.getCode()} ${r.getDescription()}`)

  console.log('logout ...')
  r = await cl.logout()
  if (r.getCode() !== '200') { // login failed
    console.log(`LOGOUT FAILED -> ${r.getCode()} ${r.getDescription()}`)
    return
  }
  console.log('LOGOUT SUCCEEDED')
}
main()
```

##### Create your own frontend app on top

If you want to create your own frontend application based on our SDK, you will have to know how you can
save APIClient's session configuration data to the nodejs session and how to rebuild a new APIClient
instance out of it on next incoming request.

After successful login, use `cl.saveSession(req.session)` to save APIClient's session into the nodejs one.
This snippet is an example for the expressjs framework where `req` is the incoming ClientRequest and
`req.session` the expressjs session instance.

In your generic route for making API calls use `cl.reuseSession(req.session)` to rebuild APIClient's session
out of the previously saved data.

We cannot provide integration examples for part depends on your app itself and your own needs.
Still feel free to contact us in case you're stuck.

#### Sessionless API Communication

In the below example no login / logout procedure is required.
This is thought for cases where a user session is not of interest.
But in that case you always have to provide user and password accordingly.
If you want to build your frontend based on this library, we suggest to base it on the above example.

```js
async function main () {
  const apiconnector = require('@hexonet/ispapi-apiconnector')
  const cl = new apiconnector.APIClient()
  // Use OT&E system, omitting this points by default to the LIVE system
  cl.useOTESystem()
  // Set your user id, here: the OT&E demo user
    .setCredentials('test.user', 'test.passw0rd')
  // Set Remote IP Address (in case of IP Filter setting)
    .setRemoteIPAddress('1.2.3.4:80')
  // Set a subuser view
  // .setUserView('hexotestman.com')
  // Set a one time password (active 2FA)
  // .setOTP('12345678')

  const r = cl.request({
    COMMAND: 'StatusUser'
  })
  console.log(r.getPlain())
}
main()
```

### Promise based

No need to play with async / await.

```js
const apiconnector = require('@hexonet/ispapi-apiconnector')
const cl = new apiconnector.APIClient()
// Use OT&E system, omitting this points by default to the LIVE system
cl.useOTESystem()
// Set your user id, here: the OT&E demo user
cl.setCredentials('test.user', 'test.passw0rd')
// Set Remote IP Address (in case of IP Filter setting)
cl.setRemoteIPAddress('1.2.3.4:80')
// Set a subuser view
// cl.setUserView('hexotestman.com');
// Set a one time password (active 2FA)
// cl.setOTP('12345678');

cl.request({
  COMMAND: 'StatusUser'
}).then((r) => {
  console.log(r.getPlain())
})
```

### Use of method chaining

Shorten your code by using method chaining

```js
const apiconnector = require('@hexonet/ispapi-apiconnector')
const cl = new apiconnector.APIClient()
cl.useOTESystem()
  .setCredentials('test.user', 'test.passw0rd')
  .setRemoteIPAddress('1.2.3.4:80')
// .setUserView('hexotestman.com');
// .setOTP('12345678');

cl.request({
  COMMAND: 'StatusUser'
}).then((r) => {
  console.log(r.getPlain())
})
```

## Contributing

Please read [our development guide](https://github.com/hexonet/node-sdk/wiki/Development-Guide) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Kai Schwarz** - *lead development* - [PapaKai](https://github.com/papakai)

See also the list of [contributors](https://github.com/hexonet/node-sdk/graphs/contributors) who participated in this project.

## License

MIT
