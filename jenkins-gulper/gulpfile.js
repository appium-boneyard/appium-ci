"use strict";
var gulp = require('gulp'),
    boilerplate = require('appium-gulp-plugins')
      .boilerplate.use(gulp);
boilerplate({
  build: 'jenkins-gulper',
  files: ['**/*.js','!node_modules/**'],
  test: false,
  transpile: false});

require('./tasks/commons');
require('./tasks/build');
require('./tasks/unit-tests');
require('./tasks/ios-build');
require('./tasks/ios-e2e');
require('./tasks/android-build');
require('./tasks/android-e2e');
require('./tasks/xunit');

