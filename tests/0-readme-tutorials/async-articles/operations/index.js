import { createAction, createSelector } from 'main';

export const actions = {
  get: createAction('Retrieve operations'),
  create: createAction('Create an operation'),
  setToDone: createAction('Set an operation to done'),
};

const reducer = {
  [actions.get]: state => state,
  [actions.create]: (state, {req, body}) => {
    const nextId = Math.max(...state.map(op => Number(op.id))) + 1;
    req.operationId = nextId;

    return [
      ...state, {
        id: nextId,
        status: 'RUNNING',
        ...body,
      },
    ];
  },
  [actions.setToDone]: (state, {req}) => {
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

export const selectors = {};
selectors.all = () => state => state.operations;
selectors.lastId = () => createSelector(
  selectors.all(),
  operations => operations[operations.length - 1]
);

const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
};

export default {
  name: 'operations',
  data: require('./data.json'),
  endpoint: 'operations',
  reducer: reducer,
  routes: routes,
};
