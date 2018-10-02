import path from 'path';
import utils from './utils';
import _ from 'lodash';
import B from 'bluebird';
import { logger } from 'appium-support';


const log = logger.getLogger('ios-tools');

const SIDE_DISK = '/Volumes/SIDE';
const SIDE_SIMS = path.resolve(SIDE_DISK, 'sims');

function killAll (processes = ['instruments', 'simulator']) {
  processes = _.flatten([processes]);
  const seq = _(processes).map((p) => {
    return () => {
      return utils.exec(`sudo pkill -f ${p}`).catch(() => {});
    };
  }).value();
  return B.reduce(seq, function (_, fn) { return fn(); }, null);
}

function spawnAsUser (user, cmd, args = []) {
  log.info(`Running spawnAsUser: ${user} ${cmd} ${args}`);
  return utils.exec(
    `ps -axj | grep loginwindow | awk "/^${user} / {print \\$2;exit}"`
  ).spread(function (stdout) {
    const userPid = stdout.trim();
    return utils.spawn(
      'sudo',
      ['launchctl', 'bsexec', userPid, 'sudo', '-u', user, cmd, ...args],
      { detached: false });
  });
}

function spawnAsCurrentUser (cmd, args = []) {
  log.info(`Running spawnAsCurrentUser: ${cmd} ${args}`);
  return utils.exec('whoami').spread(function (stdout) {
    const currentUser = stdout.trim();
    return spawnAsUser(currentUser, cmd, args);
  });
}


function setIosSimulatorScale (scale = '0.5') {
  log.info('Setting simulator scale');
  return utils.exec(
    `defaults write com.apple.iphonesimulator SimulatorWindowLastScale ${scale}`
  );
}

function configureXcode (xCodeVersion) {
  log.info(`Configuring xCode: ${xCodeVersion}`);
  const bin = path.resolve(SIDE_SIMS, 'configure.sh');
  return utils.exec(`${bin} ${xCodeVersion}`);
}

function resetSims () {
  log.info('Resetting simulators');
  const bin = path.resolve(SIDE_SIMS, 'reset-sims.sh');
  return utils.exec(bin);
}

export {
  spawnAsUser,
  spawnAsCurrentUser,
  setIosSimulatorScale,
  configureXcode,
  resetSims,
  killAll,
};
