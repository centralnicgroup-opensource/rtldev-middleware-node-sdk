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
