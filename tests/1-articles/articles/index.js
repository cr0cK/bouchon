import { createAction, createSelector } from 'main';


/**
 * Actions
 */

const actions = {
  get: createAction(),
};


/**
 * Selectors
 */

const selectors = {};

selectors.all = () => state => state.articles;

selectors.byId = ({id}) => createSelector(
  selectors.all(),
  articles => articles.filter(article => Number(article.id) === Number(id)).pop(),
);


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
    [actions.get]: state => state,
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
      action: actions.get,
      selector: selectors.byId,
      status: 200,
      delay: [150, 500],
    },
    'GET /some/error': {
      middlewares: [() => (req, res) => res.status(500).send('Something broke!')],
    },
  },
};
