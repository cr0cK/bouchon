import { createAction, SchemaObject } from 'main';
import { reducers, selectors as selectors_ } from 'bouchon-toolbox';

const { retrieve, create } = reducers;
const { selectRow } = selectors_;


const ArticleSchema = new SchemaObject({
  id: Number,
  title: String,
  body: String,
  date_created: String,
  author_id: Number,
});


/**
 * Actions
 */

const actions = {
  get: createAction('GET_ARTICLES'),
  post: createAction('POST_ARTICLES'),
  postBackend: createAction('POST_BACKEND_ARTICLES'),
};


/**
 * Selectors
 */

const selectors = {};

selectors.all = () => state => state.articles;

selectors.byId = ({id}) => selectRow(selectors.all, 'id', id);


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
    [actions.post]: state => retrieve(state),
    [actions.postBackend]: (state, params) => create(state, params.body, ArticleSchema),
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
      action: {action: actions.get, delay: [400, 500]},
      selector: selectors.byId,
      status: 200,
    },
    'POST /': {
      responseBody: {
        operationId: 123456,
        status: 'RUNNING',
      },
      backendAction: {action: actions.postBackend, delay: 1050},
      status: 201,
    },
    'DELETE /:id': {
      middlewares: [() => ({res}) => res.send('Not implemented.')],
    },
  },
};
