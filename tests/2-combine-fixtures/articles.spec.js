/* eslint func-names: 0 */
/* eslint no-console: 0 */

import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import { api as bouchon } from 'api';
import request from 'request';


const expect = chai.expect;

describe('2-combine-fixtures', function () {
  describe('should return books with authors', function () {
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

    it('of Paris library', (done) => {
      request(
        `http://localhost:${this.port}/library/paris/books`,
        (err, res, body) => {
          if (err) { done(err); }

          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.equal([{
            index: 1,
            title: 'reprehenderit eiusmod voluptate esse paris',
            author_id: 3,
            author: {
              id: 3,
              last: 'Freeman',
              first: 'Lola',
            },
          }, {
            index: 2,
            title: 'proident cillum ea elit paris',
            author_id: 2,
            author: {
              id: 2,
              last: 'Tanner',
              first: 'Pope',
            },
          }, {
            index: 3,
            title: 'ipsum cupidatat voluptate enim paris',
            author_id: 1,
            author: {
              id: 1,
              last: 'Hodges',
              first: 'Jamie',
            },
          }]);

          done();
        }
      );
    });

    it('of London library', (done) => {
      request(
        `http://localhost:${this.port}/library/london/books`,
        (err, res, body) => {
          if (err) { done(err); }

          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.equal([{
            index: 1,
            title: 'reprehenderit eiusmod voluptate esse',
            author_id: 3,
            author: {
              id: 3,
              last: 'Freeman',
              first: 'Lola',
            },
          }, {
            index: 2,
            title: 'proident cillum ea elit',
            author_id: 2,
            author: {
              id: 2,
              last: 'Tanner',
              first: 'Pope',
            },
          }, {
            index: 3,
            title: 'ipsum cupidatat voluptate enim',
            author_id: 1,
            author: {
              id: 1,
              last: 'Hodges',
              first: 'Jamie',
            },
          }]);

          done();
        }
      );
    });
  });
});
