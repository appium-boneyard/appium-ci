import B from 'bluebird';
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

var androidTools = {
  killAll: (processes) => {
    processes = processes || ['emulator'];
    processes = _.flatten([processes]);
    let seq = _(processes).map((p) => {
      return () => {
        if (process.platform.match(/win/)) {
          return utils.exec('powershell -Command \'Stop-Process Name "*' + p +'*"\'' + p).catch(() => {});
        } else {
          return utils.exec('sudo pkill -f ' + p).catch(() => {});
        }
      };
    }).value();
    return B.Promise.reduce(seq, (_, fn) => { return fn(); }, null);
  }
};

export { androidTools };

export class Emulator {
  constructor(avd, opts={}) {
    this.opts = _.clone(opts);
    _.defaults(this.opts, DEFAULT_OPTS);
    this.avd = avd;
  }

  start () {
    var out = new stream.PassThrough();
    out.pipe(split())
      .on('data', (line) => {
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
  }

  async waitTillReady() {
    let startMs = Date.now();
    let timeoutPromise, emuStarted, emuErrored;

    // one cancellable promise monitor the proc events for abnormal termination
    let procPromise = new B.Promise((resolve, reject) => {
      this.child.on('error', (err) => {
        reject('Emulator didn\'t start properly, error:', err);
      });
      this.child.on('close', () => {
        if (!emuStarted) {
           reject('Emulator closed too early, see emu logs for errors.');
        }
      });
    }).cancellable().catch(B.Promise.TimeoutError, () => {})
    .catch((err) => {
      console.error(err);
      emuErrored = true;
      throw err;
    });

    let _waitForEmu = (waitMs) => {
      waitMs = waitMs || this.opts.pool;
      return B.Promise.method(() => {
        if (waitMs === 0) return;
        log.emu.info('Waiting ' + waitMs +  ' ms for emu...');
        timeoutPromise = new B.Promise(() => {}).timeout(waitMs);
        return timeoutPromise.then(_waitForEmu)
          .catch(B.Promise.TimeoutError, () => {});
      })().then(() => {
        if (emuErrored) {
          throw new Error('emulator errored');
        }
        if (Date.now() - startMs > this.opts.maxWait) {
          throw new Error('Emulator did not show up');
        }
      }).then(() => {
        return utils.exec('adb shell getprop sys.boot_completed')
          .spread((stdout) => {
            if (stdout && stdout.trim() === '1') {
              log.emu.info('emulator started');
              emuStarted = true;
            } else {
              return _waitForEmu();
            }
          }).catch((err) => {
            if (err.toString().match(/device not found/)) {
              log.emu.warn('Device not found, it should be there, killing adb server.');
              return utils.exec('adb kill-server')
                .then(() => { return _waitForEmu(3000); });
            }
          });
      });
    };

    let racePromise = B.race([_waitForEmu(this.opts.initWait), procPromise])
      .finally(() => {
        timeoutPromise.cancel();
        procPromise.cancel();
    });

    // just wrapping, the code above is way to
    // complicated for async/await
    await racePromise;
  }

  stop() {
    if (this.child) {
      this.child.kill();
    }
  }
}

