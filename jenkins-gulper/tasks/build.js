/* eslint-disable promise/prefer-await-to-then */
'use strict';

const gulp = require('gulp');
const utils = require('../lib/utils');
const Q = require('q');
const request = Q.denodeify(require('request'));
const _ = require('underscore');
const path = require('path');

gulp.task('download-build', gulp.series('prepare-dirs', function () {
  const m = global.argv.downloadBuild.match(/(.*)\/(.*)/);
  const jobName = m[1];
  const buildNumber = m[2];

  console.log('downloading ' + jobName + '/' + buildNumber); // eslint-disable-line no-console

  let upStreamJobUrl = global.ciRootUrl + 'job/' + utils.encode(jobName) +
     '/' + buildNumber + '/api/json';
  console.log('upStreamJobUrl ->', upStreamJobUrl); // eslint-disable-line no-console
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
}));

gulp.task('download-scp-build', gulp.series('prepare-dirs', function () {
  const m = global.argv.downloadBuild.match(/(.*)\/(.*)/);
  const jobName = m[1];
  const buildNumber = m[2];

  console.log('downloading ' + jobName + '/' + buildNumber); // eslint-disable-line no-console

  let upStreamJobUrl = global.ciRootUrl + 'job/' + utils.encode(jobName) +
     '/' + buildNumber + '/api/json';
  console.log('upStreamJobUrl ->', upStreamJobUrl); // eslint-disable-line no-console
  return request(upStreamJobUrl)
    .spread(function (res, body) {
      // extracting downstream build job information
      return _(JSON.parse(body).subBuilds).chain()
        .filter(function (build) {
          return build.jobName.match(/Build/);
        }).first().value();
    }).then(function (buildJob) {
      const uploadServer = process.env.BUILD_UPLOAD_SERVER;
      const src = path.join('builds', buildJob.jobName, '' + buildJob.buildNumber, 'appium-build.tgz');
      const target = path.join(global.inputDir, 'appium-build.tgz');
      console.log('downloading via rsync:', src); // eslint-disable-line no-console

      return utils.executeShellCommands([
        'rsync -e \'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\' ' +
        "'" + 'appium@' + uploadServer + ':' + utils.escapePath(src) + "' " +
        "'" + target + "'"
      ], {cwd: global.appiumRoot});
    });
}));

gulp.task('expand-build', gulp.series('global', function function_name () {
  return utils.smartSpawn('tar', [
    'xfzp',
    path.resolve(global.inputDir, 'appium-build.tgz'),
  ], {
    print: 'Expanding build',
    cwd: global.appiumRoot
  }).promise;
}));
