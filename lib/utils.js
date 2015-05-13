"use strict";

var Q = require('q'),
    exec = Q.denodeify(require('child_process').exec),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    uncolor = require('uncolor'),
    _ = require('underscore'),
    path = require('path');

function encode(s) {
  return s.replace(/\s/g, '%20');
}

function smartSpawn(bin, args, opts) {
  opts = opts || {};

  // custom opts
  var logFile = opts.logFile;
  delete opts.logFile;
  var uncoloredLogFile = opts.uncoloredLogFile;
  delete opts.uncoloredLogFile;
  if(opts.print) console.log(opts.print);
  delete opts.print;

  // forced opts
  opts.stdio = 'pipe';

  var deferred = Q.defer();
  var proc = spawn(
    bin,
    args,
    opts
  );

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  if(logFile) {
    var fsStream = fs.createWriteStream(logFile);
    proc.stdout.pipe(fsStream);
    proc.stderr.pipe(fsStream);
  }
  if(uncoloredLogFile) {
    var uncoloredFsStream = fs.createWriteStream(uncoloredLogFile);
    proc.stdout.pipe(uncolor()).pipe(uncoloredFsStream);
    proc.stderr.pipe(uncolor()).pipe(uncoloredFsStream);
  }
  proc.on('close', function (code) {
    if(code === 0) {
      deferred.resolve();
    } else {
      deferred.reject(new Error('spawn failed with code:' + code));
    }
  });
  proc.promise = deferred.promise;
  return proc;
}

var wrapPath = function (path) {
  if(!path.match('^\'')) {
    path = '\'' + path + '\'';
  }
  return path;
};

var executeShellCommands = function (commands) {
  var seq = _(commands).map(function (command) {
    return function() {
      return exec(command);
    };
  });
  return seq.reduce(Q.when, new Q());
};

function downloadS3Artifact(jobName, buildNumber, artifact, targetDir) {
  var url = global.ciRootUrl + 'job/' + encode(jobName) + '/' + buildNumber + '/s3/download/' + artifact;
  console.log('Retrieving url -->', url);
  return smartSpawn('wget', ['-nv', url], {cwd: targetDir}).promise;
}

function downloadArtifact(jobName, buildNumber, artifact, targetDir) {
  var url = global.ciRootUrl + 'job/' + encode(jobName) + '/' + buildNumber + '/artifact/' + artifact;
  console.log('Retrieving url -->', url);
  return smartSpawn('wget', ['-nv', url], {cwd: targetDir}).promise.catch(function(err) {
    console.log('err -->', err);
    throw err;
  });
}

function escapePath(path) {
  return path.replace(/\s/g, '\\ ');
}

function uploadBuild() {
  var dir = path.join('builds', process.env.JOB_NAME, process.env.BUILD_NUMBER);
  var appiumRoot = global.appiumRoot;
  var uploadServer = process.env.BUILD_UPLOAD_SERVER;
  return smartSpawn(
    'ssh',
    [
      '-o',
      "UserKnownHostsFile=/dev/null",
      '-o',
      'StrictHostKeyChecking=no',
      'appium@' + uploadServer,
      'mkdir -p ' + escapePath(dir)
    ],
    {
      print: 'Creating dir: ' + dir,
      cwd: appiumRoot,
    }
  ).promise.then(function() {
    return smartSpawn(
      'scp',
      [
        '-o',
        "UserKnownHostsFile=/dev/null",
        '-o',
        'StrictHostKeyChecking=no',
        path.resolve(global.artifactsDir, 'appium-build.bz2'),
        'appium@' + uploadServer + ':' + escapePath(path.join('builds', process.env.JOB_NAME, process.env.BUILD_NUMBER, 'appium-build.bz2'))
      ],
      {
        print: 'Uploading build to: ' + uploadServer,
        cwd: appiumRoot,
      }
    ).promise;
   });
}

exports.downloadS3Artifact = downloadS3Artifact;
exports.downloadArtifact = downloadArtifact;
exports.encode = encode;
exports.smartSpawn = smartSpawn;
exports.wrapPath = wrapPath;
exports.executeShellCommands = executeShellCommands;
exports.escapePath = escapePath;
exports.uploadBuild = uploadBuild;
