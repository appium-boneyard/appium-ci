"use strict";

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

const argv = require('yargs').argv;

boilerplate({
  build: 'sample-ios-project',
  e2eTest: {
    ios: true,
    xCodeVersion: argv.xcodeVersion || '6.1.1'
  }
});
