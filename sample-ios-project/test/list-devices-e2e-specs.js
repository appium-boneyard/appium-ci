// transpile:mocha

import {listDevices} from '../..';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';

chai.should();
chai.use(chaiAsPromised);

describe('sample', () => {
  it('should-work',async () => {
    let res = await listDevices();
    console.log('res ->', res);
    res.should.have.length.above(5);
  });
});

