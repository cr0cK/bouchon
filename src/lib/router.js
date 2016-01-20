/* eslint new-cap: 0 */
/* eslint no-param-reassign: 0 */

import fs from 'fs';
import path from 'path';
import express from 'express';
import _ from 'lodash';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createAction } from 'redux-act';

import { outputLogger, activitiesLogger } from '../middlewares/redux';
import { logger, displayReduxLogs } from '../helpers/logger';
import { concatEndpoint } from './combineFixturesRoutes';
import { combineFixturesReducers } from './combineFixturesReducers';


const router = express.Router();
const dummyAction = createAction('dummy_action');


/**
 * Check verb validity.
 *
 * @param  {String} verb
 * @return {Boolean}
 */
const checkVerbValidity = verb => {
  return ['get', 'post', 'put', 'patch', 'delete']
    .indexOf(verb.toLowerCase()) !== -1 ? verb : '';
};

/**
 * Create middlewares stack providing a `next` method like Express.
 *
 * @param  {Object} data  Selected data
 * @param  {Array} chain  List of middlewares
 * @return {Function}     First middleware to call
 */
const middlewareTrampoline = (data, chain) => {
  return function _trampoline(req, res, next) {
    function createNext(mdware, i) {
      return function _it(err) {
        if (err) return next(err);

        const nextIndex = i + 1;
        const nextMiddleware = chain[nextIndex] ?
                               createNext(chain[nextIndex], nextIndex) :
                               next;
        try {
          mdware(data)(req, res, nextMiddleware);
        } catch (e) {
          next(e);
        }
      };
    }
    return createNext(chain[0], 0)();
  };
};

/**
 * Retreive all fixture files that match /\.fixture\.js$/
 * from a directory.
 *
 * @param  {String} fixturesDir   Directory of the fixtures
 * @return {Array}                List of paths
 */
const retrieveFixtures = fixturesDir => {
  const fixturesFound = [];

  const parseDir = dir => {
    fs.readdirSync(dir).map(file => {
      const fullDir = path.join(path.resolve(dir), file);
      const stats = fs.lstatSync(fullDir);
      if (stats.isDirectory()) {
        return parseDir(fullDir);
      }
      if (stats.isFile() && /\.fixture\.js$/.test(file)) {
        fixturesFound.push(fullDir);
      }
    });
  };

  parseDir(fixturesDir);

  return fixturesFound;
};


/**
 * Load fixtures from an array of paths.
 * Each fixture must export a 'default' key.
 *
 * @param  {Array} fixturesFiles List of paths
 * @return {Array}               List of fixtures
 */
const loadFixtures = fixturesFiles => {
  return fixturesFiles.reduce((acc, fixturePath) => {
    try {
      let fixtureContent = require(fixturePath).default;

      if (!_.isArray(fixtureContent)) {
        fixtureContent = [fixtureContent];
      }

      fixtureContent.forEach(fixtureContent_ => {
        if (!fixtureContent_.name) {
          logger.error(`
Add a 'name' key in the specs of the fixture localised at ${fixturePath}.
It will be used to save fixture data in the store.
          `);
          return true;
        }

        acc.push(fixtureContent_);
      });
    } catch (err) {
      logger.error(`
Can't require the fixture from the path "${fixturePath}"
Cause: ${String(err)}
      `);
    }

    return acc;
  }, []);
};

/**
 * Retrieve all routes from fixtures and return an object of routes.
 *
 * @param  {Array} fixturesContent  Fixtures objects
 * @return {Objet}                  Routes (keys are 'VERB URL')
 */
const compileRoutes = fixturesContent => {
  return fixturesContent.reduce((acc, fixture) => {
    const routes = _.isObject(fixture.routes) ?
      concatEndpoint(fixture.routes, fixture.endpoint) :
      {};

    return Object.assign(acc, routes);
  }, {});
};

/**
 * Return the delay.
 * - Return the number if delay is a number.
 * - Return a delay between min and max if delay is an array
 * - Else 0
 *
 * @param  {Number | Array}
 * @return {Number}
 */
