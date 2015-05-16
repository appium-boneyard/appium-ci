"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils');

gulp.task('prepare-dirs', function() {
  return utils.executeShellCommands([
    'rm -rf ' + "'" + utils.wrapPath(global.artifactsDir) + "'",
    'mkdir -p ' + "'"  + utils.wrapPath(global.artifactsDir) + "'",
    'rm -rf ' + "'"  + utils.wrapPath(global.reportsDir) + "'",
    'mkdir -p ' + "'"  + utils.wrapPath(global.reportsDir) + "'",
    'rm -rf ' + "'"  + utils.wrapPath(global.outputDir) + "'",
    'mkdir -p ' + "'"  + utils.wrapPath(global.outputDir) + "'",
    'rm -rf ' + "'"  + utils.wrapPath(global.inputDir) + "'",
    'mkdir -p ' + "'"  + utils.wrapPath(global.inputDir) + "'"
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
