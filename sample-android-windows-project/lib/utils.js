import Q from 'q';
import cp from 'child_process';

const exec = Q.denodeify(cp.exec);

export default {
  exec
};
