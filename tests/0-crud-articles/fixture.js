// eslint-disable-next-line
import { createAction, createSelector } from 'main';

const data = require('./data.json');

/**
 * Actions
 */
const getArticles = createAction('Get articles');

const createArticle = createAction('Create an article');

const updateArticle = createAction('Update an article');

const deleteArticle = createAction('Delete an article');

/**
 * Reducer
 */
const reducer = {
  [getArticles]: state => state,

  [createArticle]: (state, { body }) => state.concat(body),

  [updateArticle]: (state, { params, body }) => {
    const index = state.findIndex(art => Number(art.id) === Number(params.articleId));

    // if not found, return
    if (index < 0) {
      return state;
    }

    // update the article found
    return [].concat(
      state.slice(0, index),
      Object.assign(state[index], body),
      state.slice(index + 1),
    );
  },

  [deleteArticle]: (state, { params }) => (
    state.slice(0).filter(art => Number(art.id) !== Number(params.articleId))
  ),
};

/**
 * Selectors
 */
const selectAll = state => state.articles;

const selectById = createSelector(
  selectAll,
  (_, props) => props,
  (articles, { params }) => (
    articles.filter(art => Number(art.id) === Number(params.articleId))[0]
  ),
);

/**
 * Route definition
 */
const routes = {
  'GET /': {
    action: getArticles,
    selector: selectAll,
    status: 200,
  },
  'GET /:articleId': {
    action: getArticles,
    selector: selectById,
    status: selectedData => (selectedData ? 200 : 404),
  },
  'POST /': {
    action: createArticle,
    selector: selectById,
    status: 201,
  },
  'PATCH /:articleId': {
    action: updateArticle,
    selector: selectById,
    status: selectedData => (selectedData ? 200 : 406),
  },
  'DELETE /:articleId': {
    action: deleteArticle,
    status: 204,
  },
};

export default {
  name: 'articles',
  data,
  endpoint: 'articles',
  reducer,
  routes,
};
