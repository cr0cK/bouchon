/* eslint no-console: 0 */

import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import { api as bouchon } from 'api';
import request from 'request';


const expect = chai.expect;

describe('1 - List articles', function test() {
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
        expect(JSON.parse(body).length).to.equal(3);

        done();
      }
    );
  });

  it('should return one article after a delay', (done) => {
    const start = new Date().getTime();

    request(
      `http://localhost:${this.port}/articles/1`,
      (err, res, body) => {
        if (err) { done(err); }

        const end = new Date().getTime();
        const time = end - start;

        expect(res.statusCode).to.equal(200);
        expect(time).to.be.within(400, 550);
        expect(JSON.parse(body)).to.deep.equal({
          'id': 1,
          'title': 'cillum eu esse',
          'body': 'Culpa in duis mollit ullamco minim quis ullamco eu. Veniam duis consequat ad veniam commodo. Labore laboris commodo aliquip ad labore non. Sit commodo nostrud id voluptate voluptate magna exercitation eu occaecat officia pariatur. Enim adipisicing quis fugiat et do esse non mollit. Officia exercitation irure culpa anim excepteur minim dolore duis.',
          'date_created': 'Tuesday, October 20, 2015 2:34 PM',
          'author_id': 1,
        });

        done();
      }
    );
  });

  it('should create an article', (done) => {
    request.post(
      `http://localhost:${this.port}/articles`,
      { form: {
        title: 'Title1',
        body: 'Body1',
        date_created: this.dateCreated,
        author_id: 2,
      }},
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
});
