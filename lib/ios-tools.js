import path from 'path';
import utils from './utils';

const SIDE_DISK = '/Volumes/SIDE';
const SIDE_SIMS = path.resolve(SIDE_DISK, 'sims');

function spawnAsUser (user, cmd, args) {
  return utils.exec(
    "ps -axj | grep loginwindow | awk \"/^" + user + " / {print \\$2;exit}\""
  ).spread(function (stdout) {
    var userPid = stdout.trim();
    return utils.spawn(
      "sudo",
      [ 'launchctl', 'bsexec', userPid,'sudo', '-u']
        .concat([user, cmd]).concat(args),
      { detached: false });
  });
}

function spawnAsCurrentUser (cmd, args) {
  return utils.exec('whoami').spread(function (stdout) {
    var currentUser = stdout.trim();
    return spawnAsUser(currentUser, cmd, args);
  });
}


function setIosSimulatorScale() {
  return utils.exec(
    'defaults write com.apple.iphonesimulator SimulatorWindowLastScale 0.5'
  );
}

function configureXcode (xCodeVersion) {
  var bin = path.resolve(SIDE_SIMS, 'configure.sh');
  return utils.exec(bin + ' ' + xCodeVersion);
}

function resetSims () {
  var bin = path.resolve(SIDE_SIMS, 'reset-sims.sh');
  return utils.exec(bin);
}

export default {
  spawnAsUser,
  spawnAsCurrentUser,
  setIosSimulatorScale: setIosSimulatorScale,
  configureXcode: configureXcode,
  resetSims: resetSims
};
