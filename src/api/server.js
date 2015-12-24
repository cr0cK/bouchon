import childProcess from 'child_process';
import path from 'path';
import Q from 'q';

import { logger } from '../helpers/logger';
import * as logs from './logs';


let child;

/**
 * Start a server with the parameters set as arguments.
 *
 * @param  {String} fixturesPath Path to the fixtures
 * @param  {Number} port         Port to listen
 */
export const start = args => {
  const defaultArgs = {
    port: 3000,
  };
  const finalArgs = {...defaultArgs, ...args};

  const pathToFile = path.join(__dirname, '..', 'server', 'index.js');
  const commandArgs = [
    '-d', finalArgs.path,
    '-p', finalArgs.port,
  ];
  const options = {
    silent: true,
  };

  logger.info('Starting server with args: ', commandArgs.join(' '));

  child = childProcess.fork(pathToFile, commandArgs, options);

  const deferred = Q.defer();

  // log child's stdout
  child.stdout.on('data', (data) => {
    const str = data.toString('utf-8');
    logger.info('child', str);

    if (/App listening at port/.test(str)) {
      // reset activity logs when the server is starting
      logs.reset();

      return deferred.resolve(str);
    }

    deferred.notify(str);
  });

  // log child's stderr
  child.stderr.on('data', (data) => {
    const str = data.toString('utf-8');
    logger.info('child', str);
    deferred.notify(str);
  });

  // receive messages from the child, like activities logs
  child.on('message', message => {
    if ('activityLog' in message) {
      logs.push(message.activityLog);
    }
  });

  // bind the exit event in case of the child crashs
  child.on('exit', () => {
    child = undefined;
    const str = 'The server has been stopped.';
    logger.info('child', str);
    deferred.resolve(str);
  });

  return deferred.promise;
};

/**
 * Stop the server.
 */
export const stop = () => {
  logger.info('Stopping server...');

  const deferred = Q.defer();

  if (!child) {
    const str = 'The server is already stopped.';
    logger.info(str);
    deferred.resolve(str);
  } else {
    child.kill('SIGHUP');

    child.on('exit', () => {
      child = undefined;
      const str = 'The server has been stopped.';
      logger.info(str);
      deferred.resolve(str);
    });
  }

  return deferred.promise;
};
