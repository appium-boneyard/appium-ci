import Q from 'q';
import cp from 'child_process';

let utils = {
  spawn: cp.spawn,
  exec: Q.denodeify(cp.exec)
};

export default utils;
