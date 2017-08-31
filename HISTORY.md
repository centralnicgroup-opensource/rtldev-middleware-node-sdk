4.0.18 / 2017-08.31
===================
  * review null value check of previous change

4.0.17 / 2017-08.31
===================
  * error output added for commands including null values in a parameter

4.0.16 / 2017-08-20
===================
  * fix toString() issue in Client.command_encode when having null or undefined values in command
  * dep bump
    * chai: 4.1.0 -> 4.1.1
    * cross-env: 5.0.1 -> 5.0.5
    * mocha: 3.4.2 -> 3.5.0
    * nock: 9.0.13 -> 9.0.14
    * nyc: 11.0.3 -> 11.1.0

4.0.15 / 2017-07-12
===================
  * consider new API socket timeout in tests
  * deactivated timeout test [nock.js issue 754](https://github.com/node-nock/nock/issues/754)
  * dep bump of devDependencies

4.0.14 / 2017-07-12
===================
  * delete port in hostname (e.g. when using 127.0.0.1:8033)
  * increased API socket timeout to 300s

4.0.13 / 2017-04-03
===================
  * updated exclude option for nyc

4.0.12 / 2017-04-03
===================
  * review automated test process
    * introduce nyc (state of the art istanbul command line interface)
    * introduce cross-env (cross platform environment usage)
    * move tests from their subdir to their source file path
    * add usage of mocha.opts
    * command line review of npm test scripts

4.0.11 / 2017-03-20
===================
  * reviewed unauthorized default template

4.0.10 / 2017-03-20
===================
  * added unauthorized default template

4.0.9 / 2017-03-13
===================
  * Updated changelog

4.0.8 / 2017-03-13
===================
  * Removed Expect Header usage (to support node.js 5.5.0++)
    * [RFC2616](https://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html)
    * [node.js git issue #4651](https://github.com/nodejs/node-v0.x-archive/issues/4651)

4.0.7 / 2017-03-06
===================
  * added default response template for 500 Internal server error

4.0.6 / 2017-02-27
===================
  * replaced regular expression match with test
  * moved comments
  * replaced for in with Object.keys / forEach

4.0.5 / 2017-02-15
===================

  * Added test: Logout when not being logged in

4.0.4 / 2017-02-13
===================

  * Fix request method: in case no socket configuration and no response format type is provided (logout when not being logged in).

4.0.3 / 2017-02-09
===================

  * Removed badges as they are not working, maybe coming back to it in future

4.0.2 / 2017-02-09
===================

  * Add NPM badges for version and downloads

4.0.1 / 2017-02-09
===================

  * Separated reusable test methods into test/check-helper.js
  * Deactivated console outputs
  * defaultresponses.js is now directly available via response.js e.g. `var responses = require('./response.js').responses;`.
  * moved more commands and responses into test-commands.js
  * reviewed automated tests with usage of nock to simulate network traffic instead of making always real API connections. Just one scenario with login / request / logout left out to deal with an API connection to make sure everything works also well when doing a real API communication.
  * some minor code reviews of the mocca tests

4.0.0 / 2017-02-03
===================

  * Separate files for Request, Response and Client Module
  * Added mocha unit tests
  * Added istanbul coverage report
  * Updated .gitignore to ignore coverage folder

Simply use `npm test` for coverage report and unit tests.
