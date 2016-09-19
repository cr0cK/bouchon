#!/usr/bin/env node

import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import commander from 'commander';
import morgan from 'morgan';

import { apiRouter } from '../lib/router';
import { errorMiddleware } from '../middlewares/express';
import { colorizeMethod } from '../lib/colorizeMethod';
import { logger, displayLogs } from '../lib/logger';
import { cleanup as cleanupHotReload } from '../lib/hotReload';


// prevents the program from closing instantly (doing some cleanup when exiting)
process.stdin.resume();

commander
  .option('-d, --path [path/to/fixtures]', 'Path to the fixtures')
  .option('-p, --port <port>', 'Port of the server')
  .option('--hot', 'Enable hot-reload', false)
  .parse(process.argv);

if (!commander.path) {
  commander.help();
  process.exit(1);
}

try {
  const fixturesPath = path.resolve(commander.path);
  fs.accessSync(fixturesPath, fs.R_OK);
} catch (err) {
  logger.error(String(err));
  process.exit(1);
}

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// setup morgan logger
app.use(morgan('dev', {
  stream: {
    write: str => logger.info(` => Response: ${str.trim()}`),
  },
}));

// use api router
app.use('/', apiRouter(commander));

// display some stuff for each request
app.use((req, res, next) => {
  logger.info(`${colorizeMethod(req.method)} ${req.originalUrl}`);
  displayLogs(req.reduxLogs);
  next();
});

app.use(errorMiddleware);

if (commander.hot) {
  logger.info('✔ Hot-reload is enabled.');
}

const port = Number(commander.port) || 3000;
app.listen(port, () => {
  logger.info(`✔ App listening at port ${port}.`);
});

// cleanup handler
process.on('cleanup', () => {
  cleanupHotReload();
});

// do stuff when exiting.
process.on('exit', () => {
  process.emit('cleanup');
  process.exit(0);
});

// catch ctrl+c
process.on('SIGINT', () => {
  process.exit(0);
});
