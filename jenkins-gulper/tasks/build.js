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
        'appium-build.tgz', global.inputDir);
    });
});

gulp.task('download-scp-build', ['prepare-dirs'], function () {
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
      var uploadServer = process.env.BUILD_UPLOAD_SERVER;
      var src = path.join('builds', buildJob.jobName, '' + buildJob.buildNumber, 'appium-build.tgz');
      var target = path.join(global.inputDir, 'appium-build.tgz');
      console.log('downloading via rsync:', src);

      return utils.executeShellCommands([
        'rsync -e \'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\' ' +
          "'" + 'appium@' + uploadServer + ':' + utils.escapePath(src) + "' " +
          "'" + target + "'"
        ], {cwd: global.appiumRoot});
    });
});

gulp.task('expand-build', ['global'] , function function_name() {
  return utils.smartSpawn('tar', [
      'xfzp',
      path.resolve(global.inputDir, 'appium-build.tgz'),
    ], {
      print: 'Expanding build',
      cwd: global.appiumRoot
    }
  ).promise;
});

