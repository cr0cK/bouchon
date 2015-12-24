/* eslint no-console: 0 */

import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import { api as bouchon } from 'api';

import { fetch } from '../helpers/fetch';


const expect = chai.expect;

describe('1 - List articles', function test() {
  this.timeout(10000);
  this.port = undefined;

  before((done) => {
    freeport((err, port) => {
      this.port = port;
      const pathFixtures = path.resolve(__dirname);
      bouchon.server.start({ path: pathFixtures, port })
        .then(() => done())
        .catch(done);
    });
  });

  after((done) => {
    bouchon.server.stop().then(() => done());
  });

  it('should return articles', (done) => {
    fetch('get', {
      hostname: 'localhost',
      port: this.port,
      path: '/articles',
    }).then(json => {
      expect(json.length).to.equal(25);
      expect(bouchon.logs.get()).to.deep.equal([{
        method: 'GET',
        originalUrl: '/articles',
        statusCode: 200,
        query: {},
        params: {},
        body: {},
      }]);

      done();
    }).catch(done);
  });
});
