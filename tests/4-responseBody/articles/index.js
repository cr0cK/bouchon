import { createAction } from 'main';
import { selectors as selectors_ } from 'bouchon-toolbox';

const { filterRow } = selectors_;


/**
 * Actions
 */

const actions = {
  get: createAction('Get articles'),
};


/**
 * Selectors
 */

const selectors = {};

selectors.all = () => state => state.articles;
selectors.byId = ({ id }) => filterRow(selectors.all(), 'id', id);


/**
 * Specs
 */

export default {
  name: 'articles',
  data: require('./data.json'),
  reducer: ({
    [actions.get]: state => state,
  }),
  endpoint: 'articles',
  routes: {
    'GET /': {
      action: actions.get,
      responseBody: {
        error: 'Something doesnt work',
      },
      status: 500,
    },
    'GET /:id': {
      action: actions.get,
      // some weird stuff just to check that it works...
      responseBody: ({ id }) => state => {
        if (Number(id) === 42) return { error: 'Article not found' };
        if (Number(id) === 1) return { error: 'Article protected' };
        return selectors.byId({ id })(state);
      },
      status: 200,
    },
  },
};
