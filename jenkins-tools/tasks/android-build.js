"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path');

var appiumRoot = global.appiumRoot;

gulp.task('run-android-build',
    ['prepare-dirs'],function () {

  return utils.smartSpawn(
    path.resolve(appiumRoot, 'reset.sh'),
    ['--android', '--dev', '--hardcore', '--verbose', '--no-npmlink'],
    {
      print: 'Running reset.sh',
      cwd: appiumRoot,
    }
  ).promise.then(function () {
    // Dirty workaround
    console.log('Replacing ApiDemo symlink by real directory');
    return utils.executeShellCommands([
      'rm -rf ' + utils.escapePath(path.resolve(appiumRoot, 'sample-code/apps/ApiDemos')),
      'mv ' + utils.escapePath(path.resolve(appiumRoot, 'submodules/ApiDemos')) +
        ' ' + utils.escapePath(path.resolve(appiumRoot, 'sample-code/apps/'))
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
        cwd: appiumRoot,
      }
    ).promise;
  }).then(function () {
    return utils.uploadBuild();
   });
});
