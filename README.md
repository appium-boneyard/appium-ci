appium-ci
===================

Some libraries used to deploy CI for the various appium packages.

## Status

[![Build Status](https://travis-ci.org/appium/appium-ci.svg)](https://travis-ci.org/appium/appium-ci) [![Greenkeeper badge](https://badges.greenkeeper.io/appium/appium-ci.svg)](https://greenkeeper.io/)

## Watch

```
npm run watch
```

## Test

```
npm test
```

## Android emulator

### Sample Code

```js
import { AndroidEmulator } from 'appium-ci';

let runTests = async () => {
  let emu = new AndroidEmulator('NEXUS_S_18_X86');
  emu.start();
  await emu.waitTillReady();

  // ... do something

  await emu.stop();
};
```
