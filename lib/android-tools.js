import Q from 'q';
import stream from 'stream';
import fs from 'fs';
import split from 'split';
import os from 'os';
import utils from './utils';
import _ from 'lodash';
import { getLogger } from 'appium-logger';

let log = {
  emu: getLogger('android-emu')
};

const DEFAULT_OPTS = {
  initWait: 15000,
  maxWait: 300000,
  pool: 5000,
};

export class Emulator {
  constructor(avd, opts={}) {
    this.opts = _.clone(opts);
    _.defaults(this.opts, DEFAULT_OPTS);
    this.avd = avd;
    this.emuErrored = false;
    this.readyDeferred = Q.defer();
  }

  start () {
    var out = new stream.PassThrough();
    out.pipe(split())
      .on('data', function (line) {
        log.emu.info(line);
      });
    out.pipe(fs.createWriteStream('emulator.log'));
    var emuBin = os.platform() === 'linux' ? 'emulator64-x86' : 'emulator';
    var emuArgs = [
      '-avd', this.avd,
      '-no-snapshot-load', '-no-snapshot-save',
      '-no-audio', '-netfast'
    ];
    if (os.platform() === 'linux') {
      emuArgs = emuArgs.concat([
        '-qemu', '-m', '512', '-enable-kvm'
      ]);
    }
    log.emu.info('executing', emuBin, emuArgs.join(' '));
    this.child = utils.spawn(emuBin, emuArgs);
    this.child.stdout.pipe(out);
    this.child.stderr.pipe(out);
    this.child.on('error', (err) => {
      this.emuErrored = true;
      this.readyDeferred.reject(err);
    });
    this.child.on('close', () => {
      this.readyDeferred.reject('Something went wrong!');
    });
  }

  waitTillReady() {
    let startMs = Date.now();
    let _waitForEmu = () => {
      let retry = () => {
        if (this.emuErrored) {
          throw new Error('Emulator errored');
        }
        if (Date.now() - startMs > this.opts.maxWait) {
          throw new Error('Emulator did not show up');
        }
        log.emu.info('Waiting for emu...');
        return Q.delay(this.opts.pool).then(_waitForEmu);
      };
      return utils.exec('adb shell getprop sys.boot_completed')
        .spread(function (stdout) {
          if (stdout && stdout.trim() === '1') {
            log.emu.info('emulator started');
            return;
          }
          return retry();
        }, function (err) {
          if (err.toString().match(/device not found/)) {
            log.emu.warn('Device not found, it should be there, killing adb server.');
            return utils.exec('adb kill-server').then(retry);
          }
          return retry();
        });
    };
    return Q.all([
      Q.delay(this.opts.initWait).then(_waitForEmu)
        .then(() => {this.readyDeferred.resolve();}),
      this.readyDeferred.promise
    ]);
  }

  stop() {
    this.child.kill();
  }
}

