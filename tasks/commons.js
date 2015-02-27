"use strict";

var gulp = require('gulp'),
    utils = require('../lib/utils'),
    _ = require('underscore'),
    Q = require('q'),
    exec = Q.denodeify(require('child_process').exec);

gulp.task('prepare-output-dirs', function() {
  var wrapPath = function (path) {
    if(!path.match('^\'')) {
      path = '\'' + path + '\'';
    }
    return path;
  };

  var seq = _([
    'rm -rf ' + wrapPath(global.artefactsDir),
    'mkdir -p ' + wrapPath(global.artefactsDir),
    'rm -rf ' + wrapPath(global.outputDir),
    'mkdir -p ' + wrapPath(global.outputDir)
   ]).map(function (script) {
    return function() {
      return exec(script);
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
