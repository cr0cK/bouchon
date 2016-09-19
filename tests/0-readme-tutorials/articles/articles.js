import { createAction, createSelector } from 'main';

const actions = {
  get: createAction('Retrieve articles'),
  post: createAction('Create an article'),
  delete: createAction('Delete an article'),
};

const reducer = {
  [actions.get]: state => state,
  [actions.post]: (state, params) => ([
    ...state,
    params.body,
  ]),
  [actions.delete]: (state, { params }) => {
    const copy = state.slice(0);    // be careful to never mutate the state
    return copy.filter(art => Number(art.id) !== Number(params.id));
  },
};

const selectors = {};
selectors.all = () => state => state.articles;
selectors.byId = ({ id }) => createSelector(
  selectors.all(),
  articles => articles.filter(art => Number(art.id) === Number(id)).pop()
);

const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
  'GET /:id': {
    action: actions.get,
    selector: selectors.byId,
    status: 200,
  },
  'POST /:id': {
    action: actions.post,
    selector: selectors.byId,
    status: 201,
  },
  'DELETE /:id': {
    action: actions.delete,
    status: 204,
  },
};

export default {
  name: 'articles',
  data: require('./data.json'),
  endpoint: 'articles',
  reducer,
  routes,
};
