// @flow

// $FlowFixMe
import { router } from 'main'; // eslint-disable-line

import { startBouchon } from '../../helpers';
import rootFixture from '../fixture';


describe('0-crud-articles', () => {
  describe('GET /articles', function desc() {
    beforeAll((done) => {
      startBouchon(rootFixture)
        .then(({ requester }) => {
          this.requester = requester;
          done();
        })
        .catch(done);
    });

    it('should get articles', () => {
      return this.requester.get('/articles')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(200);
          expect(body).toEqual([
            {
              id: 1,
              title: 'title 1',
              body: 'body 1',
            },
            {
              id: 2,
              title: 'title 2',
              body: 'body 2',
            },
          ]);
        });
    });
  });

  describe('GET /articles/:id', function desc() {
    beforeAll((done) => {
      startBouchon(rootFixture)
        .then(({ requester }) => {
          this.requester = requester;
          done();
        })
        .catch(done);
    });

    it('should get one article', () => {
      this.requester.get('/articles/1')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(200);
          expect(body).toEqual({
            id: 1,
            title: 'title 1',
            body: 'body 1',
          });
        });
    });

    it('should return a 404 if the article has not been found', () => {
      return this.requester.get('/articles/42')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(404);
          expect(body).toBeUndefined;
        });
    });
  });

  describe('POST /articles', function desc() {
    beforeAll((done) => {
      startBouchon(rootFixture)
        .then(({ requester }) => {
          this.requester = requester;
          done();
        })
        .catch(done);
    });

    it('should create one article', () => {
      const jsonData = {
        id: 3,
        title: 'title 3',
        body: 'body 3',
      };

      this.requester.post('/articles', jsonData)
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(201);
          expect(body).toEqual({
            id: 3,
            title: 'title 3',
            body: 'body 3',
          });
        });
    });

    it('should get all articles plus the one added', () => {
      this.requester.get('/articles')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(200);
          expect(body).toEqual([
            {
              id: 1,
              title: 'title 1',
              body: 'body 1',
            },
            {
              id: 2,
              title: 'title 2',
              body: 'body 2',
            },
            {
              id: 3,
              title: 'title 3',
              body: 'body 3',
            },
          ]);
        });
    });
  });

  describe('PATCH /articles/:1', function desc() {
    beforeAll((done) => {
      startBouchon(rootFixture)
        .then(({ requester }) => {
          this.requester = requester;
          done();
        })
        .catch(done);
    });

    it('should update one article', () => {
      const jsonData = {
        id: 1,
        title: 'title 1 bis',
        body: 'body 1',
      };

      this.requester.patch('/articles/1', jsonData)
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(200);
          expect(body).toEqual({
            id: 1,
            title: 'title 1 bis',
            body: 'body 1',
          });
        });
    });

    it('should get articles with the update one', () => {
      this.requester.get('/articles')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(200);
          expect(body).toEqual([
            {
              id: 1,
              title: 'title 1 bis',
              body: 'body 1',
            },
            {
              id: 2,
              title: 'title 2',
              body: 'body 2',
            },
          ]);
        });
    });

    it('should return a 406 with no content if the article has not been found', () => {
      this.requester.patch('/articles/42', {})
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(406);
          expect(body).toEqual('');
        });
    });
  });

  describe('DELETE /articles/1', function desc() {
    beforeAll((done) => {
      startBouchon(rootFixture)
        .then(({ requester }) => {
          this.requester = requester;
          done();
        })
        .catch(done);
    });

    it('should delete one article', () => {
      this.requester.delete('/articles/1')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(204);
          expect(body).toEqual('');
        });
    });

    it('should get all articles except the one delete', () => {
      this.requester.get('/articles')
        .then(([res, body]) => {
          expect(res.statusCode).toEqual(200);
          expect(body).toEqual([
            {
              id: 2,
              title: 'title 2',
              body: 'body 2',
            },
            {
              id: 3,
              title: 'title 3',
              body: 'body 3',
            },
          ]);
        });
    });
  });
});
