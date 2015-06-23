"use strict";

var gulp = require('gulp'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);


boilerplate({
  build: 'sample-android-project',
  jscs: false,
  e2eTest: { android: true }
});
