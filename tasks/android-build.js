"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path'),
    _ = require('underscore');

var appiumRoot = global.appiumRoot;
var uploadServer = process.env.BUILD_UPLOAD_SERVER;

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
      'rm -rf ' + utils.wrapPath(path.resolve(appiumRoot, 'sample-code/apps/ApiDemos')),
      'mv ' + utils.wrapPath(path.resolve(appiumRoot, 'submodules/ApiDemos')) +
        ' ' + utils.wrapPath(path.resolve(appiumRoot, 'sample-code/apps/'))
    ]);
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
  }).then(function() {
    return utils.smartSpawn(
      'scp',
      [
        '-o',
        "UserKnownHostsFile=/dev/null",
        '-o',
        'StrictHostKeyChecking=no',
        path.resolve(global.artifactsDir, 'appium-build.bz2'),
        'appium@' + uploadServer + ':' + utils.escapePath(path.join('builds', process.env.JOB_NAME, process.env.BUILD_NUMBER, 'appium-build.bz2'))
      ],
      {
        print: 'Uploading build to: ' + uploadServer,
        cwd: appiumRoot,
      }
    ).promise;
   });
});
