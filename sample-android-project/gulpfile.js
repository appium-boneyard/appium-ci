"use strict";

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'sample-android-project',
  e2eTest: {
    android: true,
  }
});
