"use strict";

var path = require('path');

global.argv = require('yargs').argv;
global.appiumRoot = process.env.APPIUM_ROOT;
global.artifactsDir = path.resolve(process.env.APPIUM_ROOT, 'artifacts');
global.outputDir = path.resolve(process.env.APPIUM_ROOT, 'output');
global.inputDir = path.resolve(process.env.APPIUM_ROOT, 'input');
global.sideDisk = '/Volumes/SIDE';
global.sideSims = path.resolve(global.sideDisk, 'sims');
global.ciRootUrl = process.env.HUDSON_URL;

console.log('global.appiumRoot -->', global.appiumRoot);
console.log('global.ciRootUrl -->', global.ciRootUrl);

require('./tasks/dev');
require('./tasks/commons');
require('./tasks/build');
require('./tasks/unit-tests');
require('./tasks/ios-build');
require('./tasks/ios-e2e');
require('./tasks/android-build');
require('./tasks/android-e2e');
require('./tasks/xunit');

