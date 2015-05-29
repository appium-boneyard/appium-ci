// transpile:mocha

import { EmuManager } from '../lib/android-tools';
import utils from '../lib/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';
import sinon from 'sinon';

chai.should();
chai.use(chaiAsPromised);

describe('android tools', () => {
  before(async () => {
    let _spawn = utils.spawn;
    let _exec = utils.exec;

    sinon.stub(utils, "spawn", function() {
      return _spawn('sleep', ['300']);
    });
    sinon.stub(utils, "exec", function() {
      return _exec('echo 1');
    });
  });

  it('launch emu',async () => {
    let emu = new EmuManager('myavd', {initWait: 500});
    let child = emu.start();
    try {
      await emu.waitTillReady();
    } finally {
      child.kill();
    }
  });

  after(async () => {
    utils.spawn.restore();
    utils.exec.restore();
  });

});

