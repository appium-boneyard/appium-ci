// transpile:mocha

import {listDevices} from '../..';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.should();
chai.use(chaiAsPromised);

describe('sample', function () {
  it('should-work', async function () {
    let res = await listDevices();
    console.log('res ->', res); // eslint-disable-line no-console
    res.should.have.length.above(5);
  });
});
