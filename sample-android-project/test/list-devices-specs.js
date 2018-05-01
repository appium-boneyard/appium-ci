// transpile:mocha

import {listDevices} from '../..';
import utils from '../lib/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.should();
chai.use(chaiAsPromised);

describe('list devices', function () {
  before(function () {
    sinon.stub(utils, 'exec').callsFake(function () {
      return ['List of devices attached \n' +
             'emulator-5554\tdevice\n\n', null];
    });
  });
  after(function () {
    utils.exec.restore();
  });
  it('should-work', async function () {
    let res = await listDevices();
    res.should.have.length(1);
    res[0].should.include('emulator');
  });
});
