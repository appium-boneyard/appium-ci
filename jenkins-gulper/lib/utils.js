"use strict";

const Q = require('q');
const exec = Q.denodeify(require('child_process').exec);
const spawn = require('child_process').spawn;
const fs = require('fs');
const uncolor = require('uncolor');
const _ = require('underscore');
const path = require('path');

function encode (s) {
  return s.replace(/\s/g, '%20');
}

function smartSpawn (bin, args, opts) {
  opts = opts || {};

  // custom opts
  const logFile = opts.logFile;
  delete opts.logFile;
  const uncoloredLogFile = opts.uncoloredLogFile;
  delete opts.uncoloredLogFile;
  if (opts.print) {
    console.log(opts.print); // eslint-disable-line no-console
  }
  delete opts.print;

  // forced opts
  opts.stdio = 'pipe';

  const deferred = Q.defer();
  const proc = spawn(
    bin,
    args,
    opts
  );

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  if (logFile) {
    const fsStream = fs.createWriteStream(logFile);
    proc.stdout.pipe(fsStream);
    proc.stderr.pipe(fsStream);
  }
  if (uncoloredLogFile) {
    const uncoloredFsStream = fs.createWriteStream(uncoloredLogFile);
    proc.stdout.pipe(uncolor()).pipe(uncoloredFsStream);
    proc.stderr.pipe(uncolor()).pipe(uncoloredFsStream);
  }
  proc.on('close', function (code) {
    if (code === 0) {
      deferred.resolve();
    } else {
      deferred.reject(new Error('spawn failed with code:' + code));
    }
  });
  proc.promise = deferred.promise;
  return proc;
}

const wrapPath = function (path) {
  if (!path.match('^\'')) {
    path = '\'' + path + '\'';
  }
  return path;
};

const executeShellCommands = function (commands, opts) {
  opts = opts || {};
  const seq = _(commands).map(function (command) {
    return function () {
      return exec(command, opts);
    };
  });
  return seq.reduce(Q.when, new Q());
};

function downloadS3Artifact (jobName, buildNumber, artifact, targetDir) {
  const url = global.ciRootUrl + 'job/' + encode(jobName) + '/' + buildNumber + '/s3/download/' + artifact;
  console.log('Retrieving url -->', url); // eslint-disable-line no-console
  return smartSpawn('wget', ['-nv', url], {cwd: targetDir}).promise;
}

function downloadArtifact (jobName, buildNumber, artifact, targetDir) {
  const url = global.ciRootUrl + 'job/' + encode(jobName) + '/' + buildNumber + '/artifact/' + artifact;
  console.log('Retrieving url -->', url); // eslint-disable-line no-console
  return smartSpawn('wget', ['-nv', url], {cwd: targetDir}).promise.catch(function (err) { // eslint-disable-line promise/prefer-await-to-callbacks
    console.log('err -->', err); // eslint-disable-line no-console
    throw err;
  });
}

function escapePath (path) {
  return path.replace(/\s/g, '\\ ');
}

function uploadBuild () {
  const dir = path.join('builds', process.env.JOB_NAME, process.env.BUILD_NUMBER);
  const uploadServer = process.env.BUILD_UPLOAD_SERVER;

  console.log('Uploading the build via rsync.'); // eslint-disable-line no-console

  return executeShellCommands([
    'ssh -q -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no appium@' + uploadServer + ' mkdir -p ' + "'" + escapePath(dir) + "'",
    'rsync -e \'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\' ' +
      'artifacts/appium-build.tgz ' +
      'appium@' + uploadServer + ':' +
      "'" + escapePath(path.join('builds', process.env.JOB_NAME,
        process.env.BUILD_NUMBER, 'appium-build.tgz' + "'"))
  ], {cwd: global.appiumRoot});
}

function uploadReports () {
  console.log('Uploading reports'); // eslint-disable-line no-console
  const reportBase = 'report' + ((process.env.BUILD_NUMBER) ? '-' + process.env.BUILD_NUMBER : '');
  const uploadServer = process.env.BUILD_UPLOAD_SERVER;
  const dir = path.join('reports', process.env.E2E_JOB_NAME, process.env.E2E_BUILD_NUMBER);
  return executeShellCommands([
    'tar cfz ' + escapePath(global.outputDir) + '/' + reportBase + '.tgz .',
  ], {cwd: global.reportsDir}).then(function () { // eslint-disable-line promise/prefer-await-to-then
    if (process.env.E2E_JOB_NAME) {
      return executeShellCommands([
        'ssh -q -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ' +
          'appium@' + uploadServer + ' mkdir -p ' + "'" + escapePath(dir) + "'",
        'rsync -e \'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\' ' +
          escapePath(global.outputDir) + '/' + reportBase + '.tgz ' +
          'appium@' + uploadServer + ':' +
          "'" + escapePath(dir) + '/' + reportBase + '.tgz' + "'"
      ]);
    }
  });
}

function setIosSimulatorScale () {
  console.log('Setting simulator scale.'); // eslint-disable-line no-console
  return executeShellCommands([
    'defaults write com.apple.iphonesimulator SimulatorWindowLastScale 0.5'
  ]);
}

function configureXcode (xCodeVersion) {
  console.log('Configuring XCode.'); // eslint-disable-line no-console
  const bin = path.resolve(global.sideSims, 'configure.sh');
  return exec(bin + ' ' + xCodeVersion);
}

function resetSims () {
  console.log('Resetting sims.'); // eslint-disable-line no-console
  const bin = path.resolve(global.sideSims, 'reset-sims.sh');
  return exec(bin);
}


exports.downloadS3Artifact = downloadS3Artifact;
exports.downloadArtifact = downloadArtifact;
exports.encode = encode;
exports.smartSpawn = smartSpawn;
exports.wrapPath = wrapPath;
exports.executeShellCommands = executeShellCommands;
exports.escapePath = escapePath;
exports.uploadBuild = uploadBuild;
exports.uploadReports = uploadReports;
exports.setIosSimulatorScale = setIosSimulatorScale;
exports.configureXcode = configureXcode;
exports.resetSims = resetSims;
