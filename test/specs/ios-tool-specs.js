// transpile:mocha

import { iosTools } from '../..';
import utils from '../../lib/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';


chai.should();
chai.use(chaiAsPromised);

describe('ios tools', function () {
  before(function () {
    let _exec = utils.exec;
    let _spawn = utils.spawn;

    sinon.stub(utils, 'exec').callsFake(function () {
      return _exec('echo bob');
    });
    sinon.stub(utils, 'spawn').callsFake(function () {
      return _spawn('echo', ['1']);
    });
  });

  it('spawn as user', async function () {
    let proc = await iosTools.spawnAsUser('bob', 'ls', ['-l']);
    proc.kill();
  });

  it('spawn as current user', async function () {
    let proc = await iosTools.spawnAsCurrentUser('ls', ['-l']);
    proc.kill();
  });

  it('set simulator scale', async function () {
    await iosTools.setIosSimulatorScale();
  });

  it('set configure xCode', async function () {
    await iosTools.configureXcode('6.1.1');
  });

  it('reset simulators', async function () {
    await iosTools.resetSims();
  });

  it('kill all', async function () {
    await iosTools.killAll();
    await iosTools.killAll('ls');
    await iosTools.killAll(['ls', 'echo']);
  });

  after(function () {
    utils.exec.restore();
    utils.spawn.restore();
  });
});
