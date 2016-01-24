/* eslint no-console: 0 */
/* eslint no-param-reassign: 0 */

import bunyan from 'bunyan';
import bformat from 'bunyan-format';
import _ from 'lodash';

const formatOut = bformat({ outputMode: 'short' });


export const log = console.log;

export const logger = bunyan.createLogger({
  name: 'server',
  stream: formatOut,
  level: 'debug',
});

/**
 * Flush logs and display them via logger.
 */
export const displayLogs = logs => {
  if (_.isString(logs)) {
    logs = [ logs ];
  }

  logs = logs.reverse();

  if (_.isArray(logs)) {
    while (logs.length) {
      logger.info(` => ${logs.pop()}`);
    }
  }
};
