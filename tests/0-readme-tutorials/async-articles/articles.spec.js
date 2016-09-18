/* eslint func-names: 0 */
/* eslint no-console: 0 */

import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import { api as bouchon } from 'api';
import request from 'request';


const expect = chai.expect;

describe('0-readme-tutorials', function () {
  describe('Import/export actions, backend actions, meta', function () {
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

    it('should return articles', (done) => {
      request(
        `http://localhost:${this.port}/articles`,
        (err, res, body) => {
          if (err) { done(err); }

          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body).length).to.equal(2);

          done();
        }
      );
    });

    it('should add an operation when posting a new article', (done) => {
      request.post(
        `http://localhost:${this.port}/articles`,
        { form: {
          title: 'New title',
          body: 'New body',
        } },
        (err, res, body) => {
          if (err) { done(err); }

          expect(res.statusCode).to.equal(201);
          expect(JSON.parse(body)).to.deep.equal({
            id: 2,
            status: 'RUNNING',
            data: {
              title: 'New title',
              body: 'New body',
            },
            type: 'create_article',
          });

          // wait the backend action
          setTimeout(() => done(), 1500);
        }
      );
    });

    it('should create the article after a delay with the data of the operation', (done) => {
      request(
        `http://localhost:${this.port}/articles`,
        (err, res, body) => {
          if (err) { done(err); }

          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.equal([{
            id: 1,
            title: 'title 1',
            body: 'body 1',
          }, {
            id: 2,
            title: 'title 2',
            body: 'body 2',
          }, {
            id: 3,
            title: 'New title',
            body: 'New body',
          }]);

          done();
        }
      );
    });

    it('should have set the operation to DONE', (done) => {
      request(
        `http://localhost:${this.port}/operations/2`,
        (err, res, body) => {
          if (err) { done(err); }

          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.equal({
            id: 2,
            data: {
              title: 'New title',
              body: 'New body',
            },
            type: 'create_article',
            status: 'DONE',
          });

          done();
        }
      );
    });
  });
});
