'use strict';

const gulp = require('gulp');
const utils = require('../lib/utils');
const path = require('path');

gulp.task('global', function () {
  global.argv = require('yargs').argv;
  global.appiumRoot = process.env.APPIUM_ROOT;
  global.artifactsDir = path.resolve(process.env.APPIUM_ROOT, 'artifacts');
  global.reportsDir = path.resolve(process.env.APPIUM_ROOT, 'reports');
  global.outputDir = path.resolve(process.env.APPIUM_ROOT, 'output');
  global.inputDir = path.resolve(process.env.APPIUM_ROOT, 'input');
  global.sideDisk = '/Volumes/SIDE';
  global.sideSims = path.resolve(global.sideDisk, 'sims');
  global.ciRootUrl = process.env.HUDSON_URL;

  console.log('global.appiumRoot -->', global.appiumRoot); // eslint-disable-line no-console
  console.log('global.ciRootUrl -->', global.ciRootUrl); // eslint-disable-line no-console
});

gulp.task('prepare-dirs', gulp.series('global', function () {
  return utils.executeShellCommands([
    'rm -rf ' + utils.escapePath(global.artifactsDir),
    'mkdir -p ' + utils.escapePath(global.artifactsDir),
    'rm -rf ' + utils.escapePath(global.reportsDir),
    'mkdir -p ' + utils.escapePath(global.reportsDir),
    'rm -rf ' + utils.escapePath(global.outputDir),
    'mkdir -p ' + utils.escapePath(global.outputDir),
    'rm -rf ' + utils.escapePath(global.inputDir),
    'mkdir -p ' + utils.escapePath(global.inputDir)
  ]);
}));

gulp.task('appium-npm-install', gulp.series('global', function () {
  return utils.smartSpawn(
    'rm',
    ['-rf', utils.escapePath(global.appiumRoot + '/node_modules')]
  ).promise.catch(function () {}).then(function () { // eslint-disable-line promise/prefer-await-to-then
    return utils.smartSpawn(
      'npm',
      ['install'],
      {
        cwd: global.appiumRoot,
      }
    ).promise;
  });
}));
