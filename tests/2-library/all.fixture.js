require('babel-core/register');
require('babel-polyfill');

module.exports = {
  default: [
    require('./library').default,
  ],
};
