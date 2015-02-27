"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    _ = require('underscore'),
    Q = require('q'),
    exec = Q.denodeify(require('child_process').exec);

gulp.task('prepare-output-dirs', function() {
  var seq = _([
    'rm -rf ' + global.artefactsDir,
    'mkdir -p ' + global.artefactsDir,
    'rm -rf ' + global.outputDir,
    'mkdir -p ' + global.outputDir
   ]).map(function (script) {
    return function() {
      exec(script);
    };
  });
  return seq.reduce(Q.when, new Q());
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
