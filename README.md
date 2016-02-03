<div align="center">
  <img src="https://raw.githubusercontent.com/cr0cK/bouchon/assets/assets/images/bouchon-icon.png" />
</div>

# bouchon

Efficient API mocking with cool libraries.

## Summary

- [Big picture](#big-picture)
- [Before using bouchon](#before-using-bouchon)
- [Quick start](#quick-start)
  - [JSON data](#json-data)
  - [Actions](#actions)
  - [Selectors](#selectors)
  - [Reducers](#reducers)
  - [Routes](#routes)
  - [Summary](#summary)
  - [Start bouchon](#start-bouchon)
- [Advanced usage](#advanced-usage)
  - [Export actions](#export-actions)
  - [Export selectors](#export-selectors)
  - [Multiple actions](#multiple-actions)
  - [Backend actions](#backend-actions)
  - [Asynchronous sample](#asynchronous-sample)
  - [Delays](#delays)
  - [Middlewares](#middlewares)
  - [Combine fixtures](#combine-fixtures)
  - [Use Babel for your fixtures](#use-babel-for-your-fixtures)
- [Bouchon full API](#bouchon-full-api)
- [Use bouchon for integration testing](#use-bouchon-for-integration-testing)
- [Installation](#installation)
- [Other related packages](#other-related-packages)
- [License](#license)


## Big picture

Bouchon provides a way to make mocks easily with [redux](https://github.com/rackt/redux) and
[reselect](https://github.com/rackt/reselect).

Redux keeps your API stateful in order to create / edit / delete objects in a fake API and
reselect allows to retrieve any data from that state.

You define some data in a JSON file and your actions / reducers / selectors / middlewares / routes in a JS file.
These two files is what I call a _fixture_.

Each route (verb + url) defines an action, a selector and some optional middlewares.


## Before using bouchon

It is advisable to be comfortable with the following softs and techniques for using bouchon:

- [redux](https://github.com/rackt/redux)
- [reselect](https://github.com/rackt/reselect)
- [Currying techniques](http://www.sitepoint.com/currying-in-functional-javascript/)
- [ES2015](https://babeljs.io/docs/learn-es2015/)


## Quick start

Follow the following instructions to make your first fixture. The full code is available in
[the repository](https://github.com/cr0cK/bouchon/tree/master/tests/0-readme-tutorials).

Start an empty project, [install bouchon](#installation) and create folders and files:

```
$ mkdir bouchon-tutorial && cd $_
$ npm init
$ npm install bouchon --save-dev
$ touch data.json && touch articles.fixture.js
```

### JSON data

Each fixture defines a JSON files with some data that will be saved in the state:

```
// data.json

[
  {
    "id": 1,
    "title": "title 1",
    "body": "body 1"
  },
  {
    "id": 2,
    "title": "title 2",
    "body": "body 2"
  }
]
```

### Actions

In order to limit the boilerplate, bouchon uses [redux-act](https://github.com/pauldijou/redux-act)
that provides a simpler API to create actions and reducers. No types and switch cases are required.

Start by creating some actions:

```js
// articles.fixture.js

import { createAction } from 'bouchon';

const actions = {
  get: createAction('Retrieve articles'),
  post: createAction('Create an article'),
  delete: createAction('Delete an article'),
};
```

### Selectors

Continue by writing some selectors. Selectors uses [reselect](https://github.com/rackt/reselect) and are
used to select data from the state.

```js
// articles.fixture.js

import { createSelector } from 'bouchon';

// [...]

const selectors = {};
selectors.all = () => state => state.articles;
selectors.byId = ({id}) => createSelector(
  selectors.all(),
  articles => articles.filter(art => Number(art.id) === Number(id)).pop()
);
```

- The first curried function takes a merge of query, params and body parameters.
- The second takes the full `state` allowing to select any part of data.

### Reducers

Like every redux apps, you have to implement reducers that will maintain the state according to dispatched actions.

Here a basic implementation for the GET, POST, DELETE actions
(reminder, bouchon is using [redux-act](https://github.com/pauldijou/redux-act)
and the syntax is different that one you may know):

```js
// articles.fixture.js

// [...]

const reducer = {
  [actions.get]: state => state,
  [actions.post]: (state, {body}) => ([
    ...state,
    body,
  ]),
  [actions.delete]: (state, {params}) => {
    const copy = state.slice(0);    // be careful to never mutate the state
    return copy.filter(art => Number(art.id) !== Number(params.id));
  },
};
```

Each function of the reducer takes the `state` the current fixture (not the full state)
and an object with `req`, `res`, `query` parameters, `params` parameters, `body` parameters
and must return a new state (be careful to *NEVER* mutate the state).

### Routes

Now, we have to define the routes of our API.

```js
// articles.fixture.js

// [...]

const routes: {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
  'GET /:id': {
    action: actions.get,
    selector: selectors.byId,
    status: 200,
  },
  'POST /:id': {
    action: actions.post,
    selector: selectors.byId,
    status: 201,
  },
  'DELETE /:id': {
    action: actions.delete,
    status: 204,
  },
};
```

### Summary

Add a `name` that will be used as the key in the state where your `data` live and you're done.

See the full fixture:

```js
// article.fixture.js

import { createAction, createSelector } from 'bouchon';

const actions = {
  get: createAction('Retrieve articles'),
  post: createAction('Create an article'),
  delete: createAction('Delete an article'),
};

const reducer = {
  [actions.get]: state => state,
  [actions.post]: (state, params) => ([
    ...state,
    params.body,
  ]),
  [actions.delete]: (state, {params}) => {
    const copy = state.slice(0);    // be careful to never mutate the state
    return copy.filter(art => Number(art.id) !== Number(params.id));
  },
};

const selectors = {};
selectors.all = () => state => state.articles;
selectors.byId = ({id}) => createSelector(
  selectors.all(),
  articles => articles.filter(art => Number(art.id) === Number(id)).pop()
);

const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
  'GET /:id': {
    action: actions.get,
    selector: selectors.byId,
    status: 200,
  },
  'POST /:id': {
    action: actions.post,
    selector: selectors.byId,
    status: 201,
  },
  'DELETE /:id': {
    action: actions.delete,
    status: 204,
  },
};

export default {
  name: 'articles',
  data: require('./data.json'),
  reducer: reducer,
  endpoint: 'articles',
  routes: routes,
};
```

### Start bouchon

Start bouchon by providing your fixture folder and an optional port:

```
./node_modules/.bin/bouchon -d . -p 3000
```

You should see bouchon registering your urls:

```
00:32:21.938Z  INFO server: Registering "GET /articles/"
00:32:21.941Z  INFO server: Registering "GET /articles/:id"
00:32:21.942Z  INFO server: Registering "POST /articles/:id"
00:32:21.942Z  INFO server: Registering "DELETE /articles/:id"
00:32:22.001Z  INFO server: App listening at port 3000.
```

Do a GET to retrieve articles:

```bash
$ curl http://localhost:3000/articles  | python -mjson.tool
[
    {
        "body": "body 1",
        "id": 1,
        "title": "title 1"
    },
    {
        "body": "body 2",
        "id": 2,
        "title": "title 2"
    }
]
```

Do a DELETE to remove an article:

```bash
$ curl -X DELETE http://localhost:5556/articles/1
$ curl http://localhost:3000/articles  | python -mjson.tool
[
    {
        "body": "body 2",
        "id": 2,
        "title": "title 2"
    }
]
```

Hey, it works!


## Advanced usage

Now that you have an idea of how bouchon works, let's continue with complex workflows.

### Export actions

You should split your data and fixture by API namespace.
For example, if you have `./api/articles` and `./api/operations`, make two fixtures
that each handles their data.

But if you need to alter the state of an another fixture, you can export your
actions and reuse them in any fixture.

### Export selectors

In the same way, you can export selectors.

Imagine that you have 2 fixtures like articles and authors. If you want to join the data of both
in a single request, you can do something like that:

```js
// authors/index.js

export const selectors = {}
selectors.all = () => state => state.authors;

export default {
  name: 'authors',
  data: require('./data.json'),
};

// [...]

// articles/index.js

import { createSelector } from 'bouchon';
import { selectors as authorsSelectors } from '../authors';

export const selectors = {};
selectors.all = () => state => state.articles;

selectors.allWithAuthors = () => createSelector(
  selectors.all(),
  authorsSelectors.all(),
  (articles, authors) => {
    return articles.map(art => ({
      ...art,
      author: authors.filter(auth => Number(auth.id) === Number(art.authorId)).pop(),
    }));
  }
);

const routes = {
  'GET /': {
    selector: selectors.allWithAuthors,
    status: 200,
  },
};

export default {
  name: 'articles',
  data: require('./data.json'),
  routes: routes,
};
```

### Multiple actions

Because your data is splitted into several fixtures, you may need to alter the state
of several parts of your state for a single request.

For achieve that, you can use several actions for a route. Each action will be dispatched and will update
the state according to your reducers.

```js
const routes = {
  'POST /': {
    action: [articlesActions.create, operationsActions.setToDone],
    selector: selectors.byId,
    status: 200,
  },
};
```

### Backend actions

In some use cases, the workflow can be asynchronous. For example, an API request can just
respond "OK" and save an object in a queue processed later by a backend process.

Bouchon provides a feature named `backendAction` that allows to dispatch an action
in the future in order to simulate a backend process.

See how to return an object identifier in the request's response and create the object
five seconds later.

```js
const routes = {
  'POST /': {
    action: operationsActions.create,
    backendAction: {
      action: [actions.create, operationsActions.setToDone],
      delay: 5000,
    },
    selector: operationsSelectors.lastId,
    status: 201,
  },
};
```

### Asynchronous sample

To illustrate all the previous options, imagine that workflow:

- When I POST a request on `./articles`, it returns the detail of an operation
that contains the payload data and that will be handled later by an unknown process,
- when the operation has been processed, my article is created in the database
with the payload data of my operation,
- the operation is flagged as 'DONE',
- I can do a GET on `./articles` to list all created articles.

See how you can export / import actions and selectors and how to define your route
with `backendActions` in [this sample](https://github.com/cr0cK/bouchon/tree/master/tests/0-readme-tutorials).


### Delays

Bouchon is useful to test your app in several conditions.

If you want to simulate a slow API, just add a delay in your `action`:

```js
const routes = {
  'GET /': {
    action: {action: operationsActions.create, delay: 2000},
    selector: selectors.all,
    status: 200,
  },
};
```

`delay` can also be an array like `[1000, 5000]` to simulate a delay between 1000 and 5000 milliseconds.


### Middlewares

You certainly know how Express middlewares work? bouchon supports middlewares in the same way.

For example, if you want a complete solution for pagination, you can easily write a middleware like this:

```js
// data is the selected data from your selector
const setPaginationHeaders = data => (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 10;
  const pageCount = Math.ceil(data.length / perPage);
  const totalCount = data.length;
  const slicedData = data.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const headers = {
    'x-page': page,
    'x-per-page': perPage,
    'x-page-count': pageCount,
    'x-total-count': totalCount,
  };

  // if data are set in the response object, bouchon will return that data instead
  // of those selected by your selector
  res.data = slicedData;

  // set pagination headers
  res.set(headers);

  // do not forget to call next to continue the chain
  next();
};
```

Then just declare it in your route:

```js
const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    middlewares: [setPaginationHeaders],
    status: 200,
  },
};
```

### Combine fixtures

If you are already familiar with [redux](https://github.com/rackt/redux),
you certainly know how `combineReducers` work.

Bouchon is providing similar helpers to combine reducers and routes and thus allow
to split your fixtures and data by namespace by using the `endpoint` key.

It will combine the reducers and the routes.


```js
import { combineFixturesReducers, combineFixturesRoutes } from 'main';

import books from './books';
import authors from './authors';

export default {
  name: 'library',
  endpoint: 'library',
  ...combineFixtures({
    books,
    authors,
  }),
};
```

### Use Babel for your fixtures

If you want to write your fixtures with modern Javascript, you have to workaround a
little bit in order to require Babel before your fixtures.

The simplest way is a have only one fixture that requires all the others.
Check it [there](https://github.com/cr0cK/bouchon/blob/master/tests/0-readme-tutorial/all.fixture.js).

## Bouchon full API

TODO

## Use bouchon for integration testing

Bouchon is providing an API useful for integration tests.

For example, to test an app in a browser, you can start bouchon at the beginning of the test,
execute your test with a Selenium based tool and stop bouchon at the end.

Bonus: bouchon is recording all actions done during the test so you can check that
your process did exactly what you are expected at the end of your test.


```js
import path from 'path';
import chai from 'chai';
import freeport from 'freeport';
import request from 'request';
import { api as bouchon } from 'bouchon';


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
    expect(bouchon.logs.get()).to.deep.equal([{
      method: 'GET',
      originalUrl: '/articles',
      statusCode: 200,
      query: {},
      params: {},
      body: {},
    }]);

    bouchon.server.stop()
      .then(() => done())
      .catch(done);
  });

  it('should return articles', (done) => {
    request(`http://localhost:${this.port}/articles`, (err, res, body) => {
      if (err) { done(err); }

      expect(JSON.parse(body).length).to.equal(25);
      done();
    });
  });
});
```

## Installation

```
npm install --save bouchon
```

## Other related packages

- [bouchon-toolbox](https://github.com/cr0cK/bouchon-toolbox): a set of useful reducers, selectors and middlewares for common use cases
- [bouchon-samples](https://github.com/cr0cK/bouchon-samples): some examples for inspiration

## License

MIT.
