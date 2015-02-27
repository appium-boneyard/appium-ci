"use strict";

var Q = require('q'),
    exec = Q.denodeify(require('child_process').exec),
    spawn = require('child_process').spawn,
    fs = require('fs');

function encode(s) {
  return s.replace(/\s/g, '%20');
}

function downloadS3Artifact(jobName, buildNumber, artifact) {
  var ciRootUrl = process.env.HUDSON_URL;
  var url = ciRootUrl + 'job/' + encode(jobName) + '/' + buildNumber + '/s3/download/' + artifact;
  console.log('Retrieving url -->', url);
  return exec('wget ' + url);
}

function smartSpawn(bin, args, opts) {
  opts = opts || {};

  // custom opts
  var logFile = opts.logFile;
  delete opts.logFile;

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

exports.downloadS3Artifact = downloadS3Artifact;
exports.encode = encode;
exports.smartSpawn = smartSpawn;
