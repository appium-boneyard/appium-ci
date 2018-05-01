// transpile:mocha

import { AndroidEmulator, androidTools } from '../../..';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import B from 'bluebird';


chai.should();
chai.use(chaiAsPromised);

describe('e2e android tools', function () {
  this.timeout(300000);
  before(async function () {
  });

  it('launch emu', async function () {
    let emu;
    try {
      emu = new AndroidEmulator('NEXUS_S_18_X86');
      await B.resolve(emu.start());
      await emu.waitTillReady();
    } finally {
      if (emu) {
        emu.stop();
      }
    }
  });

  it('killAll', async function () {
    await androidTools.killAll();
    await androidTools.killAll('ls');
    await androidTools.killAll(['ls', 'echo']);
  });

  after(async function () {
  });

});
