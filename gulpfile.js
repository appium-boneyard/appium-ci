'use strict';

const gulp = require('gulp');
const _ = require('lodash');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

const argv = require('yargs').argv;

const e2eFiles = _(argv).pick('android', 'ios').map(function (v, k) {
  return '${testDir}/e2e/' + k + '/*-e2e-specs.js';
}).value();

boilerplate({
  build: 'appium-ci',
  e2eTest: {
    files: e2eFiles
  }
});
