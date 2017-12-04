#!/usr/bin/env node

// @flow

import commander from 'commander';
import bunyan from 'bunyan';
import bformat from 'bunyan-format';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import colors from 'colors';

import { log, initLogger } from '../libs/logger';
import { router } from '../router';

import type {
  CLIOptions,
} from '../types';


// init logger
const logger = bunyan.createLogger({
  name: 'server',
  stream: bformat({ outputMode: 'short' }),
  level: 'debug',
});

// override log.* with buynan functions
initLogger(logger);

/**
 * Setup CLI options and return the commander object.
 */
function setupCLIOptions(): CLIOptions {
  commander
    .option('-d, --directory [path/to/fixtures]', 'Directory of the fixtures')
    .option('-p, --port <port>', 'Port of the server')
    .option('--hot', 'Enable hot-reload', false)
    .parse(process.argv);

  if (!commander.directory) {
    commander.help();
    process.exit(1);
  }

  return commander;
}

/**
 * Start an Express server,
 * Register plugins,
 * Register Bouchon router,
 * Listen on port defined on the CLI options.
 */
function startServer(cliOptions: CLIOptions): void {
  const app = express();

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());

  // setup morgan logger
  app.use(morgan((tokens, req, res) => {
    const string = [
      colors.cyan('Response:'),
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
    ].join(' ');

    // if a logColor is set in the request,
    // use it to decorate the log string
    // (added by the redux middleware)
    const finalString = req.app.locals.logColor ?
      `${colors[req.app.locals.logColor]('|')} ${string}` :
      string;

    log.info(finalString);
  }));

  // register Bouchon router
  app.use('/', router({
    directory: cliOptions.directory,
  }));

  const port = Number(cliOptions.port) || 3000;
  app.listen(port, () => {
    log.info(`✔ App listening at port ${port}.`);
  }).on('error', (err) => {
    if (err.errno === 'EADDRINUSE') {
      log.error(`The port "${port}" is already used. Please choose another one with -p option.`);
      process.exit(1);
    }

    log.error('Unexpected error:', String(err));
    log.info(err.stack);
    process.exit(1);
  });

  return app;
}

/**
 * Start bouchon.
 */

try {
  const cli = setupCLIOptions();
  startServer(cli);
} catch (err) {
  log.error('An error has occurred.');
  log.error(err.message);

  if (process.env !== 'production') {
    log.debug(err.stack);
  }

  process.exit(1);
}
