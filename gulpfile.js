"use strict";

var path = require('path');

global.argv = require('yargs').argv;
global.appiumRoot = process.env.APPIUM_ROOT;
global.artifactsDir = path.resolve(process.env.APPIUM_ROOT, 'artifacts');
global.outputDir = path.resolve(process.env.APPIUM_ROOT, 'output');
global.inputDir = path.resolve(process.env.APPIUM_ROOT, 'input');

console.log('global.appiumRoot -->', global.appiumRoot);

require('./tasks/dev');
require('./tasks/commons');
require('./tasks/build');
require('./tasks/unit-tests');
require('./tasks/android-build');
require('./tasks/android-e2e');

