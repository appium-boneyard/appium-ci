"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    Q = require('q'),
    request = Q.denodeify(require('request')),
    _ = require('underscore'),
    path = require('path');

var argv = global.argv;

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

