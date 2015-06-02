// transpile:mocha

import { AndroidEmulator } from '../../..';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';

chai.should();
chai.use(chaiAsPromised);

describe('e2e android tools', function () {
  this.timeout(300000);
  before(async () => {
  });

  it('launch emu',async () => {
    let emu;
    try {
      emu = new AndroidEmulator('NEXUS_S_18_X86');
      emu.start();
      await emu.waitTillReady();
    } finally {
      if (emu) emu.stop();
    }
  });

  after(async () => {
  });

});

