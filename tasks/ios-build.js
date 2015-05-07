"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path');
    // _ = require('underscore');

var appiumRoot = global.appiumRoot;

gulp.task('run-ios-build',
    ['prepare-dirs'],function () {

  return utils.smartSpawn(
    path.resolve(appiumRoot, 'reset.sh'),
    ['--ios', '--dev', '--hardcore', '--verbose', '--no-npmlink'],
    {
      print: 'Running reset.sh',
      cwd: appiumRoot,
    }
  ).promise.then(function () {
    // Dirty workaround
    //console.log('Replacing ApiDemo symlink by real directory');
    //return utils.executeShellCommands([
      //'rm -rf ' + utils.wrapPath(path.resolve(appiumRoot, 'sample-code/apps/ApiDemos')),
      //'mv ' + utils.wrapPath(path.resolve(appiumRoot, 'submodules/ApiDemos')) +
        //' ' + utils.wrapPath(path.resolve(appiumRoot, 'sample-code/apps/'))
    //]);
  }).then(function () {
    return utils.smartSpawn(
      'tar',
      [
        'cfjp',
        path.resolve(global.artifactsDir, 'appium-build.bz2'),
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
  });
});
