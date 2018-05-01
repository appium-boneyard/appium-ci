"use strict";

const gulp = require('gulp');
const utils = require('../lib/utils');
const path = require('path');

gulp.task('collect-downstream-xunit-results', ['prepare-dirs'], function () {
  const uploadServer = process.env.BUILD_UPLOAD_SERVER;
  const dir = path.join('reports', process.env.JOB_NAME, process.env.BUILD_NUMBER);
  const inputDir = global.inputDir;
  const reportsDir = global.reportsDir;
  return utils.executeShellCommands([
    'rsync -e \'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\' ' +
    "'" + 'appium@' + uploadServer + ':' + '~/' + utils.escapePath(dir) + "/*.tgz' " +
    "'" + inputDir + "'"
  ]).then(function () { // eslint-disable-line promise/prefer-await-to-then
    return utils.executeShellCommands([
      'for TGZ in ' + utils.escapePath(inputDir) + '/*.tgz; do tar xfz "$TGZ"; done'
    ], {cwd: reportsDir});
  });
});
