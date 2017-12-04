// @flow

import express from 'express';
import bodyParser from 'body-parser';
import freeport from 'freeport';
import bunyan from 'bunyan';
import bformat from 'bunyan-format';
import request from 'request';

// $FlowFixMe
import { router } from 'main'; // eslint-disable-line

import type {
  Fixture,
} from '../../src/types';


const logger = bunyan.createLogger({
  name: 'server',
  stream: bformat({ outputMode: 'short' }),
  level: 'debug',
});

export const log = console;

/**
 * Wrap request to make easier calls in tests.
 */
export function requester(port: string): Object {
  const getUrl = path => `http://localhost:${port}${path}`;

  function doRequest(requestOpts) {
    return new Promise((resolve, reject) => {
      request(requestOpts, (err, ...args) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(args);
      });
    });
  }

  return {
    get: (url: string) => doRequest({
      url: getUrl(url),
      json: true,
    }),

    post: (url: string, jsonData: Object) => doRequest({
      url: getUrl(url),
      method: 'post',
      json: jsonData,
    }),

    patch: (url: string, jsonData: Object) => doRequest({
      url: getUrl(url),
      method: 'patch',
      json: jsonData,
    }),

    put: (url: string, jsonData: Object) => doRequest({
      url: getUrl(url),
      method: 'put',
      json: jsonData,
    }),

    delete: (url: string) => doRequest({
      url: getUrl(url),
      method: 'delete',
    }),
  };
}

/**
 * Start an Express app, register Bouchon middleware with the rootFixture
 * passed in parameters.
 */
export function startBouchon(rootFixture: Fixture): Promise<*> {
  return new Promise((resolve, reject) => {
    freeport((err, port) => {
      if (err) {
        reject(err);
        return;
      }

      const app = express();

      app.use(bodyParser.json());

      app.use('/', router({
        rootFixture,
        logger,
      }));

      app.listen(port, () => {
        resolve({
          app,
          port,
          requester: requester(port),
        });
      });
    });
  });
}
