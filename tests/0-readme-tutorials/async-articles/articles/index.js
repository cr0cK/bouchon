import { createAction } from 'main';
import { actions as operationsActions,
         selectors as operationsSelectors } from '../operations';

/**
 * Actions
 */

const actions = {
  get: createAction('Retrieve articles'),
  create: createAction('Create an article'),
};

/**
 * Reducers
 */

const reducer = {
  [actions.get]: state => state,
  [actions.create]: (state, params) => ([
    ...state, {
      id: Math.max(...state.map(art => Number(art.id))) + 1,
      ...params.body,
    },
  ]),
};

/**
 * Selectors
 */

const selectors = {};
selectors.all = () => state => state.articles;

/**
 * Routes
 */

const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
  'POST /': {
    action: { action: operationsActions.create, meta: { type: 'create_article' } },
    backendAction: {
      action: [actions.create, operationsActions.setToDone],
      delay: 1000,
      meta: { type: 'foobar' },
    },
    selector: operationsSelectors.lastId,
    status: 201,
  },
};

export default {
  name: 'articles',
  data: require('./data.json'),
  endpoint: 'articles',
  reducer,
  routes,
};
