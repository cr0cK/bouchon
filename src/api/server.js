import childProcess from 'child_process';
import path from 'path';
import Q from 'q';
import colors from 'colors';

import * as logs from './logs';


/**
 * Log the child output.
 */
const childLogger = str => {
  console.info(str.trim().replace(/server/, colors.magenta('child')));
};


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
  const finalArgs = { ...defaultArgs, ...args };

  const pathToFile = path.join(__dirname, '..', 'server', 'index.js');
  const commandArgs = [
    '-d', finalArgs.path,
    '-p', finalArgs.port,
  ];
  const options = {
    silent: true,
  };

  console.info('Starting server with args: ', commandArgs.join(' '));

  child = childProcess.fork(pathToFile, commandArgs, options);

  const deferred = Q.defer();

  // log child's stdout
  child.stdout.on('data', (data) => {
    const str = data.toString('utf-8');
    childLogger(str);

    if (/App listening at port/.test(str)) {
      // reset activity logs when the server is starting
      logs.reset();

      deferred.resolve(str);
      return;
    }

    deferred.notify(str);
  });

  // receive messages from the child, like activities logs
  child.on('message', message => {
    if ('activityLog' in message) {
      logs.push(message.activityLog);
    }
  });

  // log child's stderr
  child.stderr.on('data', (data) => {
    const str = data.toString('utf-8');
    childLogger(str);
    deferred.notify(str);
  });

  // bind the exit event in case of the child crashs
  child.on('exit', () => {
    child = undefined;
    const str = 'The server has been stopped.';
    console.info(str);
    deferred.resolve(str);
  });

  return deferred.promise;
};

/**
 * Stop the server.
 */
export const stop = () => {
  const deferred = Q.defer();

  if (!child) {
    const str = 'The server is already stopped.';
    console.info(str);
    deferred.resolve(str);
  } else {
    child.kill('SIGHUP');

    child.on('exit', () => {
      child = undefined;
      const str = 'The server has been stopped.';
      deferred.resolve(str);
    });
  }

  return deferred.promise;
};
