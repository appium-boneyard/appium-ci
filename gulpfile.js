"use strict";

var path = require('path');

global.argv = require('yargs').argv;
global.appiumRoot = process.env.APPIUM_ROOT;
global.artefactsDir = path.resolve(process.env.APPIUM_ROOT, 'artefacts');
global.outputDir = path.resolve(process.env.APPIUM_ROOT, 'output');

console.log('global.appiumRoot -->', global.appiumRoot);

require('./tasks/dev');
require('./tasks/commons');
require('./tasks/appium-unit-tests');
