// transpile:mocha

import {listDevices} from '../..';
import utils from '../lib/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';
import sinon from 'sinon';

chai.should();
chai.use(chaiAsPromised);

describe('list devices', () => {
  before(() => {
    sinon.stub(utils, 'exec', () => {
      return [
        'Known Devices: \n' +
        'Resizable iPad (8.3 Simulator) [B4094C56-62E0-4C7C-AE32-C9A620FA49C2]\n' +
        'iPad Air (8.3 Simulator) [349366CE-E9E3-4BA0-8CEA-CF3EF9DF458E]\n' +
        'iPad Air [349366CE-E9E3-4BA0-8CEA-CF3EF9DF458E]\n' +
        '\n\n', null];
    });
  });
  after(() => {
    utils.exec.restore();
  });
  it('should-work',async () => {
    let res = await listDevices();
    res.should.have.length(3);
    res[1].should.equal('iPad Air');
    res[2].should.equal('iPad Air');
   });
});

