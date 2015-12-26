# bouchon

Efficient API mocking with cool libraries.

## Why?

Have you already been in such situation?

- you have to develop a feature but you don't have the API yet,
- you have developed your feature but you can not fully test it with unexpected data or delayed responses,
- you want to make some integration tests but you definitely don't want to setup a complex stack for that...

If yes, this tool should be useful for you.

## How does it works?

bouchon is using two cool libraries written by Dan Abramov, widely used in the ReactJS world:

- "redux" to maintain the state of your API,
- "reselect" to select data from your the state.

If you are new to Redux and its vocabulary, I suggest you to read [the documentation](https://github.com/rackt/redux).

### Actions and reducers

When receiving a request, bouchon is emitting an action handled by a reducer that updates the state. For example:

- If you are doing a GET, your reducer will just return the state,
- If you are doing a POST, your reducer will add a new item to an exiting collection,
- If you are doing a DELETE, your reducer will remove an item of an exiting collection,
- etc.

You can make your own actions and reducers, not necessarily based on the method of the request if you have a very special API to mock.

```js
import { createAction } from 'bouchon';

const actions = {
  get: createAction(),
  post: createAction(),
};

const reducers = {
  [actions.get]: state => state,
  [actions.post]: (state, {body}) => {
    return [
      ...state,
      body,
    ];
  }
};
```

A set of reducers for doing a RESTful API are available in the [bouchon-toolbox](https://github.com/cr0cK/bouchon-toolbox) repository.

### Selectors

Selectors allow to select a part of your state. They are customisable, composable, exportable, etc.

The idea is to split your data into several fixtures and write selectors that can be reusable.

For example, if you want to return one article from an url such `/articles/1`, you can write a selector like this:

```js
import { createSelector } from 'bouchon';

const selectors = {};

// params are the merge of querystring, matched and body parameters
selectors.all = (/* params */) => state => state.articles;

selectors.byId = ({id}) => createSelector(
  selectors.all(),
  articles => articles.filter(article => Number(article.id) === Number(id)).pop(),
);
```

bouchon is providing `createSelector` from the reselect library.
For more information about reselect, read [the documentation](https://github.com/rackt/reselect).

bouchon-toolbox is providing some common selectors like `selectRow` and `extendRows`:

```js
import { selectRow, extendRows } from 'bouchon-toolbox';

export const selectors = {};

// return all articles
selectors.all = () => state => state.articles;

// use the extendRows function of the toolbox to add the author data to each article
// Could be translated by:
// "Join the 'author_id' key of the first selector with the 'id' key of the second selector,
// and set the result in the 'author' key of the first selector".
selectors.allWithAuthor = () => extendRows(
  selectors.all, 'author_id',
  authorsSelectors.all, 'id',
  'author'
);

// use the selectRow function of the toolbox to filter results
selectors.byId = ({id}) => selectRow(selectors.allWithAuthor, 'id', id);
```

Check [the full sample](https://github.com/cr0cK/bouchon-samples/tree/master/samples/2-articles-with-author) and try it!

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

  // if data are set in the response object, bouchon will return that data instead of those selected by your selector
  res.data = slicedData;

  // set pagination headers
  res.set(headers);

  // do not forget to call next to continue the chain
  next();
};
```

Check [middlewares](https://github.com/cr0cK/bouchon-toolbox) from the toolbox.

### Fixtures

When starting, bouchon is looking every `*.fixture.js` file and load it. Each fixture file describe how actions / reducers / selectors will respond to your defined routes.

#### `articles.fixture.js`

```js
import { createAction, createSelector } from 'bouchon';

/**
 * Define your (Redux) actions.
 * For less boilerplate, bouchon is using redux-act.
 */

const actions = {
  get: createAction(),
};

/**
 * Define your selectors in charge to retrieve data from the state.
 * You can compose them, export them to use them in another fixtures, etc.
 * Have a look to reselect library for more information.
 */

export const selectors = {};

selectors.all = (/* params */) => state => state.articles;

selectors.byId = ({id}) => createSelector(
  selectors.all(),
  articles => articles.filter(article => Number(article.id) === Number(id)).pop(),
);

/**
 * Finally, define your fake API!
 * Important: you have to use a 'default export'.
 */

export default {
  // will be used to save data in `state.articles`
  name: 'articles',
  data: require('./data.json'),
  // define your reducer according to the action
  reducer: ({
    [actions.get]: state => state,
  }),
  // define for each route the action to emit and the selector to use
  routes: {
    'GET /': {
      action: actions.get,
      selector: selectors.all,
      // optional middlewares
      middlewares: [setPaginationHeaders],
      status: 200,
    },
    'GET /:id': {
      action: actions.get,
      selector: selectors.byId,
      status: 200,
    },
  },
  endpoint: 'articles',
  // random delay of the response between 0 and 2000 ms
  delay: [0, 2000],
};
```

Of course, you can write your fixture in ES5, even if it's much more verbose. [Have a look of the sample examples written in ES5](https://github.com/cr0cK/bouchon-samples/blob/master/samples/1-articles/articles/index-es5.js).

Then just start bouchon like this:

```bash
$ ./node_modules/.bin/bouchon -d ./path/to/my/fixtures [-p port]
```

If you want more samples, have a look of more complex use cases in the [bouchon-samples repository](https://github.com/cr0cK/bouchon-samples).

## Using bouchon for integration tests

bouchon is providing an API useful for integration tests.
For example, to test an app in a browser, you can start bouchon at the beginning of the test, execute your test with a Selenium based tool and stop bouchon at the end.

Bonus: bouchon is recording all actions done during the test so you can check that your process did exactly what you are expected at the end of your test.


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

### Full API:

- `bouchon.start.start({path, port})    // start the server, return a promise`
- `bouchon.start.stop()                 // stop the server, return a promise`
- `bouchon.logs.get()                   // return the logs saved since the server has been started`
- `bouchon.logs.reset()                 // return the logs`

## Installation

```
npm install --save bouchon
```

## Useful packages

- [bouchon-toolbox](https://github.com/cr0cK/bouchon-toolbox): a set of useful reducers, selectors and middlewares for common use cases
- [bouchon-samples](https://github.com/cr0cK/bouchon-samples): some examples for inspiration
