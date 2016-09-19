/* eslint no-console: 0 */
/* eslint no-param-reassign: 0 */

import bunyan from 'bunyan';
import bformat from 'bunyan-format';
import _ from 'lodash';

const formatOut = bformat({ outputMode: 'short' });


export const logger = bunyan.createLogger({
  name: 'server',
  stream: formatOut,
  level: 'debug',
});

// use the logger for console output too
logger.console = console.log;
console.log = logger.info.bind(logger);
console.info = logger.info.bind(logger);
console.debug = logger.debug.bind(logger);
console.error = logger.error.bind(logger);
console.warn = logger.warn.bind(logger);

/**
 * Flush logs and display them via console.
 */
export const displayLogs = logs => {
  if (logs === undefined) {
    return;
  }

  if (_.isString(logs)) {
    logs = [logs];
  }

  logs = logs.reverse();

  if (_.isArray(logs)) {
    while (logs.length) {
      console.info(` => ${logs.pop()}`);
    }
  }
};
