/* eslint-disable promise/prefer-await-to-then */
"use strict";

const gulp = require('gulp');
const Q = require('q');
const runSequence = Q.denodeify(require('run-sequence'));
const utils = require('../lib/utils');
const path = require('path');
const _ = require('underscore');

gulp.task('run-android-e2e-worker', ['prepare-dirs'], function () {
  return runSequence('download-scp-build', 'expand-build')
    .then(function () {
      return utils.smartSpawn('gulp', [
        'show-android-e2e-tests-split',
        '--color',
        '--testSplit=' + global.argv.numOfSplits
      ], {
        print: 'Showing test split',
        cwd: global.appiumRoot
      }).promise;
    }).then(function () {
      const env = _.clone(process.env);
      const reportBase = 'report' + ((process.env.BUILD_NUMBER) ? '-' + process.env.BUILD_NUMBER : '');
      env.MOCHA_REPORTER = 'mocha-jenkins-reporter';
      env.JUNIT_REPORT_PATH = path.resolve(
          global.reportsDir,
          reportBase +'.xml');
      env.JUNIT_REPORT_STACK = 1;

      return utils.smartSpawn('gulp', [
        'run-android-e2e',
        '--color',
        '--avd=' + global.argv.avd,
        '--testSplit=' + global.argv.numOfSplits,
        '--testGroup=' + global.argv.split
      ], {
        print: 'Showing test split',
        cwd: global.appiumRoot,
        env,
      }).promise;
    }).fin(function () {
      return utils.uploadReports();
    });
});
