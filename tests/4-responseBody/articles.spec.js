/* eslint func-names: 0 */
/* eslint no-console: 0 */

import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import { api as bouchon } from 'api';
import request from 'request';


const expect = chai.expect;

describe('4-responseBody', function() {
  this.timeout(10000);
  this.port = undefined;
  this.dateCreated = String(new Date());

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

  it('checks `responseBody` when it\'s an object', (done) => {
    request(
      `http://localhost:${this.port}/articles`,
      (err, res, body) => {
        if (err) { done(err); }

        expect(res.statusCode).to.equal(500);
        expect(JSON.parse(body)).to.deep.equal({
          error: 'Something doesnt work',
        });

        done();
      }
    );
  });

  it('checks `responseBody` when it\'s a function', (done) => {
    Promise.all([
      new Promise((resolve, reject) => {
        request(
          `http://localhost:${this.port}/articles/1`,
          (err_, res_, body_) => {
            if (err_) { reject(err_); }

            expect(res_.statusCode).to.equal(200);
            expect(JSON.parse(body_)).to.deep.equal({
              error: 'Article protected',
            });

            resolve();
          }
        );
      }),
      new Promise((resolve, reject) => {
        request(
          `http://localhost:${this.port}/articles/2`,
          (err_, res_, body_) => {
            if (err_) { reject(err_); }

            expect(res_.statusCode).to.equal(200);
            expect(JSON.parse(body_)).to.deep.equal({
              id: 2,
              title: 'My title 2',
              body: 'My body 2',
            });

            resolve();
          }
        );
      }),
    ]).then(() => done())
      .catch(done);
  });
});
