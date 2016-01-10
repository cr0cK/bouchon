import { createAction } from 'main';


/**
 * Actions
 */

const actions = {
  get: createAction(),
};


/**
 * Selectors
 */

export const selectors = {};

selectors.authors = () => state => state.library.paris.authors;


/**
 * Specs
 */

export default {
  name: 'authors',
  endpoint: 'authors',
  data: require('./data.json'),
  reducer: {
    [actions.get]: state => state,
  },
  routes: {
    'GET /': {
      action: actions.get,
      selector: selectors.authors,
      status: 200,
    },
  },
};
