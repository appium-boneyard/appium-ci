"use strict";

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'sample-android-windows-project',
  e2eTest: {
    android: true,
    'android-avd': 'NEXUS_S_18_ARM'
  }
});
