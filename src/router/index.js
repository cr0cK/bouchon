// @flow

import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createReducer } from 'redux-act';
import reduxThunk from 'redux-thunk';

import { setLogger, log } from '../libs/logger';
import { concatRoutesEndpoint } from './combine';
import { outputLogger } from './redux/middlewares';

import type {
  RouterOptions,
  RouteActionParams,
  Fixture,
  ExtendedRoute,
  RouteBackendAction,
  RouteMiddleware,
  Action,
  Store,
} from '../types';


/**
 * Check verb validity.
 */
export function checkVerbValidity(verb: string): boolean {
  return ['get', 'post', 'put', 'patch', 'delete']
    .indexOf(verb.toLowerCase().trim()) !== -1;
}

/**
 * Return the delay.
 * - Return the number if delay is a number.
 * - Return a delay between min and max if delay is an array
 * - Else 0
 */
export const getDelay = (delay: number | Array<number>): number => {
  if (Array.isArray(delay)) {
    const [min, max] = delay;
    // eslint-disable-next-line no-mixed-operators
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  return delay;
};

/**
 * Extract the delay and the action(s) function(s) from the action parameter
 * set in the route definition.
 */
// FIXME action type
export function extractActionParams(action: any): RouteActionParams {
  let delay = 0;
  let allActions = [];

  // case: action: actions.get
  if (isFunction(action)) {
    allActions = [action];
  // case: action: [actions.get, otherActions.get]
  } else if (Array.isArray(action)) {
    allActions = action;
  // case: action: {action: actions.get, delay: 500},
  // case: action: {action: [actions.get], delay: 500},
  } else if (isObject(action)) {
    delay = getDelay(action.delay);
    // eslint-disable-next-line prefer-destructuring
    allActions = Array.isArray(action.action) ?
      action.action : [action.action];
  }

  return { actions: allActions, delay };
}

/**
 * Check directory access and return the full path
 * of the fixture directory.
 */
export function getFixturesDirectory(directory: string): string {
  let absFixturesDirectory = '';
  try {
    absFixturesDirectory = path.resolve(directory);
    fs.accessSync(directory, fs.R_OK);
  } catch (err) {
    throw new Error(err.message);
  }

  return absFixturesDirectory;
}

/**
 * Load the rootFixture,
 * Create the root reducer,
 * Combine it into the fixture name.
 */
export function requireRootFixture(absFixtureDirectory: string): Fixture {
  try {
    // $FlowFixMe
    let fixture = require(absFixtureDirectory); // eslint-disable-line

    // if the fixture is exported with "export default {}", drop the default prefix
    if (fixture.default) {
      fixture = fixture.default;
    }

    return fixture;
  } catch (err) {
    throw new Error(`Error when loading the fixture: ${err.message}`);
  }
}

/**
 * Return the root fixture from the directory path or
 * directly from options if rootFixture has been require manually.
 *
 * It's useful to require fixture manually when working in a Webpack environment
 * where `require`s at runtime are tricky...
 */
export function loadRootFixture(options: RouterOptions): Fixture {
  if (options.directory) {
    const absFixtureDirectory = getFixturesDirectory(options.directory);
    return requireRootFixture(absFixtureDirectory);
  }

  if (options.rootFixture) {
    return options.rootFixture;
  }

  throw new Error('Missing directory of rootFixture property in the config of the router!');
}

/**
 * Create the rootReducer.
 * Create if needed a reducer from the fixture reducer definition,
 * and wrap it into the fixture name.
 */
export function createRootReducer(fixture: Fixture): Function {
  const reducerFunction = !isFunction(fixture.reducer) ?
    // if the reducer is just an objet definition (= when it's not a already combined one),
    // create a reducer with its initial data (= state).
    createReducer(fixture.reducer, fixture.data || {}) :
    fixture.reducer;

  // if no name defined, don't combine the reducer
  if (!fixture.name) {
    return reducerFunction;
  }

  // if a name is defined, combine the reducer
  return combineReducers({
    [fixture.name]: reducerFunction,
  });
}

/**
 * Return an array of routes to be registered in Express from
 * the root fixture.
 */
export function compileRoutes(fixture: Fixture): Array<ExtendedRoute> {
  const routes = concatRoutesEndpoint(fixture.routes, fixture.endpoint || '');

  return Object.keys(routes).reduce((acc, verbUrl) => {
    const route = routes[verbUrl];
    const [verb, url] = verbUrl.split(/\s+/);

    if (!checkVerbValidity(verb)) {
      throw new Error(`Invalid verb ${verb}!.`);
    }

    return acc.concat({
      verb: verb.toLowerCase().trim(),
      url,
      ...route,
    });
  }, []);
}

/**
 * Process middlewares, when it's done, call the next function provided by the caller
 * to continue the flow.
 */
export function processMiddlewares(selectedData: ?Object, middlewares: Array<RouteMiddleware>) {
  return function middleware(req: Object, res: Object, next: Function) {
    function createNext(mdleware: RouteMiddleware, index: number) {
      return function current(err: any) {
        if (err) {
          next(err);
          return;
        }

        const nextIndex = index + 1;
        const nextMiddleware = middlewares[nextIndex] ?
          createNext(middlewares[nextIndex], nextIndex) :
          next;

        try {
          mdleware(selectedData)(req, res, nextMiddleware);
        } catch (e) {
          next(e);
        }
      };
    }

    return createNext(middlewares[0], 0)();
  };
}

/**
 * Process actions defined in a route.
 *
 * Dispatch actions,
 * Select data (expect for backendActions),
 * Return a promise with selected data (or undefined).
 */
type ProcessActionsArgs = {
  req: Object,
  res: Object,
  store: Store,
  actions: Array<Action>,
  selector?: Function,
  verb: string,
  url: string,
  status?: Function | number,
  delay?: number,
  backendAction?: RouteBackendAction,
};

type ProcessActionsReturn = {
  selectedData: ?Object,
  statusCode: number,
};

export function processActions(args: ProcessActionsArgs): Promise<ProcessActionsReturn> {
  const {
    req, res, store, actions, selector, verb, url, status, delay, backendAction,
  } = args;

  // payload is all kind of parameters of the query +
  // all merged parameters for kind of shortcuts in reducers / selectors.
  const payload = {
    ...req.query,
    ...req.params,
    ...req.body,
    ...req.headers,
    query: { ...req.query },
    params: { ...req.params },
    body: { ...req.body },
    headers: { ...req.headers },
  };

  // dispatch actions
  actions.forEach((action) => {
    // send allParams as the payload,
    // and "extra data" in the action meta parameter
    const meta = {
      req,
      res,
      backendAction,
      isBouchonAction: true,
    };
    store.dispatch(action(payload, meta));
  });

  if (!selector) {
    return Promise.resolve({
      selectedData: undefined,
      statusCode: 500,
    });
  }

  const state = store.getState();

  // send the action payload as selectors props
  const selectedData = selector(state, payload);

  if (isFunction(selectedData)) {
    log.warn(
      `The selector of the route "${verb} ${url}" returns a function.\n` +
      'Since bouchon@>=2, selectors signature have been changed and have to be written like this:\n' +
      'const selectStuff = (FullState, Props) => SelectedState',
    );

    return Promise.resolve({
      selectedData: undefined,
      statusCode: 500,
    });
  }

  // get statusCode of the response
  const statusCode = isFunction(status) ?
    status(selectedData) : status;

  // resolve a promise with selected data after delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ selectedData, statusCode });
    }, delay);
  });
}

