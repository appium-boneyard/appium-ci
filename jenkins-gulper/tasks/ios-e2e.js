"use strict";

var gulp = require('gulp'),
    Q = require('q'),
    runSequence = Q.denodeify(require('run-sequence')),
    utils = require('../lib/utils'),
     path = require('path'),
    _ = require('underscore');

gulp.task('run-ios-e2e-worker',
    ['prepare-dirs'],function () {
  return runSequence('download-scp-build','expand-build')
    .then(function () {
      return utils.smartSpawn('gulp', [
        'show-ios-e2e-tests-split',
        '--color',
        '--testSplit=' + global.argv.numOfSplits
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
      }).promise;
    }).then(function () {
      return utils.configureXcode(GLOBAL.xCodeVersion);
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
      var env = _.clone(process.env);
      env.MOCHA_REPORTER = 'mocha-jenkins-reporter';
      env.JUNIT_REPORT_PATH = path.resolve(
          global.reportsDir,
          'report' + ((env.BUILD_NUMBER) ? '-' + env.BUILD_NUMBER : '') +'.xml');
      env.JUNIT_REPORT_STACK = 1;

      return utils.smartSpawn('gulp', [
        'run-ios-e2e',
        '--color',
        '--testSplit=' + global.argv.numOfSplits,
        '--testGroup=' + global.argv.split
      ], {
        print: 'Showing test split',
        cwd: global.appiumRoot,
        env: env
      }).promise;
    }).fin(function () {
      return utils.uploadReports();
    });
});

