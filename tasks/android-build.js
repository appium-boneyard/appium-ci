"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path'),
    _ = require('underscore');

var appiumRoot = global.appiumRoot;

gulp.task('run-android-build',
    ['prepare-output-dirs'],function () {

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
      'rm -rf ' + utils.wrapPath(path.resolve(appiumRoot, 'sample-code/apps/ApiDemos')),
      'mv ' + utils.wrapPath(path.resolve(appiumRoot, 'submodules/ApiDemos')) +
        ' ' + utils.wrapPath(path.resolve(appiumRoot, 'sample-code/apps/'))
    ]);
  }).then(function () {
    var env = _.clone(process.env);
    env.TARGET = path.resolve(global.artifactsDir, 'appium-build.bz2');
    return utils.smartSpawn(
      path.resolve(appiumRoot, 'ci/archive-build.sh'),
      [],
      {
        print: 'Archiving build',
        cwd: appiumRoot,
        env: env
      }
    ).promise;
  });
});

