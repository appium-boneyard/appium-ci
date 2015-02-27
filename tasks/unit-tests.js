"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path'),
    _ = require('underscore');

var appiumRoot = global.appiumRoot;

gulp.task('run-unit-tests',
    ['prepare-output-dirs', 'appium-npm-install'],function () {
  var env = _.clone(process.env);

  env.MOCHA_REPORTER = 'mocha-jenkins-reporter';
  env.JUNIT_REPORT_PATH = path.resolve(
    global.outputDir,
    'report' + ((env.BUILD_NUMBER) ? '-' + env.BUILD_NUMBER : '') +'.xml');
  env.JUNIT_REPORT_STACK = 1;

  return utils.smartSpawn(
    path.resolve(appiumRoot, 'node_modules/.bin/gulp'),
    ['--color'],
    {
      print: 'Running Appium unit tests',
      cwd: appiumRoot,
      env: env,
   }
  ).promise;
});

// for backward compatibility
gulp.task('run-appium-unit-tests', ['run-unit-tests']);
