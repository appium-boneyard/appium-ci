"use strict";

var gulp = require('gulp'),
    _ = require('lodash'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp),
    androidE2eBoilerPlate = require('appium-ci').androidE2eBoilerPlate.use(gulp);

var argv = require('yargs').argv;

boilerplate({build: 'sample-android-project', jscs: false});
androidE2eBoilerPlate(_(argv).pick('avd'));
