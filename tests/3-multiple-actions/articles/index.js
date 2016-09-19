import { createAction, SchemaObject } from 'main';
import { reducers, selectors as selectors_ } from 'bouchon-toolbox';

import { actions as authorsActions } from '../authors';

const { retrieve, create, update } = reducers;
const { filterRow } = selectors_;


const ArticleSchema = new SchemaObject({
  id: Number,
  title: String,
  body: String,
  dateCreated: String,
  authorId: Number,
});


/**
 * Actions
 */

const actions = {
  get: createAction('Get articles'),
  post: createAction('Post article'),
  patch: createAction('Patch article'),
};


/**
 * Selectors
 */

const selectors = {};

selectors.all = () => state => state.articles;
selectors.byId = ({ id }) => filterRow(selectors.all(), 'id', id);


/**
 * Middlewares
 */

const setTotalCountHeader = data => (req, res, next) => {
  res.set({
    'x-total-count': data.length,
  });

  next();
};


/**
 * Specs
 */

export default {
  name: 'articles',
  data: require('./data.json'),
  reducer: ({
    [actions.get]: state => retrieve(state),
    [actions.post]: (state, { body }) => create(state, body, ArticleSchema),
    [actions.patch]: (state, { params, body }) => (
      update(state, params, body, ArticleSchema)
    ),
  }),
  endpoint: 'articles',
  routes: {
    'GET /': {
      action: actions.get,
      selector: selectors.all,
      middlewares: [setTotalCountHeader],
      status: 200,
    },
    'GET /:id': {
      action: { action: actions.get, delay: [400, 500] },
      selector: selectors.byId,
      status: 200,
    },
    'POST /': {
      responseBody: {
        operationId: 123456,
        status: 'RUNNING',
      },
      backendAction: { action: actions.post, delay: 1000 },
      status: 201,
    },
    'PATCH /:id': {
      backendAction: { action: [actions.patch, authorsActions.patch], delay: 1000 },
      status: 204,
    },
  },
};
