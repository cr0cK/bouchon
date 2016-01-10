import { createAction } from 'main';
import { selectors as toolboxSelectors } from 'bouchon-toolbox';

import { selectors as authorSelectors } from '../authors';

const { extendRows } = toolboxSelectors;


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

selectors.books = () => state => state.library.paris.books;

selectors.all = () => extendRows(
  selectors.books,
  'author_id',
  authorSelectors.authors,
  'id',
  'author',
);


/**
 * Specs
 */

export default {
  name: 'books',
  endpoint: 'books',
  data: require('./data.json'),
  reducer: {
    [actions.get]: state => state,
  },
  routes: {
    'GET /': {
      action: actions.get,
      selector: selectors.all,
      status: 200,
    },
  },
};
