import _ from 'lodash';
import utils from './utils';

async function listDevices() {
  let [stdout] = await utils.exec('instruments -s devices');
  var lines = stdout.match(/^.*([\n\r]+|$)/gm);
  return _(lines).filter((l) => {
    return !(l.trim().length === 0 || l.match(/Known Devices/));
  }).map((l) => {
    return l.trim().match(/^(.*)\s\(/)[1];
  }).value();
}

export default listDevices;
