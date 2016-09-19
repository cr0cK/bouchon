import { createAction, SchemaObject } from 'main';
import { reducers, selectors as selectors_ } from 'bouchon-toolbox';

const { update } = reducers;
const { filterRow } = selectors_;


const AuthorSchema = new SchemaObject({
  id: Number,
  firstName: String,
  lastName: String,
});


/**
 * Actions
 */

export const actions = {
  get: createAction('Get authors'),
  patch: createAction('Patch author'),
};


/**
 * Selectors
 */

export const selectors = {};

selectors.all = () => state => state.authors;
selectors.byId = ({ id }) => filterRow(selectors.all(), 'id', id);


/**
 * Specs
 */

export default {
  name: 'authors',
  endpoint: 'authors',
  data: require('./data.json'),
  reducer: {
    [actions.get]: state => state,
    [actions.patch]: (state, { params, body }) => (
      update(state, params, body, AuthorSchema)
    ),
  },
  routes: {
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
    'PATCH /:id': {
      action: actions.patch,
      status: 204,
    },
  },
};
