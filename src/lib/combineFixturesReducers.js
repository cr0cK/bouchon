import _ from 'lodash';

// use require to be able to use rewire for testing
const createReducer = require('redux-act').createReducer;
const combineReducers = require('redux').combineReducers;

const reduxAct = require('redux-act');
const { createAction } = reduxAct;

const dummyAction = createAction('dummy_action');


const returnState = state => state;


/**
 * Handle a dummy action in case of no action is set.
 * (useful to trigger Redux middlewares even if no action is set for a route)
 */
export const createDummyAction = reducer => ({
  ...reducer,
  [dummyAction]: returnState,
});


/**
 * Combine reducers from the fixture definition.
 *
 * @param  {Object} fixturesContent Fixture definition
 * @return {Function}               Combined reducer
 */
export const combineFixturesReducers = (fixturesContent) => {
  const reducers = {};

  Object.keys(fixturesContent).forEach(fixtureName => {
    const fixture = fixturesContent[fixtureName];

    if (!fixture.name) {
      throw new Error(
        'Please, add a name to your fixture (used as the key in the state.');
    }

    // create the reducer of the fixture only if it's not already a reducer
    if (!_.isFunction(fixture.reducer)) {
      if (fixture.reducer === undefined) {
        fixture.reducer = {};
      }

      if (fixture.data === undefined) {
        fixture.data = {};
      }

      fixture.reducer = createDummyAction(fixture.reducer);
      reducers[fixture.name] = createReducer(fixture.reducer, fixture.data);
    } else {
      reducers[fixture.name] = fixture.reducer;
    }
  });

  return combineReducers(reducers);
};
