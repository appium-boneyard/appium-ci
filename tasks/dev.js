"use strict";

var gulp = require('gulp');

try {
  // ignore this if dev deps are not installed
  var jshint = require('gulp-jshint');

  var JS_SOURCES = ['*.js', 'lib/**/*.js', 'tasks/**/*.js'];
  gulp.task('jshint', function () {
    return gulp.src(JS_SOURCES)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(jshint.reporter('fail'));
  });

  gulp.task('lint', ['jshint']);
} catch(ign) {}

gulp.task('hello-world', function() {
  console.log('Hello World');
});

gulp.task('experimenting', function () {
  var utils = require('../lib/utils');
  return utils.smartSpawn(
    './node_modules/.bin/gulp',
    ['hello-world', '--color'],
    { logFile: 'gulp.log' }
  ).promise;
});

