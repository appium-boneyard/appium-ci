'use strict';

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'jenkins-gulper',
  files: ['**/*.js', '!node_modules/**'],
  test: false,
  transpile: false
});

global.xCodeVersion = '7.2';

require('./tasks/commons');
require('./tasks/build');
require('./tasks/unit-tests');
require('./tasks/ios-build');
require('./tasks/ios-e2e');
require('./tasks/android-build');
require('./tasks/android-e2e');
require('./tasks/xunit');
