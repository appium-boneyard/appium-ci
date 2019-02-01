/* eslint-disable promise/prefer-await-to-then */
'use strict';

const gulp = require('gulp');
const Q = require('q');
const runSequence = Q.denodeify(require('run-sequence'));
const utils = require('../lib/utils');
const path = require('path');
const _ = require('underscore');

gulp.task('run-ios-e2e-worker', gulp.series('prepare-dirs', function () {
  return runSequence('download-scp-build', 'expand-build')
    .then(function () {
      return utils.smartSpawn('gulp', [
        'show-ios-e2e-tests-split',
        '--color',
        `--testSplit=${global.argv.numOfSplits}`,
      ], {
        print: 'Showing test split',
        cwd: global.appiumRoot
      }).promise;
    }).then(function () {
      return utils.smartSpawn('sudo', [
        'pkill',
        '-fi',
        'instruments',
        'simulator'
      ], {
        print: 'Killing Instruments + Simulator',
        cwd: global.appiumRoot
      }).promise.catch(function () {});
    }).then(function () {
      return utils.configureXcode(global.xCodeVersion);
    }).then(function () {
      return utils.resetSims();
    }).then(function () {
      return utils.setIosSimulatorScale();
    }).then(function () {
      return utils.smartSpawn('sudo', [
        './bin/authorize-ios.js',
      ], {
        print: 'Running authorize script',
        cwd: global.appiumRoot
      }).promise;
    }).then(function () {
      const env = _.clone(process.env);
      env.MOCHA_REPORTER = 'mocha-jenkins-reporter';
      env.JUNIT_REPORT_PATH = path.resolve(
          global.reportsDir,
          'report' + ((env.BUILD_NUMBER) ? '-' + env.BUILD_NUMBER : '') + '.xml');
      env.JUNIT_REPORT_STACK = 1;

      return utils.smartSpawn('gulp', [
        'run-ios-e2e',
        '--color',
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
}));
