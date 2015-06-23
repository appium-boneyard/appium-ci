"use strict";

var gulp = require('gulp'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

var argv = require('yargs').argv;

boilerplate({
  build: 'sample-ios-project',
  jscs: false,
  e2eTest: {
    ios: true,
    xCodeVersion: argv.xcodeVersion || '6.1.1'
  }
});
