/* eslint-disable promise/prefer-await-to-then */
'use strict';

const gulp = require('gulp');
const utils = require('../lib/utils');
const path = require('path');

gulp.task('run-ios-build', gulp.series('prepare-dirs', function () {
  return utils.smartSpawn(
    path.resolve(global.sideSims, 'configure.sh'),
    [global.xCodeVersion],
    {
      print: 'Configuring xCode ' + global.xCodeVersion,
      cwd: global.sideSims,
    }
  ).promise.then(function () {
    return utils.executeShellCommands([
      'rm -rf node_modules',
      'npm cache clean']);
  }).then(function () {
    return utils.smartSpawn(
      path.resolve(global.appiumRoot, 'reset.sh'),
      ['--ios', '--dev', '--hardcore', '--verbose', '--no-npmlink', '--no-shrinkwrap'],
      {
        print: 'Running reset.sh',
        cwd: global.appiumRoot,
      }
    ).promise;
  }).then(function () {
    return utils.smartSpawn(
      'tar',
      [
        'cfzp',
        path.resolve(global.artifactsDir, 'appium-build.tgz'),
        '--exclude=.git',
        '--exclude=artifacts',
        '--exclude=submodules',
        '.'
      ],
      {
        print: 'Archiving build',
        cwd: global.appiumRoot,
      }
    ).promise;
  }).then(function () {
    return utils.uploadBuild();
  });
}));
