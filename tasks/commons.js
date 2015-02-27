"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils');

gulp.task('prepare-output-dirs', function() {
  return utils.executeShellCommands([
    'rm -rf ' + utils.wrapPath(global.artifactsDir),
    'mkdir -p ' + utils.wrapPath(global.artifactsDir),
    'rm -rf ' + utils.wrapPath(global.outputDir),
    'mkdir -p ' + utils.wrapPath(global.outputDir)
  ]);
});

gulp.task('appium-npm-install',function () {
 return utils.smartSpawn(
    'npm',
    ['install'],
    {
      cwd: global.appiumRoot,
    }
  ).promise;
});
