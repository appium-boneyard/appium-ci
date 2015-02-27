"use strict";

global.argv = require('yargs').argv;
global.mochaReporter = 'tap';

require('./tasks/dev');
require('./tasks/appium-unit-tests');
