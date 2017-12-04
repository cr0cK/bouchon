// @flow

import isFunction from 'lodash/isFunction';
// import { createAction } from 'redux-act';

// import { log } from '../libs/logger';

import type {
  Fixtures,
  CombinedFixtures,
  Routes,
  Reducer,
} from '../types';

// use require to be able to use rewire for testing
const { createReducer } = require('redux-act');
const { combineReducers } = require('redux');

// const noopAction = createAction('Noop action');


/**
 * Create reducers and combine them.
 */
export const combineFixturesReducers = (fixtures: Fixtures): Reducer => {
  const reducers = Object.keys(fixtures).reduce((acc, fixtureName) => {
    const fixture = fixtures[fixtureName];

    if (!fixture.name) {
      throw new Error(
        `Error in the fixture '${fixtureName}': ` +
        'You have to specify a \'name\' property ' +
        'that will be used as the Redux state key.',
      );
    }

    // create a reducer if fixture.reducer is just an object definition
    // (case in fixture definition)
    if (!isFunction(fixture.reducer)) {
      acc[fixture.name] = createReducer(fixture.reducer, fixture.data || {});
    } else {
      acc[fixture.name] = fixture.reducer;
    }

    return acc;
  }, {});

  return combineReducers(reducers);
};

/**
 * Return a new Route object with all endpoint of routes concatened
 * with `endpoint`.
 */
export const concatRoutesEndpoint = (routes: Routes, endpoint: string): Routes => {
  // console.log('routes', routes);

  return Object.keys(routes).reduce((acc, verbUrl) => {
    const [verb, url] = verbUrl.split(/\s+/);
    const finalUrl = (`/${[endpoint, url].join('/')}`).replace(/\/{2,}/g, '/');
    const concatenatedEndpoint = [verb, finalUrl].join(' ');

    return {
      ...acc,
      [concatenatedEndpoint]: routes[verbUrl],
    };
  }, {});
};

/**
 * Combine routes endpoints of fixtures.
 */
export const combineFixturesRoutes = (fixtures: Fixtures): Routes => (
  Object.keys(fixtures).reduce((acc, fixtureName) => {
    const fixture = fixtures[fixtureName];

    if (!fixture.routes) {
      return acc;
    }

    return {
      ...acc,
      ...concatRoutesEndpoint(fixture.routes, fixture.endpoint),
    };
  }, {})
);

/**
 * Combine reducers and routes from fixtures definitions.
 */
export const combineFixtures = (fixtures: Fixtures): CombinedFixtures => ({
  reducer: combineFixturesReducers(fixtures),
  routes: combineFixturesRoutes(fixtures),
});
