/* eslint no-console: 0 */

import bunyan from 'bunyan';
import bformat from 'bunyan-format';

const formatOut = bformat({ outputMode: 'short' });


export const log = console.log;

export const logger = bunyan.createLogger({
  name: 'server',
  stream: formatOut,
  level: 'debug',
});

/**
 * Display logs formatted in a Redux middleware.
 */
export const displayReduxLogs = (reduxLogs) => {
  reduxLogs.forEach(log_ => {
    logger.info(` => ${log_}`);
  });
};