/**
 * Return a middleware to process actions and select data according to
 * the route definition.
 */
export function handleRoute(route: ExtendedRoute, store: Store) {
  return (req: Object, res: Object, next: Function): void => {
    const { actions, delay } = extractActionParams(route.action);

    // process actions and return the response
    // once the promise is resolved
    processActions({
      req,
      res,
      store,
      actions,
      selector: route.selector,
      verb: route.verb,
      url: route.url,
      status: route.status,
      delay,
      backendAction: route.backendAction,
    })
      .then(({ selectedData, statusCode }) => {
        // process middlewares before sending the response
        if (Array.isArray(route.middlewares)) {
          processMiddlewares(selectedData, route.middlewares)(req, res, next);
        }

        // send response only if not already done by a custom middleware,
        // registered in the route
        if (!res.headersSent) {
          res.status(statusCode).json(selectedData);
        }
      });

    // if backendActions are defined,
    // process them after delay.
    if (route.backendAction) {
      // eslint-disable-next-line no-shadow
      const { actions, delay } = extractActionParams(route.backendAction);

      setTimeout(() => {
        processActions({
          req,
          res,
          store,
          actions,
          verb: route.verb,
          url: route.url,
        });
      }, delay);
    }
  };
}

/**
 * Load the root fixture,
 * Create root reducer and compile routes,
 * Create Redux store,
 * Register routes in a router,
 * Return the router.
 */
export function router(options: RouterOptions): Function {
  if (options.logger) {
    setLogger(options.logger);
  }

  const rootFixture = loadRootFixture(options);
  const rootReducer = createRootReducer(rootFixture);
  const routes = compileRoutes(rootFixture);

  // create redux store
  const store = createStore(
    rootReducer,
    applyMiddleware(reduxThunk, outputLogger),
  );

  // register all routes into the Express router
  const expressRouter = express.Router();

  routes.forEach((route) => {
    log.info(`Registering "${route.verb.toUpperCase()} ${route.url}"`);
    expressRouter[route.verb](route.url, handleRoute(route, store));
  });

  return expressRouter;
}
