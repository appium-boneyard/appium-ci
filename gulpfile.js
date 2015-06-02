"use strict";

var gulp = require('gulp'),
    _ = require('lodash'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp),
    DEFAULTS = require('appium-gulp-plugins').boilerplate.DEFAULTS || {};

var argv = require('yargs').argv;

var e2eFiles = _(argv).pick('android', 'ios').map(function (arg) {
  return '${testDir}/**/' + arg  + '/*-e2e-specs.js';
}).value();

console.log('using e2eFiles ->', e2eFiles);

boilerplate({
  build: 'appium-ci',
  jscs: false,
  e2eTest: _.defaults({
    files: e2eFiles
  }, DEFAULTS.e2eTest)
});
