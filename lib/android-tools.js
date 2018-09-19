import B from 'bluebird';
import stream from 'stream';
import fs from 'fs';
import split from 'split';
import os from 'os';
import utils from './utils';
import _ from 'lodash';
import { logger } from 'appium-support';


B.config({
  cancellation: true,
});

const log = logger.getLogger('android-tools');

const DEFAULT_OPTS = {
  initWait: 15000,
  maxWait: 300000,
  pool: 5000,
};

const androidTools = {
  killAll: async (processes = ['emulator']) => {
    processes = _.flatten([processes]);
    for (const p of processes) {
      const cmd = process.platform.match(/^win/)
        ? `powershell -Command "Stop-Process -Name *${p}*"`
        : `sudo pkill -f ${p}`;
      log.warn(`Killing process with command: ${cmd}`);
      await utils.exec(cmd).catch(() => {});
    }
  }
};

export { androidTools };

export class Emulator {
  constructor (avd, opts = {}) {
    this.avd = avd;
    this.opts = Object.assign({}, DEFAULT_OPTS, opts);
  }

  start () {
    const out = new stream.PassThrough();
    out.pipe(split())
      .on('data', (line) => {
        log.info(line);
      });
    out.pipe(fs.createWriteStream('emulator.log'));
    const emuBin = os.platform() === 'linux' ? 'emulator64-x86' : 'emulator';
    let emuArgs = [
      '-avd', this.avd,
      '-no-snapshot-load',
      '-no-snapshot-save',
      '-no-audio',
      '-netfast'
    ];
    if (os.platform() === 'linux') {
      emuArgs = emuArgs.concat([
        '-qemu', '-m', '512', '-enable-kvm'
      ]);
    }
    log.info(`Executing command: ${emuBin} ${emuArgs.join(' ')}`);
    this.child = utils.spawn(emuBin, emuArgs);
    this.child.stdout.pipe(out);
    this.child.stderr.pipe(out);
  }

  async waitTillReady () {
    const startMs = Date.now();
    let timeoutPromise;
    let emuStarted = false;
    let emuErrored = false;

    // one cancellable promise monitor the proc events for abnormal termination
    const procPromise = new B((resolve, reject, onCancel) => {
      this.child.on('error', (err) => { // eslint-disable-line promise/prefer-await-to-callbacks
        emuErrored = true;
        reject(`Emulator did not start properly, error: ${err}`);
      });
      this.child.on('close', () => {
        if (!emuStarted) {
          emuErrored = true;
          reject('Emulator closed too early, see emu logs for errors.');
        }
      });
      onCancel(() => reject(new B.CancellationError()));
    }).catch(B.CancellationError, () => {});

    const _waitForEmu = async (waitMs = this.opts.pool) => {
      if (waitMs > 0) {
        log.info(`Waiting ${waitMs}ms for emu...`);
        timeoutPromise = new B((resolve, reject, onCancel) => {
          onCancel(() => reject(new B.CancellationError()));
        }).timeout(waitMs);
        await timeoutPromise
          .catch(B.Promise.TimeoutError, () => {})
          .catch(B.Promise.CancellationError, () => {});
      }

      // recursion end conditions
      if (emuErrored) {
        throw new Error('Emulator errored');
      }
      if (Date.now() - startMs > this.opts.maxWait) {
        throw new Error('Emulator did not show up');
      }

      // retrieve emulator status
      let stdout;
      try {
        [stdout] = await utils.exec('adb shell getprop sys.boot_completed');
      } catch (err) {
        if (err.toString().match(/device not found/)) {
          // there might be something wrong with the adb server
          log.warn('Device not found, it should be there, killing adb server.');
          return utils.exec('adb kill-server').then(() => { return _waitForEmu(); }); // eslint-disable-line promise/prefer-await-to-then
        } else if (err.toString().match(/device offline/)) {
          // that's ok,just wait
          return _waitForEmu();
        } else {
          throw (err);
        }
      }

      // check emulator status
      if (stdout && stdout.trim() === '1') {
        log.info('Emulator started');
        emuStarted = true;
      } else {
        await _waitForEmu();
      }
    };

    // wait for first promise
    await B.race([_waitForEmu(this.opts.initWait), procPromise])
      .finally(() => {
        // cancel outstanding promises so that they do not hang the node process
        timeoutPromise.cancel();
        procPromise.cancel();
      });

  }

  stop () {
    if (this.child) {
      this.child.kill();
    }
  }
}
