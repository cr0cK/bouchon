import { createAction } from 'main';
import { actions as operationsActions,
         selectors as operationsSelectors } from '../operations';


const actions = {
  get: createAction('Retrieve articles'),
  create: createAction('Create an article'),
};

const reducer = {
  [actions.get]: state => state,
  [actions.create]: (state, params) => ([
    ...state, {
      id: Math.max(...state.map(art => Number(art.id))) + 1,
      ...params.body,
    },
  ]),
};

const selectors = {};
selectors.all = () => state => state.articles;

const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
  'POST /': {
    action: operationsActions.create,
    backendAction: {
      action: [actions.create, operationsActions.setToDone],
      delay: 5000,
    },
    selector: operationsSelectors.lastId,
    status: 201,
  },
};

export default {
  name: 'articles',
  data: require('./data.json'),
  endpoint: 'articles',
  reducer: reducer,
  routes: routes,
};
