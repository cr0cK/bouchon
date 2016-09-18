/* eslint func-names: 0 */
/* eslint no-console: 0 */

import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import { api as bouchon } from 'api';
import request from 'request';


const expect = chai.expect;

describe('3-multiple-actions', function () {
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

  it('should create an article with a backend action', (done) => {
    request.post(
      `http://localhost:${this.port}/articles`,
      { form: {
        title: 'My Title',
        body: 'My Body',
        date_created: this.dateCreated,
        author_id: 2,
      } },
      (err, res, body) => {
        if (err) { done(err); }

        expect(res.statusCode).to.equal(201);
        expect(JSON.parse(body)).to.deep.equal({
          operationId: 123456,
          status: 'RUNNING',
        });

        // wait the backend action
        setTimeout(() => {
          request(
            `http://localhost:${this.port}/articles`,
            (err_, res_, body_) => {
              if (err_) { done(err_); }

              expect(res_.statusCode).to.equal(200);
              expect(JSON.parse(body_).length).to.equal(4);

              done();
            }
          );
        }, 1500);
      }
    );
  });

  it('should update an article and the author with backend actions', (done) => {
    request.patch(
      `http://localhost:${this.port}/articles/1`,
      { form: {
        title: 'Title 1 patched',
        lastName: 'Last name patched',
        authorId: 1,
      } },
      (err, res) => {
        if (err) { done(err); }

        expect(res.statusCode).to.equal(204);

        // wait the backend action
        setTimeout(() => {
          Promise.all([
            new Promise((resolve, reject) => {
              request(
                `http://localhost:${this.port}/articles/1`,
                (err_, res_, body_) => {
                  if (err_) { reject(err_); }

                  expect(res_.statusCode).to.equal(200);
                  expect(JSON.parse(body_)).to.deep.equal({
                    id: 1,
                    title: 'Title 1 patched',
                    body: 'My body',
                    dateCreated: 'Tuesday, October 20, 2015 2:34 PM',
                    authorId: 1,
                  });

                  resolve();
                }
              );
            }),
            new Promise((resolve, reject) => {
              request(
                `http://localhost:${this.port}/authors/1`,
                (err_, res_, body_) => {
                  if (err_) { reject(err_); }

                  expect(res_.statusCode).to.equal(200);
                  expect(JSON.parse(body_)).to.deep.equal({
                    id: 1,
                    firstName: 'Jamie',
                    lastName: 'Last name patched',
                  });

                  resolve();
                }
              );
            }),
          ]).then(() => done())
            .catch(done);
        }, 1500);
      }
    );
  });
});
