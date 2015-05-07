"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    path = require('path'),
    uploadToS3 = require("../lib/s3-fast-upload");
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
  }).then(function() {
    var uploadServer = process.env.BUILD_UPLOAD_SERVER;
    return utils.smartSpawn(
      'scp',
      [
        '-o',
        "UserKnownHostsFile=/dev/null",
        '-o',
        'StrictHostKeyChecking=no',
        path.resolve(global.artifactsDir, 'appium-build.bz2'),
        'appium@' + uploadServer + ':builds/' + process.env.BUILD_ID  + '_appium-build.bz2'
      ],
      {
        print: 'Uploding build to: ' + uploadServer,
        cwd: appiumRoot,
      }
    ).promise;
  });
});
