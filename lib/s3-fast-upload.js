#!/usr/bin/env node

"use strict";

var s3 = require('s3'),
  _ = require('underscore'),
  Q = require('q');

module.exports = function(bucket, localFile, key) {
  var deferred = Q.defer();

  var client = s3.createClient({
    maxAsyncS3: 20,
    s3RetryCount: 3,
    s3RetryDelay: 1000,
    multipartUploadThreshold: 20971520,
    multipartUploadSize: 15728640,
    s3Options: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
  });

  var params = {
    localFile: localFile,

    s3Params: {
      Bucket: bucket,
      Key: key,
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };

  var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
    deferred.reject("S3 upload failed.");
  });

  function printProgress() {
    console.log("progress", uploader.progressMd5Amount,
              uploader.progressAmount, uploader.progressTotal);
  }

  uploader.on('progress', _.throttle(printProgress, 5000));

  uploader.on('end', function() {
    printProgress();
    console.log("done uploading");
    deferred.resolve();
  });

  return deferred.promise;
};
