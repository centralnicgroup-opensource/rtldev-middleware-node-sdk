# CentralNic Reseller NODE-SDK

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)
[![npm version](https://img.shields.io/npm/v/@cnr/apiconnector.svg?style=flat)](https://www.npmjs.com/package/@cnr/apiconnector)
[![node](https://img.shields.io/node/v/@cnr/apiconnector.svg)](https://www.npmjs.com/package/@cnr/apiconnector)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Build Status](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/workflows/Release/badge.svg?branch=master)](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/workflows/Release/badge.svg?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/blob/master/CONTRIBUTING.md)

This module is a connector library for the insanely fast CentralNic Reseller (formerly RRPProxy) Backend API. For further informations visit our [homepage](https://www.centralnicreseller.com) and do not hesitate to [contact us](https://www.centralnicreseller.com/contact).

## Deprecation Notice: Hexonet Node.js SDK

This SDK succeeds the deprecated Hexonet Node.js SDK. It is an enhanced version that builds upon the foundation laid by the Hexonet SDK, offering improved features and performance. Hexonet is migrating to CentralNic Reseller, ensuring continued support and development under the new branding.

## Resources

- [Documentation](https://support.centralnicreseller.com/hc/en-gb/articles/5714403954333-Self-Development-Kit-for-NodeJS)
- [Release Notes](https://github.com/centralnicgroup-opensource/rtldev-middleware-node-sdk/releases)

## Running the Demo Application

To run the demo application, follow these steps:

1. **Set Your Credentials**: Ensure your credentials are available. You can either:

- Replace them directly in the application file.
- Set the environment variables `CNR_TEST_USER` and `CNR_TEST_PASSWORD` in your terminal.

2. **Execute the Demo**: Once your credentials are set, run the following command in the terminal:

   ```sh
   npm run test-demo
   ```

3. **Update Demo Contents**: If you need to update the contents of the demo file, you can find it at:

   ```plaintext
   tests/app.js
   ```

By following these steps, you can successfully run and update the demo application.

## Authors

- **Kai Schwarz** - [KaiSchwarz-cnic](https://github.com/kaischwarz-cnic)
- **Asif Nawaz** - [AsifNawaz-cnic](https://github.com/asifnawaz-cnic)

## FAQ / Notes

ESM/CJS Support: We followed the [ESM-NODE Guide](https://www.typescriptlang.org/docs/handbook/esm-node.html) of TypeScript.

## License

MIT
