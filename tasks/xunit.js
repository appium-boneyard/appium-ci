"use strict";

var gulp = require('gulp'),
    Q = require('q'),
    _ = require('underscore'),
    request = Q.denodeify(require('request')),
    utils = require('../lib/utils'),
    path = require('path');

gulp.task('collect-downstream-xunit-results', ['prepare-dirs'],function () {
  var uploadServer = process.env.BUILD_UPLOAD_SERVER;
  var dir = path.join('reports', process.env.JOB_NAME, process.env.BUILD_NUMBER);
  var inputDir = global.inputDir;
  var reportsDir = global.reportsDir;
  return utils.executeShellCommands([
    'rsync -e \'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\' ' +
      "'" + 'appium@' + uploadServer + ':' + '~/' + utils.escapePath(dir) + "/*.tgz' " +
      "'" + inputDir + "'"
    ]).then(function() {
      return utils.executeShellCommands([
       'tar xfz ' + utils.escapePath(inputDir) + '/*.tgz'
      ], {cwd: reportsDir});
    });
});
