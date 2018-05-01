/* eslint-disable promise/prefer-await-to-then */
"use strict";

const gulp = require('gulp');
const utils = require('../lib/utils');
const path = require('path');

gulp.task('run-android-build', ['prepare-dirs'], function () {
  return utils.executeShellCommands([
    'rm -rf node_modules',
    'npm cache clean'])
  .then(function () {
    return utils.smartSpawn(
      path.resolve(global.appiumRoot, 'reset.sh'),
      ['--android', '--dev', '--hardcore', '--verbose', '--no-npmlink', '--no-shrinkwrap'],
      {
        print: 'Running reset.sh',
        cwd: global.appiumRoot,
      }
    ).promise;
  }).then(function () {
    // Dirty workaround
    console.log('Replacing ApiDemo symlink by real directory'); // eslint-disable-line no-console
    return utils.executeShellCommands([
      'rm -rf ' + utils.escapePath(path.resolve(global.appiumRoot, 'sample-code/apps/ApiDemos')),
      'mv ' + utils.escapePath(path.resolve(global.appiumRoot, 'submodules/ApiDemos')) +
        ' ' + utils.escapePath(path.resolve(global.appiumRoot, 'sample-code/apps/'))
    ]);
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
});
