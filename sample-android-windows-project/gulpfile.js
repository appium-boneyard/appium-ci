"use strict";

var gulp = require('gulp'),
    _ = require('lodash'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp),
    DEFAULTS = require('appium-gulp-plugins').boilerplate.DEFAULTS;

var argv = require('yargs').argv;

boilerplate({
  build: 'sample-android-windows-project',
  jscs: false,
  e2eTest: _.defaults({
    android: argv.emu,
    avd: argv.avd
  }, DEFAULTS.e2eTest)
});
gulp.task('fail', function(done) {
  done(new Error('failed'));
})
