#!/usr/bin/env node
/* eslint-disable promise/prefer-await-to-callbacks */
"use strict";

const s3 = require('s3');
const _ = require('underscore');
const Q = require('q');

module.exports = function (bucket, localFile, key) {
  const deferred = Q.defer();

  const client = s3.createClient({
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

  const params = {
    localFile,

    s3Params: {
      Bucket: bucket,
      Key: key,
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };

  const uploader = client.uploadFile(params);
  uploader.on('error', function (err) {
    console.error("unable to upload:", err.stack); // eslint-disable-line no-console
    deferred.reject("S3 upload failed.");
  });

  function printProgress () {
    console.log("progress", uploader.progressMd5Amount, // eslint-disable-line no-console
              uploader.progressAmount, uploader.progressTotal);
  }

  uploader.on('progress', _.throttle(printProgress, 5000));

  uploader.on('end', function () {
    printProgress();
    console.log("done uploading"); // eslint-disable-line no-console
    deferred.resolve();
  });

  return deferred.promise;
};
