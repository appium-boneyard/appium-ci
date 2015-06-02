// transpile:mocha

import { AndroidEmulator } from '../..';
import utils from '../../lib/utils';
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

    sinon.stub(utils, "spawn", function () {
      return _spawn('sleep', ['300']);
    });
    sinon.stub(utils, "exec", function () {
      return _exec('echo 1');
    });
  });

  it('launch emu',async () => {
    let emu;
    try {
      emu = new AndroidEmulator('myavd', {initWait: 500});
      emu.start();
      await emu.waitTillReady();
    } finally {
      if (emu) emu.stop();
    }
  });

  after(async () => {
    utils.spawn.restore();
    utils.exec.restore();
  });

});

