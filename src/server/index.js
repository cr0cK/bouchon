#!/usr/bin/env node

import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import commander from 'commander';
import morgan from 'morgan';

import { apiRouter } from '../lib/router';
import { errorMiddleware } from '../middlewares/express';
import { colorizeMethod } from '../helpers/colorizeMethod';
import { logger } from '../helpers/logger';


commander
  .option('-d, --path [path/to/fixtures]', 'Path to the fixtures')
  .option('-p, --port <port>', 'Port of the server')
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
app.use('/', apiRouter(commander.path));

// display some stuff for each request
app.use((req, res, next) => {
  logger.info(`${colorizeMethod(req.method)} ${req.originalUrl}`);
  if (req.reduxDispatchedAction) {
    logger.info(` => ${req.reduxDispatchedAction}`);
  }
  next();
});

app.use(errorMiddleware);

const port = Number(commander.port) || 3000;
app.listen(port, () => {
  logger.info(`App listening at port ${port}.`);
});