const getDelay = (delay) => {
  if (_.isNumber(delay)) {
    return delay;
  }

  if (_.isArray(delay)) {
    const [min, max] = delay;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  return 0;
};

/**
 * Extract the delay and the action(s) function(s) from the action parameter
 * set in the route definition.
 *
 * If url is not defined, it does not fallback on a dummy action
 * (if action was not defined).
 *
 * @param  {Function | Array}
 * @return {Object}
 */
const extractActionParams = (action_, url) => {
  let delay = 0;
  let actions;

  // case: action: actions.get
  if (_.isFunction(action_)) {
    actions = [ action_ ];
  // case: action: [actions.get, otherActions.get]
  } else if (_.isArray(action_)) {
    actions = action_;
  // case: action: {action: actions.get, delay: 500},
  } else if (_.isObject(action_)) {
    delay = getDelay(action_.delay);
    actions = _.isArray(action_.action) ?
      action_.action : [ action_.action ];
  }

  // set a dummy action as fallback if url is set
  if (url) {
    if (_.isUndefined(action_)) {
      actions = [ dummyAction ];
    }

    if (_.isArray(actions)) {
      actions.forEach((action, i) => {
        if (!_.isFunction(action)) {
          logger.error(`A action declared in the route "${url}" is not callable.`);
          actions[i] = dummyAction;
        }
      });
    }
  }

  return { delay, actions };
};

/**
 * Return or call responsBody.
 *
 * @param  {Function | Mixed} responseBody
 * @param  {Object} selectorArgs
 */
const returnResponseBody = responseBody => selectorArgs => state => {
  if (_.isFunction(responseBody)) {
    return responseBody(selectorArgs)(state);
  }

  return responseBody;
};

/**
 * Initialize Redux store,
 * Define the router in charge of api routes.
 *
 * @param  {String fixturesDir  Directory of the fixtures
 * @return {Object}             Router
 */
export const apiRouter = fixturesDir => {
  const fixturesFiles = retrieveFixtures(fixturesDir);
  const fixturesContent = loadFixtures(fixturesFiles);
  const allRoutes = compileRoutes(fixturesContent);
  const rootReducer = combineFixturesReducers(fixturesContent);

  // init store
  const store = applyMiddleware(
    thunk,
    outputLogger,
    activitiesLogger,
  )(createStore)(rootReducer);

  // register routes in the router
  _.forEach(allRoutes, (fixture, routeKey) => {
    const [verb, url] = routeKey.split(/\s+/);
    const method = checkVerbValidity(verb);
    const {
      action, backendAction,
      responseBody,
      selector, middlewares,
      status,
      delay,
    } = fixture;

    if (!method) {
      logger.warn(`Verb "${verb}" is invalid! Skipping...`);
      return true;
    }

    logger.info(`Registering "${verb} ${url}"`);

    router[method.toLowerCase()](url, (req, res, next) => {
      const actionParams = extractActionParams(action, url);
      const backendActionParams = extractActionParams(backendAction);
      const actionsArgs = {
        query: req.query,
        // https://github.com/strongloop/express/issues/2734
        params: Object.assign({}, req.params),
        body: req.body,
        req,
        res,
        backendAction: backendActionParams,
      };

      // dispatch main actions
      if (_.isArray(actionParams.actions)) {
        actionParams.actions.map(action_ => store.dispatch(action_(actionsArgs)));
      }

      const selectorArgs = {
        ...req.query,
        ...req.params,
        ...req.body,
      };

      // get data from the selector
      let data;
      if (_.isFunction(selector)) {
        data = selector(selectorArgs)(store.getState());
      }

      // overwrite the status method to set a flag when setting the status (1)
      res.statusOriginal = res.status;
      res.status = statusCode => {
        res.statusDefined = true;
        return res.statusOriginal(statusCode);
      };

      // get delay
      if (delay) {
        logger.warn(
`The \`delay\` key is deprecated. Use this notation instead:
action: {action: myaction, delay: 1000}`);
      }

      const actionDelay = delay || actionParams.delay;

      // return response
      setTimeout(() => {
        // apply middlewares
        if (_.isArray(middlewares)) {
          middlewareTrampoline(data, middlewares)(req, res, next);
        }

        // set status code and send data if not already done
        if (!res.headersSent) {
          // (1)
          if (status && !res.statusDefined) {
            res.statusOriginal(status);
          }

          // middlewares can save data in res.data to override the selected
          // data
          res.json(
            returnResponseBody(responseBody)(selectorArgs)(store.getState()) ||
            res.data ||
            data
          );

          next();
        }
      }, actionDelay);

      // dispatch backend actions
      if (_.isArray(backendActionParams.actions)) {
        setTimeout(() => {
          backendActionParams.actions.map(action_ => (
            store.dispatch(action_(actionsArgs)))
          );

          // display redux log by filtering delay messages
          displayReduxLogs(req.reduxLogs, log => log.type !== 'delay');

        // exec after 100 ms even if no delay defined in order to be called
        // after the action
        }, backendActionParams.delay || 100);
      }

      // when Bouchon is starting by a fork of the API process
      // (see api/server), the activities logs are sent to the child parent
      if ('send' in process) {
        process.send({activityLog: req.activityLog});
      }
    });
  });

  return router;
};
