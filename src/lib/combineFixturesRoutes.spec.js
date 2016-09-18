/* eslint func-names: 0 */

import chai from 'chai';
import rewire from 'rewire';

const combineFixturesRoutesModule = rewire('./combineFixturesRoutes');

const expect = chai.expect;

describe('combineFixturesRoutes', function () {
  const combineFixturesRoutes = combineFixturesRoutesModule.__get__('combineFixturesRoutes');

  it('returns a combined object of routes', () => {
    const routes = {
      books: {
        endpoint: 'books',
        routes: {
          'GET /': {
            action: 'myaction',
            selector: 'myselector',
            status: 200,
          },
        },
      },
      authors: {
        endpoint: 'authors',
        routes: {
          'GET /': {
            action: 'myaction2',
            selector: 'myselector2',
            status: 200,
          },
          'GET /:id': {
            action: 'myaction3',
            selector: 'myselector3',
            status: 200,
          },
        },
      },
    };

    expect(combineFixturesRoutes(routes)).to.deep.equal({
      'GET /books/': {
        action: 'myaction',
        selector: 'myselector',
        status: 200,
      },
      'GET /authors/': {
        action: 'myaction2',
        selector: 'myselector2',
        status: 200,
      },
      'GET /authors/:id': {
        action: 'myaction3',
        selector: 'myselector3',
        status: 200,
      },
    });
  });
});
