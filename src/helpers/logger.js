/* eslint no-console: 0 */

import bunyan from 'bunyan';
import bformat from 'bunyan-format';

const formatOut = bformat({ outputMode: 'short' });

const logger = bunyan.createLogger({
  name: 'server',
  stream: formatOut,
  level: 'debug',
});

const log = console.log;

export { logger, log };
