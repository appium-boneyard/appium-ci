// transpile:mocha

import { iosTools } from '../../..';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';

chai.should();
chai.use(chaiAsPromised);

describe('ios tools e2e', () => {

  it('set simulator scale',async () => {
    await iosTools.setIosSimulatorScale();
  });

  it('set configure xCode',async () => {
    await iosTools.configureXcode('6.1.1');
  });

  it('reset simulators',async () => {
    await iosTools.resetSims();
  });

});

