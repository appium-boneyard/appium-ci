"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils');

gulp.task('prepare-dirs', function() {
  return utils.executeShellCommands([
    'rm -rf ' + utils.escapePath(global.artifactsDir),
    'mkdir -p ' + utils.escapePath(global.artifactsDir),
    'rm -rf ' + utils.escapePath(global.reportsDir),
    'mkdir -p ' + utils.escapePath(global.reportsDir),
    'rm -rf ' + utils.escapePath(global.outputDir),
    'mkdir -p ' + utils.escapePath(global.outputDir),
    'rm -rf ' + utils.escapePath(global.inputDir),
    'mkdir -p '  + utils.escapePath(global.inputDir)
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
