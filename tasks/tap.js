"use strict";

var gulp = require('gulp'),
    Q = require('q'),
    _ = require('underscore'),
    exec = Q.denodeify(require('child_process').exec),
    utils = require('./lib/utils');

gulp.task('collect-downstream-tap-results', function () {
  var jobNameRaw = process.env.LAST_TRIGGERED_JOB_NAME;
  var jobName = jobNameRaw.replace(/_/g,' ');
  var builds = process.env['TRIGGERED_BUILD_NUMBERS_' + jobNameRaw].split(',');
  var ok = true;
  var seq = _(builds).map(function (build) {
    return function () {
      var tapTgz = 'tapdata_' + build + '.tgz';
      return utils.downloadS3Artifact(jobName, build, tapTgz).then(function () {
        return exec('tar xfz ' + tapTgz);
      }).catch(function (err) {
        console.error('error while retrieving ' + tapTgz + 'error: ' + err);
        ok = false;
      });
    };
  });
  return seq.reduce(Q.when, new Q())
    .then(function () {
      if (!ok) throw new Error('Tap file retrieval failed.');
    });
});


