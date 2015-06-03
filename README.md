# ISPAPI JS

This module is a connector library for the insanely fast 1API backend API.
For further informations visit our homepage http://1api.net and do not hesitate to contact us. 

## Installation

    $ npm install ispapijs

## Usage

```js
var ispApi = require('ispapijs');
var api = ispapijs.Client();

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

The MIT License (MIT)

Copyright (c) 2014 Kai Schwarz kschwarz@1api.net

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
