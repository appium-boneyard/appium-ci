"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path'),
    _ = require('underscore');

var argv = global.argv;

gulp.task('run-appium-unit-tests',function () {
  var env = _.clone(process.env);
  env.MOCHA_REPORTER = 'spec';

  return utils.smartSpawn(
    path.resolve(argv.appiumRoot, 'node_modules/.bin/gulp'),
    ['--color'],
    {
      logFile: argv.logFile,
      cwd: argv.appiumRoot,
      env: env
    }
  ).promise;
});
