require('babel-core/register');
require('babel-polyfill');

module.exports = {
  default: [
    require('./articles.fixture').default,
    // require('./operations').default,
  ],
};
