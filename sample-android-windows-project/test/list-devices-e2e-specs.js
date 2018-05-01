// transpile:mocha

import {listDevices} from '../..';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.should();
chai.use(chaiAsPromised);

describe('sample', function () {
  it('should-work', async function () {
    let res = await listDevices();
    res.should.have.length(1);
    res[0].should.include('emulator');
  });
});
