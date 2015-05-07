"use strict";

var gulp = require('gulp'),
    Q = require('q'),
    _ = require('underscore'),
    request = Q.denodeify(require('request')),
    utils = require('../lib/utils');

gulp.task('collect-downstream-xunit-results', ['prepare-dirs'],function () {
  var targetDir = global.outputDir;
  var jobNameRaw = process.env.LAST_TRIGGERED_JOB_NAME;
  var jobName = jobNameRaw.replace(/_/g,' ');
  var builds = process.env['TRIGGERED_BUILD_NUMBERS_' + jobNameRaw].split(',');
  var buildSeq = _(builds).map(function (build) {
    return function() {
      var buildInfoUrl = global.ciRootUrl + 'job/' + utils.encode(jobName) + '/' +
        build + '/api/json';
      return request(buildInfoUrl).spread(function (res, body) {
        var artifactSeq = _(JSON.parse(body).artifacts).map(function (artifact) {
          return function () {
            console.log(artifact.relativePath);
            return utils.downloadArtifact(jobName, build, artifact.relativePath, targetDir).
              catch(function () {
                console.warn('Could not downlaod ' + artifact.relativePath + '.');
              });
          };
        });
        return artifactSeq.reduce(Q.when, new Q());
      });
      };
  });
  return buildSeq.reduce(Q.when, new Q());
});
