# [9.0.0](https://github.com/hexonet/node-sdk/compare/v8.0.2...v9.0.0) (2022-07-29)


### chore

* **esm/cjs:** review transpilation, introduce cross-fetch ([ed6ca7f](https://github.com/hexonet/node-sdk/commit/ed6ca7fa0333c30fc9c68eddd1d34b036802f2bb))


### BREAKING CHANGES

* **esm/cjs:** module format review esm/cjs both to be working

## [8.0.2](https://github.com/hexonet/node-sdk/compare/v8.0.1...v8.0.2) (2022-06-10)

### Bug Fixes

- **apiclient:** add type assertion for json import ([685c940](https://github.com/hexonet/node-sdk/commit/685c940f65153b2eff62adefe88f8b374c67f4ec))

## [8.0.1](https://github.com/hexonet/node-sdk/compare/v8.0.0...v8.0.1) (2022-06-08)

### Bug Fixes

- **dep-bump:** for package-lock.json (multiple vuln) ([0450321](https://github.com/hexonet/node-sdk/commit/0450321510c16fc770b20ff24747bf4732d7144b))

# [8.0.0](https://github.com/hexonet/node-sdk/compare/v7.0.8...v8.0.0) (2022-06-08)

### chore

- **dep bump:** upgrade software dependencies to latest version ([872cff1](https://github.com/hexonet/node-sdk/commit/872cff13d81436d36b1b9bee85abb21ff3623606))

### BREAKING CHANGES

- **dep bump:** upgrade to semantic-release v19

## [7.0.8](https://github.com/hexonet/node-sdk/compare/v7.0.7...v7.0.8) (2022-03-22)

### Bug Fixes

- **ot&e:** url updated for OT&E environment ([e9f09dc](https://github.com/hexonet/node-sdk/commit/e9f09dc34ea3c5996b547b11705dfe29ab7f85de))
- **tests:** refactor to minimize maintenance effort ([717d417](https://github.com/hexonet/node-sdk/commit/717d417e4305bed401515fe3b27eddb0a236be61))

### Reverts

- **ts config:** revert latest change as inlineSourceMap is in use ([8ffb346](https://github.com/hexonet/node-sdk/commit/8ffb3463cd0dbbec66a4644cd19e56f3bdf42d30))

## [7.0.7](https://github.com/hexonet/node-sdk/compare/v7.0.6...v7.0.7) (2021-11-16)

### Bug Fixes

- **docco:** re-introduced docco docs (dependency got fixed) ([47d1a09](https://github.com/hexonet/node-sdk/commit/47d1a09ea034f42ec09b24b093a39f219d43bad3))

## [7.0.6](https://github.com/hexonet/node-sdk/compare/v7.0.5...v7.0.6) (2021-11-11)

### Bug Fixes

- **node-fetch:** upgraded to v3 / ESM revamp ([1c312dc](https://github.com/hexonet/node-sdk/commit/1c312dc78c59f4f4a43d7163ed48327ec31bb8bd))

## [7.0.5](https://github.com/hexonet/node-sdk/compare/v7.0.4...v7.0.5) (2021-05-25)

### Bug Fixes

- **dep-bump:** upgrade dependencies ([e541f80](https://github.com/hexonet/node-sdk/commit/e541f80732a91f69479a677a0236bc6f29244975))

## [7.0.4](https://github.com/hexonet/node-sdk/compare/v7.0.3...v7.0.4) (2021-01-21)

### Bug Fixes

- **ci:** migration from Travis CI to github actions ([b3244be](https://github.com/hexonet/node-sdk/commit/b3244becfe9fc3c3e78054180e8e643e4ed7647a))

## [7.0.3](https://github.com/hexonet/node-sdk/compare/v7.0.2...v7.0.3) (2020-04-27)

### Bug Fixes

- **apiclient:** remove deprecated private function toUpperCaseKeys ([f529619](https://github.com/hexonet/node-sdk/commit/f5296199b60d376f152a352aac4db7ead2634a96))

## [7.0.2](https://github.com/hexonet/node-sdk/compare/v7.0.1...v7.0.2) (2020-04-27)

### Bug Fixes

- **npm:** move node-fetch from devDependencies to dependencies ([1c7186b](https://github.com/hexonet/node-sdk/commit/1c7186b50b8fc64d0eff0d9da951eb284e3856b1))

## [7.0.1](https://github.com/hexonet/node-sdk/compare/v7.0.0...v7.0.1) (2020-04-27)

### Bug Fixes

- **npm:** fixed main property path in package.json ([8a24bd5](https://github.com/hexonet/node-sdk/commit/8a24bd57575719f7f8a45fcf28e88c7813e733bd))

# [7.0.0](https://github.com/hexonet/node-sdk/compare/v6.0.2...v7.0.0) (2020-04-24)

### Bug Fixes

- **logger:** align error parameter of logger to be string ([ab1ee02](https://github.com/hexonet/node-sdk/commit/ab1ee02dc67bbbbe550e344db40ef290c5659d06))

### BREAKING CHANGES

- **logger:** log method in Logger class change type of 3rd parameter

## [6.0.2](https://github.com/hexonet/node-sdk/compare/v6.0.1...v6.0.2) (2020-04-20)

### Bug Fixes

- **dep-bump:** replace `request` (deprecated) with `node-fetch`;reviewed linting errors ([427c329](https://github.com/hexonet/node-sdk/commit/427c3292232adad086b2726770d9c5434489f81c)), closes [#190](https://github.com/hexonet/node-sdk/issues/190)

## [6.0.1](https://github.com/hexonet/node-sdk/compare/v6.0.0...v6.0.1) (2020-04-20)

### Bug Fixes

- **dep-bump:** remove dirty-chai (no ts support);deactivate tslint rule no-unused-expression in test ([150ae57](https://github.com/hexonet/node-sdk/commit/150ae57b5c2c477c062970eee40bbfea479a1594))

# [6.0.0](https://github.com/hexonet/node-sdk/compare/v5.6.0...v6.0.0) (2020-04-20)

### Bug Fixes

- **apiclient:** make getPOSTData again public; migrate tests to typescript ([0f6ff13](https://github.com/hexonet/node-sdk/commit/0f6ff135fb0721d51801e8808c56c6b22ff3ca9c))
- **messaging:** return a specific error template in case code or description are missing ([77af837](https://github.com/hexonet/node-sdk/commit/77af8375f86a159e113fde21b0d4e877aca2ea98))
- **security:** make getPOSTData private to not make it accessible from outside ([639c67f](https://github.com/hexonet/node-sdk/commit/639c67ff4f8db9a58b61d2efb6f1e5f489b3114c))
- **security:** replace passwords whereever they could be used for output ([1d53637](https://github.com/hexonet/node-sdk/commit/1d5363777dda7f9be07dbbf9f5a4e3b44a830304))

### Features

- **apiclient:** allow to specify additional libraries via setUserAgent ([5e94ab5](https://github.com/hexonet/node-sdk/commit/5e94ab57fdaf9ee90c58fb97b2c2fd69c173e372))
- **apiclient:** automaitc IDN conversion of API command parameters to punycode ([38018e3](https://github.com/hexonet/node-sdk/commit/38018e358c273edcbfd1c622881a1106ae1690a3))
- **apiclient:** set Proxy, Referer Header; High Performance Connection Setup (see README.md) ([3abc0cc](https://github.com/hexonet/node-sdk/commit/3abc0ccf23c831639cdb3536ac986a03c3e675c0))
- **logger:** possibility to override debug mode's default logging mechanism. See README.md ([e639b6a](https://github.com/hexonet/node-sdk/commit/e639b6a3e8622f6ebd6378173c7184960378f8ef))
- **response:** added getCommandPlain (getting used command in plain text) ([4b9d659](https://github.com/hexonet/node-sdk/commit/4b9d659aa7b20b119c5670085f5005a6ce769dba))
- **response:** possibility of place holder vars in standard responses to improve error details ([aa479bb](https://github.com/hexonet/node-sdk/commit/aa479bb3149870c3872736c8c5191c6b2f3e4d66))

### BREAKING CHANGES

- **logger:** existing logging mechanism (function based) got replaced to be based on an class
  based solution

# [5.6.0](https://github.com/hexonet/node-sdk/compare/v5.5.3...v5.6.0) (2020-03-11)

### Features

- **apiclient:** support bulk parameters as nested array ([b0415fa](https://github.com/hexonet/node-sdk/commit/b0415fa36c9f9586e98598dc0d0e11164f5cea96))

## [5.5.3](https://github.com/hexonet/node-sdk/compare/v5.5.2...v5.5.3) (2019-10-04)

### Bug Fixes

- **responsetemplate/mgr:** improve description of `423 Empty API response` ([f2d31fc](https://github.com/hexonet/node-sdk/commit/f2d31fc))

## [5.5.2](https://github.com/hexonet/node-sdk/compare/v5.5.1...v5.5.2) (2019-09-18)

### Bug Fixes

- **release process:** review configuration file ([630d497](https://github.com/hexonet/node-sdk/commit/630d497))

## [5.5.1](https://github.com/hexonet/node-sdk/compare/v5.5.0...v5.5.1) (2019-08-16)

### Bug Fixes

- **APIClient:** change default SDK url ([3378ee9](https://github.com/hexonet/node-sdk/commit/3378ee9))

# [5.5.0](https://github.com/hexonet/node-sdk/compare/v5.4.2...v5.5.0) (2019-04-16)

### Features

- **responsetemplate:** add isPending method ([3307204](https://github.com/hexonet/node-sdk/commit/3307204))

## [5.4.2](https://github.com/hexonet/node-sdk/compare/v5.4.1...v5.4.2) (2019-04-04)

### Bug Fixes

- **APIClient:** setUserAgent returns APIClient instance now ([c93a21b](https://github.com/hexonet/node-sdk/commit/c93a21b))

## [5.4.1](https://github.com/hexonet/node-sdk/compare/v5.4.0...v5.4.1) (2019-03-29)

### Bug Fixes

- **apiclient:** useragent string missing slashes; security bump; ([2704c7e](https://github.com/hexonet/node-sdk/commit/2704c7e))

# [5.4.0](https://github.com/hexonet/node-sdk/compare/v5.3.0...v5.4.0) (2019-03-07)

### Features

- **user-agent:** added functionality to customize default value ([4406c4e](https://github.com/hexonet/node-sdk/commit/4406c4e))

# [5.3.0](https://github.com/hexonet/node-sdk/compare/v5.2.0...v5.3.0) (2019-03-07)

### Features

- **user-agent:** review user-agent header value ([e182cd4](https://github.com/hexonet/node-sdk/commit/e182cd4))

# [5.2.0](https://github.com/hexonet/node-sdk/compare/v5.1.0...v5.2.0) (2018-11-02)

### Features

- **logger:** possibility to set a customer logger ([4231369](https://github.com/hexonet/node-sdk/commit/4231369))

# [5.1.0](https://github.com/hexonet/node-sdk/compare/v5.0.4...v5.1.0) (2018-10-15)

### Features

- **client:** add getSession method ([c22884c](https://github.com/hexonet/node-sdk/commit/c22884c))

## [5.0.4](https://github.com/hexonet/node-sdk/compare/v5.0.3...v5.0.4) (2018-10-04)

### Bug Fixes

- **CLIENT:** use of fixed version of urlencode ([e067ded](https://github.com/hexonet/node-sdk/commit/e067ded))

Changelog

## [5.0.2](https://github.com/hexonet/node-sdk/compare/v5.0.1...v5.0.2) (2018-09-25)

### Bug Fixes

- **pkg:** update nodejs engine version requirements ([200715f](https://github.com/hexonet/node-sdk/commit/200715f))

### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

### [v5.0.0](https://github.com/hexonet/node-sdk/compare/v4.4.0...v5.0.0) (21 September 2018)

- HM-235 typescript release v5.0.0 [`#1`](https://github.com/hexonet/node-sdk/pull/1)
- HM-235 initial commit [`3f69df6`](https://github.com/hexonet/node-sdk/commit/3f69df6c9f3173c5d179846ac540fbb8d9161ffc)
- HM-329 changed changelog template [`31d049f`](https://github.com/hexonet/node-sdk/commit/31d049f9050db890d7023d3af1d9c0c2a006ab6b)
- HM-235 fix: version script [`ba56ceb`](https://github.com/hexonet/node-sdk/commit/ba56ceb7154ab6a901f296d40978fbea67ef3d89)
- Update README.md [`9091438`](https://github.com/hexonet/node-sdk/commit/90914384d5f8156341c8681854bb8716d4245635)

#### [v4.4.0](https://github.com/hexonet/node-sdk/compare/v4.3.9...v4.4.0) (4 July 2018)

- added sdk documentation and generator [`3485a78`](https://github.com/hexonet/node-sdk/commit/3485a7896b4dcf323ec62914ace1dc9670c0f911)
- Update README.md [`8d1dc18`](https://github.com/hexonet/node-sdk/commit/8d1dc18ba328239a9188ae941a296363e98c5f94)
- Create CONTRIBUTING.md [`940a3b4`](https://github.com/hexonet/node-sdk/commit/940a3b4e9e0121e7b0cdd2accf1f2a7014c89e56)
- reviewed scripts (changelog + sdk doc) [`a11580e`](https://github.com/hexonet/node-sdk/commit/a11580e0e06736b77567eb732cc1788a1449b99e)

#### [v4.3.9](https://github.com/hexonet/node-sdk/compare/v4.3.8...v4.3.9) (2 July 2018)

- Review version scripts to simplify and improve CI [`2e13c83`](https://github.com/hexonet/node-sdk/commit/2e13c831694a61ca03447b017a981ddfae2affd7)

#### [v4.3.8](https://github.com/hexonet/node-sdk/compare/v4.3.7...v4.3.8) (29 June 2018)

- readme: updated npm package version badge [`3362aed`](https://github.com/hexonet/node-sdk/commit/3362aede8c1a42fca974e5373e46faa015306e2b)
- readme: add license and contribute badge [`b9af3ee`](https://github.com/hexonet/node-sdk/commit/b9af3eea5ca4f9a68960901d4b6e8ea070a960af)
- readme: added dependencies check badge [`6a967a7`](https://github.com/hexonet/node-sdk/commit/6a967a79b87d9506c738519ac336c400bbb69ed0)
- readme: added npm package version badge [`184b4c9`](https://github.com/hexonet/node-sdk/commit/184b4c97ec43ef6b41f53b3fddea8c8cef95c36e)
- readme: added slack chat badge [`f4be0a8`](https://github.com/hexonet/node-sdk/commit/f4be0a8643c6c69338edcb04001bea4604d0e6bb)
- readme: add nodejs version badge [`adc868f`](https://github.com/hexonet/node-sdk/commit/adc868ffa532ba89556d08dcf0660e200e513a4b)
- readme: add license badge [`4ef02b9`](https://github.com/hexonet/node-sdk/commit/4ef02b9610934d760d1313735dfaef8b26d28b1c)

#### [v4.3.7](https://github.com/hexonet/node-sdk/compare/v4.3.6...v4.3.7) (28 June 2018)

- dep bump [`6670210`](https://github.com/hexonet/node-sdk/commit/6670210872477f264ac743e083f584605bc8bf43)

#### [v4.3.6](https://github.com/hexonet/node-sdk/compare/v4.3.5...v4.3.6) (28 June 2018)

- review github configuration in readme [`c452693`](https://github.com/hexonet/node-sdk/commit/c4526933270ee163ae6f65a36fd41a0de00ff174)

#### [v4.3.5](https://github.com/hexonet/node-sdk/compare/v4.3.4...v4.3.5) (28 June 2018)

#### [v4.3.4](https://github.com/hexonet/node-sdk/compare/v4.3.3...v4.3.4) (28 June 2018)

- set auto-changelog's commit-limit to infinite [`373a9ea`](https://github.com/hexonet/node-sdk/commit/373a9ea2648c9a206fc7c8ce886f0decfcce3b3c)

#### [v4.3.3](https://github.com/hexonet/node-sdk/compare/v4.3.2...v4.3.3) (28 June 2018)

- review publish script to commit commits and tags [`e0d0e00`](https://github.com/hexonet/node-sdk/commit/e0d0e00541be987c3cdc4398e96fbd05930e1c32)

#### [v4.3.2](https://github.com/hexonet/node-sdk/compare/v4.3.1...v4.3.2) (28 June 2018)

- added publish script to improve [`fd72fd5`](https://github.com/hexonet/node-sdk/commit/fd72fd5282a2f18f0a70ae253e48c366455a57d1)

#### [v4.3.1](https://github.com/hexonet/node-sdk/compare/v4.3.0...v4.3.1) (28 June 2018)

- initial review after package scoping [`63c0005`](https://github.com/hexonet/node-sdk/commit/63c00055e293a1de3fe45ebb66196c505f7a82e2)
- migrate to @hexonet scope [`0bc5589`](https://github.com/hexonet/node-sdk/commit/0bc55891b0c398e2cdc8e02904989bf6bee8f803)

#### [v4.3.0](https://github.com/hexonet/node-sdk/compare/v4.2.0...v4.3.0) (27 June 2018)

- security dep bump [`923dec6`](https://github.com/hexonet/node-sdk/commit/923dec661ebfcd207f4efb9471a5a4ae2aa52afe)

#### [v4.2.0](https://github.com/hexonet/node-sdk/compare/v4.1.3...v4.2.0) (27 June 2018)

- updated project metadata after transfer to github.com [`a4df177`](https://github.com/hexonet/node-sdk/commit/a4df177d6ef155a54beee3163860d0472ebd825a)

#### [v4.1.3](https://github.com/hexonet/node-sdk/compare/v4.1.2...v4.1.3) (22 May 2018)

- AMZ-24 fix check [`fbff600`](https://github.com/hexonet/node-sdk/commit/fbff60048ea6bca0f0c810ab2748fe89c2ccb28b)

#### [v4.1.2](https://github.com/hexonet/node-sdk/compare/v4.1.0...v4.1.2) (22 May 2018)

- FNODE-271 dep bump [`#9`](https://github.com/hexonet/node-sdk/pull/9)
- AMZ-24 add additional error event listener [`55219ee`](https://github.com/hexonet/node-sdk/commit/55219eeb42a1b1f99d680ab0a43add6493a43860)

#### [v4.1.0](https://github.com/hexonet/node-sdk/compare/v4.0.18...v4.1.0) (29 September 2017)

- FNODE-268 automatic changelog [`d35e0b8`](https://github.com/hexonet/node-sdk/commit/d35e0b8ee75decb0ff8676b02d34d10769d2b1c2)

#### [v4.0.18](https://github.com/hexonet/node-sdk/compare/v4.0.17...v4.0.18) (31 August 2017)

- FNODE-222 fix check [`ad65a23`](https://github.com/hexonet/node-sdk/commit/ad65a239da93478103a46bc3d1060159dd8249dd)
- FNODE-222 review check [`c87ccb2`](https://github.com/hexonet/node-sdk/commit/c87ccb2ae6d1413fc5268f2ffd80677baeadbab6)

#### [v4.0.17](https://github.com/hexonet/node-sdk/compare/v4.0.16...v4.0.17) (31 August 2017)

- FNODE-222 added error output [`#8`](https://github.com/hexonet/node-sdk/pull/8)
- FNODE-245 beautified [`ce6490e`](https://github.com/hexonet/node-sdk/commit/ce6490e94dedb149ed4fd888e48229554b432f28)
- fix: timestamp for 4.0.16 release [`cafa565`](https://github.com/hexonet/node-sdk/commit/cafa56525092cdd584b69baf1699c495d83cb73b)

#### [v4.0.16](https://github.com/hexonet/node-sdk/compare/v4.0.15...v4.0.16) (24 August 2017)

- FNODE-245 dep bump; updated changelog [`77c388f`](https://github.com/hexonet/node-sdk/commit/77c388f1b73996ea6f8eaf7c2ed3258143c2577d)
- FNODE-245 sentry #1785 [`11f00c8`](https://github.com/hexonet/node-sdk/commit/11f00c8db49b15f6ceb839b7464234ae75f93755)
- fix changelog [`db840f8`](https://github.com/hexonet/node-sdk/commit/db840f83061c7d2dcaf648eaa0b20788d9793d17)

#### [v4.0.15](https://github.com/hexonet/node-sdk/compare/v4.0.14...v4.0.15) (12 July 2017)

- FNODE-222 dep bump, test review [`55ca42c`](https://github.com/hexonet/node-sdk/commit/55ca42cf6094a9641c8c42393bc223d20a442448)

#### [v4.0.14](https://github.com/hexonet/node-sdk/compare/v4.0.13...v4.0.14) (12 July 2017)

- FNODE-198 fix hostname usage [`a274456`](https://github.com/hexonet/node-sdk/commit/a2744568afe204b965d92e882e8d19630f73723c)
- FNODE-198 reviewed changelog [`f365484`](https://github.com/hexonet/node-sdk/commit/f365484a25bad3a84fa1b20a4fb256c331136e28)

#### [v4.0.13](https://github.com/hexonet/node-sdk/compare/v4.0.12...v4.0.13) (3 April 2017)

- FCP3-1755 reviewed nyc exclude options [`3c322fb`](https://github.com/hexonet/node-sdk/commit/3c322fb9e7f022597d4c4fbba4c20d781169e211)

#### [v4.0.12](https://github.com/hexonet/node-sdk/compare/v4.0.11...v4.0.12) (3 April 2017)

- FCP3-1755 review automated tests [`0e7728d`](https://github.com/hexonet/node-sdk/commit/0e7728df08512d47875b9196936b6bfac4add726)

#### [v4.0.11](https://github.com/hexonet/node-sdk/compare/v4.0.10...v4.0.11) (20 March 2017)

- FCP3-1510 reviewed unauthorized template [`75f7364`](https://github.com/hexonet/node-sdk/commit/75f73643b563f69fa781ca72ba7c8fe400b038d7)

#### [v4.0.10](https://github.com/hexonet/node-sdk/compare/v4.0.9...v4.0.10) (20 March 2017)

- FCP3-1510 renamed template [`7bac0fc`](https://github.com/hexonet/node-sdk/commit/7bac0fc1481201876786f624c6a555f7cc22aa9e)
- FCP3-1510 invalidurltoken template [`1382ee9`](https://github.com/hexonet/node-sdk/commit/1382ee9c2c2f78926aa6e0399e4c3f6f7ccd49cd)

#### [v4.0.9](https://github.com/hexonet/node-sdk/compare/v4.0.8...v4.0.9) (13 March 2017)

- FNODE-198 review changelog [`4c0fa96`](https://github.com/hexonet/node-sdk/commit/4c0fa96813def2236cb18cc73bac4360f74e3331)

#### [v4.0.8](https://github.com/hexonet/node-sdk/compare/v4.0.7...v4.0.8) (13 March 2017)

- FNODE-198 drop out Expect header usage [`f939b99`](https://github.com/hexonet/node-sdk/commit/f939b99aa8c89e69dccd339971a409efe87053dc)

#### [v4.0.7](https://github.com/hexonet/node-sdk/compare/v4.0.6...v4.0.7) (6 March 2017)

- FCP3-1494 added 500 Internal server error tpl [`d8b0a5e`](https://github.com/hexonet/node-sdk/commit/d8b0a5e61f7fb4b32cf76de9839267df1df2fefd)

#### [v4.0.6](https://github.com/hexonet/node-sdk/compare/v4.0.5...v4.0.6) (27 February 2017)

- minor code review [`3f38a63`](https://github.com/hexonet/node-sdk/commit/3f38a632c2fd85abcbfe5ec1da199a886ce4ef9c)
- updated changelog [`2b9944c`](https://github.com/hexonet/node-sdk/commit/2b9944c97b6fc711f81d4ff62da9bec30f1d0dff)

#### [v4.0.5](https://github.com/hexonet/node-sdk/compare/v4.0.4...v4.0.5) (15 February 2017)

- FCP3-1091 added test case [`b770314`](https://github.com/hexonet/node-sdk/commit/b7703141e7addf8f056e3c28df199430a45294c2)
- FCP3-1091 reviewed .gitignore [`08eb30d`](https://github.com/hexonet/node-sdk/commit/08eb30d4c9003c37dfef82903f027ee962ef1158)

#### [v4.0.4](https://github.com/hexonet/node-sdk/compare/v4.0.3...v4.0.4) (13 February 2017)

- FCP3-1411 logout bugfix [`1db9750`](https://github.com/hexonet/node-sdk/commit/1db9750476ca57cf54ef0dd89bc4e5857bccec90)

#### [v4.0.3](https://github.com/hexonet/node-sdk/compare/v4.0.2...v4.0.3) (9 February 2017)

- review readme and changelog [`7eb66be`](https://github.com/hexonet/node-sdk/commit/7eb66bed37674f9ce9d436d18c4628136c3c2e39)
- drop history file [`7831dc9`](https://github.com/hexonet/node-sdk/commit/7831dc9a574b3c40505308cf895e8a7d5770b54d)
- Update README.md [`fc84a53`](https://github.com/hexonet/node-sdk/commit/fc84a5321bf3bca7ef64f56b51264382b445040d)
- Update README.md [`2dfc8a1`](https://github.com/hexonet/node-sdk/commit/2dfc8a1aff8cabd86a7b7de0665cc4094dd541c1)
- Update README.md [`2d10235`](https://github.com/hexonet/node-sdk/commit/2d1023508a2256fae6abebb2d3c1c65e0264d7ae)
- correct version number [`d79fce3`](https://github.com/hexonet/node-sdk/commit/d79fce3f8c92db815bf80461fcf579b3d9f4e3a6)
- Update README.md [`18e691a`](https://github.com/hexonet/node-sdk/commit/18e691ac5619b4dc164894b46bbe69689b8e31ff)

#### [v4.0.2](https://github.com/hexonet/node-sdk/compare/v4.0.1...v4.0.2) (9 February 2017)

- FCP3-1321 added npm badges to readme [`d16c90c`](https://github.com/hexonet/node-sdk/commit/d16c90c33e2f89c47f7090e98d3c79ef5a4e7fee)

#### [v4.0.1](https://github.com/hexonet/node-sdk/compare/v4.0.0...v4.0.1) (9 February 2017)

- FCP3-1321 usage of nock module WOOOOW!!! [`ce57b5b`](https://github.com/hexonet/node-sdk/commit/ce57b5b99d67d8e2fb0bcb0392cf40b90a1df25e)
- FCP3-1321 Update History.md [`ae7923c`](https://github.com/hexonet/node-sdk/commit/ae7923cceb50af841a415f9fe93b33d9a51eaa93)
- Updated History.md [`8de0e05`](https://github.com/hexonet/node-sdk/commit/8de0e059ba3b30ed8090c345b434036be197e3ec)

### [v4.0.0](https://github.com/hexonet/node-sdk/compare/v3.5.11...v4.0.0) (3 February 2017)

- FCP3-1019 backup current status [`e0491ad`](https://github.com/hexonet/node-sdk/commit/e0491ad94cca1dea926b589cf5f8d38e3eae9dd6)
- adding beautifier/validator settings [`fe4dc73`](https://github.com/hexonet/node-sdk/commit/fe4dc734e1efdc01d4281ad1e5d51dfdc9703c7a)
- Added History.md [`aa62cfd`](https://github.com/hexonet/node-sdk/commit/aa62cfd71dfc6169eb4226f1c0db2320c27f445b)
- set old version id [`4bf633a`](https://github.com/hexonet/node-sdk/commit/4bf633a48b8a73e5471050059c9e094552789576)

#### [v3.5.11](https://github.com/hexonet/node-sdk/compare/v3.5.10...v3.5.11) (29 November 2016)

- FNODE-183 updated README.md [`cd8775e`](https://github.com/hexonet/node-sdk/commit/cd8775ea26f2df38a16c70d91da034b5bff0ee63)

#### [v3.5.10](https://github.com/hexonet/node-sdk/compare/v3.5.9...v3.5.10) (29 November 2016)

- FNODE-183 provide error event fallback [`7631666`](https://github.com/hexonet/node-sdk/commit/76316667de83fba417ae4e3bc28be3eb76663b91)

#### [v3.5.9](https://github.com/hexonet/node-sdk/compare/v3.5.8...v3.5.9) (21 October 2016)

- FCP3-603 move console.log to FNODE [`76dd81d`](https://github.com/hexonet/node-sdk/commit/76dd81d169ae3d203f2e8f54c05c768d7049e8a7)

#### [v3.5.8](https://github.com/hexonet/node-sdk/compare/v3.5.7...v3.5.8) (20 October 2016)

- FCP3-603 session logging; added response tpl [`7007de7`](https://github.com/hexonet/node-sdk/commit/7007de72ce5d0567b2ff436fac2702a395c5e76e)

#### [v3.5.7](https://github.com/hexonet/node-sdk/compare/v3.5.6...v3.5.7) (21 September 2016)

- HBR-115 cleanup of spaces in property names [`db7eabd`](https://github.com/hexonet/node-sdk/commit/db7eabd01de3a9a6a673381ea1d020a0f25de024)

#### [v3.5.6](https://github.com/hexonet/node-sdk/compare/v3.5.5...v3.5.6) (14 September 2016)

- FNODE-165 extended default template support [`7c86578`](https://github.com/hexonet/node-sdk/commit/7c86578d824bbd6511da7abf08d292bbdd896a9c)

#### [v3.5.5](https://github.com/hexonet/node-sdk/compare/v3.5.4...v3.5.5) (14 September 2016)

- FNODE-165 review template handling [`1ac7136`](https://github.com/hexonet/node-sdk/commit/1ac7136fb097a80574ed005ba53852f9be23f7ea)

#### [v3.5.4](https://github.com/hexonet/node-sdk/compare/v3.5.3...v3.5.4) (1 September 2016)

- FNODE-173 fix issue (session expired) [`3163432`](https://github.com/hexonet/node-sdk/commit/31634323f4758f91d120567bb7bc35b0f77c5e1c)
- FNODE-172 revalidated source [`044d76b`](https://github.com/hexonet/node-sdk/commit/044d76bc832617a5cd2d91e695dc7f70c057078d)

#### [v3.5.3](https://github.com/hexonet/node-sdk/compare/v3.5.2...v3.5.3) (31 August 2016)

- FNODE-172 allow startsession command parameters [`3060f18`](https://github.com/hexonet/node-sdk/commit/3060f1868b0569d0f6ae890ceeb1332bac4816f4)

#### [v3.5.2](https://github.com/hexonet/node-sdk/compare/v3.5.1...v3.5.2) (19 August 2016)

- FCP3-208 align error message to API msg'ing [`c9b43b1`](https://github.com/hexonet/node-sdk/commit/c9b43b13558b9d1a557f638e254698390fc08638)
- FCP3-208 added TRANSLATIONKEY [`654d563`](https://github.com/hexonet/node-sdk/commit/654d563327079ef1d832b0f890a948816d7290ab)

#### [v3.5.1](https://github.com/hexonet/node-sdk/compare/v3.5.0...v3.5.1) (19 August 2016)

- FCP3-208 reviewed session error message [`7900a03`](https://github.com/hexonet/node-sdk/commit/7900a03d6bb3f4b0ea3b5949254400d236d3e4c0)
- FCP3-208 reviewed session error message [`d3dc093`](https://github.com/hexonet/node-sdk/commit/d3dc0932a45194e2174d2149dc7765c6210c71c2)

#### [v3.5.0](https://github.com/hexonet/node-sdk/compare/v3.4.1...v3.5.0) (28 July 2016)

- FNODE-157 added no-session possibility [`a4d67bb`](https://github.com/hexonet/node-sdk/commit/a4d67bbff6d86760c5158d5e4bd316f0118a3354)

#### [v3.4.1](https://github.com/hexonet/node-sdk/compare/v3.4.0...v3.4.1) (7 June 2016)

- FCP3-128 fix: command usage [`f592664`](https://github.com/hexonet/node-sdk/commit/f59266469ab316e170cecd9dfbd0614fac253594)

#### [v3.4.0](https://github.com/hexonet/node-sdk/compare/v3.3.0...v3.4.0) (6 June 2016)

- FCP3-128 reviewed response handling [`e7cbeae`](https://github.com/hexonet/node-sdk/commit/e7cbeaecf33051908dadf8853bd6b51477610798)
- FCP3-128 revalidated source code [`2ec3167`](https://github.com/hexonet/node-sdk/commit/2ec3167a430a2377dbba25d9a9e06e0854264b92)

#### [v3.3.0](https://github.com/hexonet/node-sdk/compare/v3.2.0...v3.3.0) (19 April 2016)

- FNODE-132 updated timeout value + error response [`0dcfd13`](https://github.com/hexonet/node-sdk/commit/0dcfd1355bf21e8ca727fd72ce90378d14bf44f1)

#### [v3.2.0](https://github.com/hexonet/node-sdk/compare/v3.1.0...v3.2.0) (4 March 2016)

- FNODE-124 check for valid socket cfg [`8a61287`](https://github.com/hexonet/node-sdk/commit/8a61287b9e56a18c4253a8cef0caeb7f49328e14)

#### [v3.1.0](https://github.com/hexonet/node-sdk/compare/v3.0.0...v3.1.0) (3 March 2016)

- reviewed README for better understanding [`eeb7488`](https://github.com/hexonet/node-sdk/commit/eeb7488d1fc7125806aa48960ce165e5fbccf025)

### [v3.0.0](https://github.com/hexonet/node-sdk/compare/v2.7.0...v3.0.0) (7 January 2016)

- FNODE-92 review to support new api session behavior [`4c0ff91`](https://github.com/hexonet/node-sdk/commit/4c0ff910cbb39d1cdfc6e3dde3276e032a859b9f)

#### [v2.7.0](https://github.com/hexonet/node-sdk/compare/v2.6.0...v2.7.0) (5 November 2015)

- FNODE-88 review README.md for working example [`52fb1d2`](https://github.com/hexonet/node-sdk/commit/52fb1d2c4198922be5289b45a59bdd15350975e6)

#### [v2.6.0](https://github.com/hexonet/node-sdk/compare/v2.5.0...v2.6.0) (5 November 2015)

- FNODE-85 fix [`b2666f4`](https://github.com/hexonet/node-sdk/commit/b2666f49cf9b88d482fdd4ab7a556428b62ee4cd)

#### [v2.5.0](https://github.com/hexonet/node-sdk/compare/v2.4.0...v2.5.0) (5 November 2015)

- FNODE-85 fix [`d57550f`](https://github.com/hexonet/node-sdk/commit/d57550f80aef88693c5db25b16ba0da16b6b2748)

#### [v2.4.0](https://github.com/hexonet/node-sdk/compare/v2.3.0...v2.4.0) (5 November 2015)

- FNODE-85 jsdoc updates [`4003374`](https://github.com/hexonet/node-sdk/commit/4003374c807860192f7713ddf6f40a09355a3a70)

#### [v2.3.0](https://github.com/hexonet/node-sdk/compare/v2.2.0...v2.3.0) (28 October 2015)

- reviewed comments [`fd53816`](https://github.com/hexonet/node-sdk/commit/fd53816e5327c5c7ec7201a7900ad0ace622320e)

#### [v2.2.0](https://github.com/hexonet/node-sdk/compare/v2.1.0...v2.2.0) (8 October 2015)

- FNODE-74 added keywords [`5f7e9f6`](https://github.com/hexonet/node-sdk/commit/5f7e9f6fd59bb7d6571b72ce569183320c572cc9)

#### [v2.1.0](https://github.com/hexonet/node-sdk/compare/v2.0.0...v2.1.0) (21 September 2015)

- FNODE-52 ispapi-apiconnector review [`69d3638`](https://github.com/hexonet/node-sdk/commit/69d36383b68bceafeec4f49a0fe2100d15ce0c74)

### [v2.0.0](https://github.com/hexonet/node-sdk/compare/v0.6.0...v2.0.0) (21 September 2015)

- FNODE-52 rewrite to factory model [`a3213c5`](https://github.com/hexonet/node-sdk/commit/a3213c5bdff523a007a424279c2a42f8b0ed00df)
- renamed package [`f56cbca`](https://github.com/hexonet/node-sdk/commit/f56cbcaa602bc9391adc8469abb42e4a81edc7b3)
- added beautifier config file [`2e1d89f`](https://github.com/hexonet/node-sdk/commit/2e1d89f2e2adcc59c9d11833edd4acb44cd8409c)
- FNODE-44 updated .gitignore [`6dc162f`](https://github.com/hexonet/node-sdk/commit/6dc162f88aae7d87d51a3071ee6dafc8fcd1fe5a)

#### [v0.6.0](https://github.com/hexonet/node-sdk/compare/v0.5.0...v0.6.0) (30 July 2015)

- added timeout support [`8dfa754`](https://github.com/hexonet/node-sdk/commit/8dfa75462e7f04d3fc4982c1fb59683feff1f08a)

#### [v0.5.0](https://github.com/hexonet/node-sdk/compare/v0.3.0...v0.5.0) (9 July 2015)

- Validationbeautifyreview [`#1`](https://github.com/hexonet/node-sdk/pull/1)
- fix typo [`5a607e2`](https://github.com/hexonet/node-sdk/commit/5a607e2ce270ddc611aec014db6c9f36b267b158)
- added missing comment [`3d7986b`](https://github.com/hexonet/node-sdk/commit/3d7986b7a3afa650ff47ea67af35a468e990573b)

#### [v0.3.0](https://github.com/hexonet/node-sdk/compare/v0.2.0...v0.3.0) (23 June 2015)

- decrease required node.js version dependency [`c364aec`](https://github.com/hexonet/node-sdk/commit/c364aec6d170b447a9cc0abd373190415216bdc6)

#### v0.2.0 (22 June 2015)

- validated / beautified src code [`b152ee6`](https://github.com/hexonet/node-sdk/commit/b152ee619902baa188e96a0032ca578e114cec14)
- changed License section [`22ba165`](https://github.com/hexonet/node-sdk/commit/22ba165e2627c3531147e450f8df86444a635266)
- review [`eb09514`](https://github.com/hexonet/node-sdk/commit/eb095141e383825683f6b05e06420b4c8d050ee8)
- subuser support [`2ee39a0`](https://github.com/hexonet/node-sdk/commit/2ee39a04f33ec698f7bdd0784a93660879501a11)
- added .gitignore for eclipse project files [`eb5dbdb`](https://github.com/hexonet/node-sdk/commit/eb5dbdb8d3eff2ce46ddb106e39e636c155a9406)
- TCPBACK-4 #close [`da14161`](https://github.com/hexonet/node-sdk/commit/da14161fff8e307cbabf80fc9ae2acdccbb86cd3)
- Start repo [`d199c33`](https://github.com/hexonet/node-sdk/commit/d199c336b8b3f43d166f76dc945a6b58e8fccbb9)
