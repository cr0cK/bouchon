// @flow

import colors from 'colors';

import type { Logger } from '../types';


/**
 * Expose a log function to proxy console.log to avoid eslint error.
 * Use console.*** for dev only.
 */
// eslint-disable-next-line import/no-mutable-exports
export let log = console;

/**
 * Expose a function to override the default logger.
 * Useful to log output in a custom logger when importing the router
 * as a middleware.
 */
export function setLogger(logger: Logger) {
  log = logger;
}

/**
 * Init bunyan logger and override console.* with bunyan functions.
 */
export const initLogger = (logger: Logger): void => {
  /* eslint-disable */
  // $FlowFixMe
  console.log = logger.info.bind(logger);
  // $FlowFixMe
  console.debug = logger.debug.bind(logger);
  // $FlowFixMe
  console.info = logger.info.bind(logger);
  // $FlowFixMe
  console.warn = logger.warn.bind(logger);
  // $FlowFixMe
  console.error = logger.error.bind(logger);
  /* eslint-enable */
};

/**
 * Add colors according to the methods string.
 */
export const colorizeMethod = (method: string): string => {
  switch (method) {
    case 'GET':
      return colors.green(method);
    case 'POST':
      return colors.yellow(method);
    case 'PATCH':
      return colors.magenta(method);
    case 'PUT':
      return colors.cyan(method);
    case 'DELETE':
      return colors.red(method);
    default:
      return colors.white(method);
  }
};
