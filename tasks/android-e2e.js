"use strict";

var gulp = require('gulp'),
    Q = require('q'),
    runSequence = Q.denodeify(require('run-sequence')),
    utils = require('../lib/utils'),
    path = require('path'),
    _ = require('underscore');

var appiumRoot = global.appiumRoot;
var argv = global.argv;

gulp.task('run-android-e2e-worker',
    ['prepare-dirs'],function () {
  return runSequence('download-build','expand-build')
    .then(function () {
      return utils.smartSpawn('gulp', [
        'show-android-e2e-tests-split',
        '--color',
        '--androidTestSplit=' + argv.numOfSplits
      ], {
        print: 'Showing test split',
        cwd: appiumRoot
      }).promise;
    }).then(function () {
      var env = _.clone(process.env);
      env.MOCHA_REPORTER = 'mocha-jenkins-reporter';
      env.JUNIT_REPORT_PATH = path.resolve(
          global.artifactsDir,
          'report' + ((env.BUILD_NUMBER) ? '-' + env.BUILD_NUMBER : '') +'.xml');
      env.JUNIT_REPORT_STACK = 1;

      return utils.smartSpawn('gulp', [
        'run-android-e2e',
        '--color',
        '--avd=' + argv.avd,
        '--androidTestSplit=' + argv.numOfSplits,
        '--androidTestGroup=' + argv.split
      ], {
        print: 'Showing test split',
        cwd: appiumRoot,
        env: env
      }).promise;
    });
});

