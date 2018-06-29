# node-sdk

[![npm version](https://img.shields.io/npm/v/@hexonet/ispapi-apiconnector.svg?style=flat)](https://www.npmjs.com/package/@hexonet/ispapi-apiconnector)
[![node](https://img.shields.io/node/v/@hexonet/ispapi-apiconnector.svg)](https://www.npmjs.com/package/@hexonet/ispapi-apiconnector)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hexonet/node-sdk/blob/master/CONTRIBUTING.md)
[![Slack Widget](https://camo.githubusercontent.com/984828c0b020357921853f59eaaa65aaee755542/68747470733a2f2f73332e65752d63656e7472616c2d312e616d617a6f6e6177732e636f6d2f6e6774756e612f6a6f696e2d75732d6f6e2d736c61636b2e706e67)](https://hexonet-sdk.slack.com/messages/CBFDZ6G3W)

This module is a connector library for the insanely fast HEXONET Backend API. For further informations visit our [homepage](https://www.hexonet.net) and do not hesitate to [contact us](https://www.hexonet.net/contact).

## Installation

```bash
    npm install @hexonet/ispapi-apiconnector@latest
```

## Usage

### API response format

If you got the API communication working, you will notice that we provide two response formats via this library.
a) hash format
b) list format

The response format can be switched by providing a 5th parameter to the request method e.g.:

```js
apiclient.request(command, socketcfg, callbackSuccess, callbackError, type);
//apiclient.request(command, socketconfig, callbackSuccess, callbackError, "hash");
//apiclient.request(command, socketconfig, callbackSuccess, callbackError, "list");
```

The default value for type is "hash". Thus not providing this parameter automatically returns the hash format.
The list format makes sense, if you're working with table libraries based on our list commands and need the hash format parsed into a list format.
NOTE: You have to login first. The login callback provides an updated socketcfg variable which has to be reused in the request and logout method.

### API response codes

The API response (a JSON object) provides always two keys: CODE and DESCRIPTION.
CODE represents a return code which indicates the following cases:
"200" -> The command has been processed successfully by the API
"4xx" -> A temporary API error occured, retry later
"5xx" -> An API error occured

In case of a (temporary) error the DESCRIPTION may provide more details on the reason.

The hash format provides a PROPERTY key that returns potential data.
The list format provides a LIST key that returns potential data.

### API login procedure

```js
var apiconnector = require('@hexonet/ispapi-connector')
  , apiclient = new apiconnector.Client()
  , socketparameters, cb;

//--- socket parameters in JSON format
socketparameters = {
  entity: "1234",//OT&E system, use "54cd" for LIVE system
  login: "test.user",//your user id, here: the OT&E demo user
  pw: "test.passw0rd",//your user password
  remoteaddr: "1.2.3.4:80"//optional: provide your remote ip address
  //remoteaddr: provide it, if you have an ip address filter activated in your account for security reasons
};

//--- login callback method
cb = function(r, socketcfg){
  if (r.CODE!=="200")//login failed
    return;
  //login succeeded
  //r.PROPERTY.SESSION[0] contains the api session id which is required for further api communication
  //reuse socketcfg for every further api request or the api logout at end (it contains already the above mentioned session id)
};

//--- perform a login to the provided url
apiclient.login(socketparameters, cb);
```

### API command request

After login, you should reuse the above 'socketcfg' parameter in further requests which is the simplest and best way.

```js
var apiconnector = require('@hexonet/ispapi-apiconnector')
  , apiclient = new apiconnector.Client()
  , cb, cberr;

//optional callback method (success case)
cb = function(r){
  //api communication succeeded
  //r -> api response in hash/list format, read above
  console.dir(r);
};

//optional callback method (error handler)
cberr = function(r){
  //this is the callback method that is called in any error case (network issue etc.)
  //r -> api response in hash/list format, read above
  console.dir(r);
};

apiclient.request({ COMMAND : "StatusUser" }, socketcfg, cb, cberr);
```

NOTE: You have to login first. The login callback provides an updated socketcfg variable which has to be reused in the request and logout method.

### API logout

```js
'use strict';

var apiconnector = require('@hexonet/ispapi-connector')
  , apiclient = new apiconnector.Client()
  , cb;

//optional callback method
cb = function(r){
  //r -> api response in hash/list format, read above
  //r.CODE === "200": the api session is now destroyed
  console.dir(r);
};

api.logout(socketcfg, cb);
```

NOTE: You have to login first. The login callback provides an updated socketcfg variable which has to be reused in the request and logout method.

## Working example

This example is thought for anyone who builds up his own frontend including user login and logout functionality.
See how login and logout works and how the request method depends on the login mechanism!
The logout can be done at any time separetely triggered. After logout no further requests are possible.
Note: you have to first finish your requests before doing logout. Running requests may fail after logout.

```js
'use strict';

var apiconnector = require('@hexonet/ispapi-apiconnector'),
  apiclient = new apiconnector.Client(),
  socketparameters;

//--- socket parameters in JSON format
socketparameters = {
  entity: "1234", //OT&E system, use "54cd" for LIVE system
  login: "test.user", //your user id, here: the OT&E demo user
  pw: "test.passw0rd", //your user password
  //user: "...",//can be used to work with a subuser account - optional
  remoteaddr: "1.2.3.4:80" //optional: provide your remote ip address (use for ip filter)
};

//--- perform a login to the provided url
console.log("login ...");
apiclient.login(socketparameters, function(r, socketcfg) {
  if (r.CODE !== "200") { //login failed
    console.log(" FAILED -> " + r.CODE + " " + r.DESCRIPTION);
    return;
  }
  console.log(" SUCCESS");

  //define callback method which we use for success and error case
  //you can also define a separate callback method for error case instead
  var cb = function(r) {
    console.log("---- API response ----");
    console.dir(r);

    //... further commands ...

    //--- finally do logout
    console.log("logout ...");
    apiclient.logout(socketcfg, function(r) {
      if (r.CODE !== "200") { //logout failed
        console.log(" FAILED -> " + r.CODE + " " + r.DESCRIPTION);
        return;
      }
      console.log(" SUCCESS");
    });
  };

  console.log("requesting user status ...");
  apiclient.request({
    COMMAND: "StatusUser"
  }, socketcfg, cb, cb);
});
```

## Working example (without API session)

In the below example no login / logout procedure is required.
This is thought for cases where a user session is not of interest.
But in that case you always have to provide user and password accordingly.
If you want to build your frontend based on this library, we suggest to base it on the above example.

```js
'use strict';

var apiconnector = require('@hexonet/ispapi-apiconnector'),
  apiclient = new apiconnector.Client(),
  socketparameters =  {
    params: {
      entity: '1234',
      remoteaddr: '1.2.3.4:80',
      login: 'test.user',
      pw: 'test.passw0rd'
    }
  };

var cb = function(r) {
  console.dir(r);
};

apiclient.request({
  COMMAND: "StatusAccount"
}, socketparameters, cb, cb);
```

## FAQ

Nothing added yet.

## License

MIT
