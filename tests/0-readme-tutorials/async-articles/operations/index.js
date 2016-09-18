import { createAction, createSelector } from 'main';

/**
 * Actions
 */

export const actions = {
  get: createAction('Retrieve operations'),
  create: createAction(
    'Create an operation',
    args => args,
    (args, meta) => meta,
  ),
  setToDone: createAction('Set an operation to done'),
};

/**
 * Reducers
 */

const reducer = {
  [actions.get]: state => state,
  [actions.create]: (state, { req, body }, meta) => {
    const nextId = Math.max(...state.map(op => Number(op.id))) + 1;
    req.operationId = nextId;   // eslint-disable-line no-param-reassign

    return [
      ...state, {
        id: nextId,
        status: 'RUNNING',
        data: body,
        ...meta,
      },
    ];
  },
  [actions.setToDone]: (state, { req }) => {
    const { operationId } = req;
    const operation = state
      .filter(op => Number(op.id) === Number(operationId))
      .pop();

    if (operation) {
      operation.status = 'DONE';
    }

    return [
      ...state.filter(op => Number(op.id) !== Number(req.operationId)),
      operation,
    ];
  },
};

/**
 * Selectors
 */

export const selectors = {};
selectors.all = () => state => state.operations;

selectors.byId = ({ id }) => createSelector(
  selectors.all(),
  opers => opers.filter(op => Number(op.id) === Number(id)).pop()
);

selectors.lastId = () => createSelector(
  selectors.all(),
  operations => operations[operations.length - 1]
);

/**
 * Routes
 */

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
};

export default {
  name: 'operations',
  data: require('./data.json'),
  endpoint: 'operations',
  reducer,
  routes,
};
