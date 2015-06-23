# ISPAPI JS

This module is a connector library for the insanely fast 1API backend API.
For further informations visit our homepage http://1api.net and do not hesitate to contact us. 

## Installation

    $ npm install ispapijs

## Usage

```js
var ispapijs = require('ispapijs')
  , api = ispapijs.Client();

//optional: set client remote address including remote port, e.g.:
api.setRemoteAddr("1.2.3.4:80");

/** mandantory: set your account name and password for later requests
 * NOTE: if not set, credentials of demo user in OT&E (Test) system will be used by default as fallback
 * 1st parameter: account name
 * 2nd parameter: password
 * 3rd parameter: system environment / entity. Use "1234" for OT&E (Testsystem) and "54cd" for Production System
 */
api.login("test.user", "test.passw0rd", "1234");//OT&E demo user

/** optional: set url for api connection
 * NOTE: if not set, default connection url will be used
 */
api.connect("https://coreapi.1API.net/api/call.cgi");

//request result of an api command
api.request({
	COMMAND : "StatusUser"
});

//output api response when ready
api.once("response", function(r){
	console.dir(r.as_hash());
});

//react on error events
api.on("error", function(e){
	console.log(e.message);
});
```

## FAQ
Nothing added yet.

## License
MIT