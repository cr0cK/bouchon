import { combineFixturesReducers } from './combineFixturesReducers';
import { combineFixturesRoutes } from './combineFixturesRoutes';


/**
 * Combine reducers and routes from fixtures definitions.
 *
 * @param  {Object} fixtures Object describing the child fixtures
 * @return {Object}          Object to merge to an existing fixture
 */
export const combineFixtures = (fixtures) => {
  return {
    reducer: combineFixturesReducers(fixtures),
    routes: combineFixturesRoutes(fixtures),
  };
};
