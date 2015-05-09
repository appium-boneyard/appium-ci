"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    Q = require('q'),
    request = Q.denodeify(require('request')),
    _ = require('underscore'),
    path = require('path');

var argv = global.argv;
var appiumRoot = global.appiumRoot;

gulp.task('download-build', ['prepare-dirs'], function () {
  var m = argv.downloadBuild.match(/(.*)\/(.*)/);
  var jobName = m[1];
  var buildNumber = m[2];

  console.log('downloading ' + jobName + '/' + buildNumber);

  var upStreamJobUrl = global.ciRootUrl + 'job/' + utils.encode(jobName) +
     '/' + buildNumber  + '/api/json';
  console.log('upStreamJobUrl ->', upStreamJobUrl);
  return request(upStreamJobUrl)
    .spread(function (res, body) {
      // extracting downstream build job information
      return _(JSON.parse(body).subBuilds).chain()
        .filter(function (build) {
          return build.jobName.match(/Build/);
        }).first().value();
    }).then(function (buildJob) {
      return utils.downloadS3Artifact(buildJob.jobName, buildJob.buildNumber,
        'appium-build.bz2', global.inputDir);
    });
});

gulp.task('download-scp-build', ['prepare-dirs'], function () {
  var m = argv.downloadBuild.match(/(.*)\/(.*)/);
  var jobName = m[1];
  var buildNumber = m[2];
  var uploadServer = process.env.BUILD_UPLOAD_SERVER;
  var src = path.join('builds', jobName, buildNumber, 'appium-build.bz2');
  var target = path.join(global.inputDir, 'appium-build.bz2');
  console.log('downloading via scp:', src);
  return utils.smartSpawn(
    'scp',
    [
      '-o',
      "UserKnownHostsFile=/dev/null",
      '-o',
      'StrictHostKeyChecking=no',
      'appium@' + uploadServer + ':' + src,
      target
    ],
    {
      print: 'Uploading build to: ' + uploadServer,
      cwd: appiumRoot
    }
  ).promise;
});

gulp.task('expand-build' , function function_name() {
  return utils.smartSpawn('tar', [
      'xfjp',
      path.resolve(global.inputDir, 'appium-build.bz2'),
      '-h'
    ], {
      print: 'Expanding build',
      cwd: global.appiumRoot
    }
  ).promise;
});

