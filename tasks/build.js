"use strict";

var gulp = require('gulp'),
    utils = require('utils'),
    request = require('request'),
    _ = require('underscore');

var argv = global.argv;

gulp.task('download-build', function () {
  var upstreamJobName = argv.upstreamBuildName;
  var upstreamBuildNumber = argv.upStreamBuildNumber;
  var ciRootUrl = process.env.HUDSON_URL;

  console.log('upstreamJobName ->', upstreamJobName);
  console.log('upstreamBuildNumber ->', upstreamBuildNumber);

  var upStreamJobUrl = ciRootUrl + 'job/' + utils.encode(upstreamJobName) +
     '/' + upstreamBuildNumber  + '/api/json';
  console.log('upStreamJobUrl ->', upStreamJobUrl);
  return request(upStreamJobUrl)
    .spread(function (res, body) {
      // extracting downstream build job information
      return _(JSON.parse(body).subBuilds).chain()
        .filter(function (build) {
          return build.jobName.match(/Build/);
        }).first().value();
    }).then(function (buildJob) {
      return utils.downloadS3Artifact(buildJob.jobName, buildJob.buildNumber, 'appium-build.bz2');
    });
});

