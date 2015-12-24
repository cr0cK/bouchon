# bouchon

Efficient API mocking with cool libraries.

## Why?

Have you already been in such situation?

- you have to develop a feature but you don't have the API,
- you have developed your feature but you can not fully test it with unexpected data or delayed responses,
- you want to mak some integration tests but you definitely don't want to setup a complex stack for that...

If yes, this tool should be useful for you.

## How does it works?

Bouchon is using two cool libraries written by Dan Abramov, widely used in the ReactJS world:

- "Redux" to maintain the state of your API,
- "reselect" to select data from your the state.

If you are new to Redux and its vocabulary, I suggest you to read the documentation: https://github.com/rackt/redux.

### Actions and reducers

To handle a request, Bouchon is emitting an action handled by a reducer that updates the state. For example:

- If you are doing a GET, your reducer will just return the full state,
- If you are doing a POST, your reducer will add a new item to an exiting collection.

### Selectors

Selectors allow to select a part of your state. You can implement the filter or the map of your need, compose them, etc.
For more information about reselect, read the documentation at https://github.com/rackt/reselect.

### Fixtures

When starting, Bouchon is looking every `*.fixture.js` file and load it. Each fixture file describe how actions / reducers / selectors will respond to your defined routes.

#### `articles.fixture.js`

```js
import { createAction, createSelector } from 'bouchon';

/**
 * Define your (Redux) actions.
 * For less boilerplate, Bouchon is using redux-act.
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
  articles => articles.filter(article => Number(article.id) === Number(id)),
);

/**
 * Finally, define your fake API!
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

Then just start bouchon like this:

```bash
$ ./node_modules/.bin/bouchon -d ./path/to/my/fixtures
```

## More samples?

Sure. Have a look of more complex use cases in the [bouchon-samples repository](https://github.com/cr0cK/bouchon-samples).

## Using Bouchon for integration tests

You can use Bouchon integration tests by using its API.
For example, to test an app in a browser, you can start Bouchon at the beginning of the test, execute your test with a Selenium based tool and stop Bouchon at the end.

Bonus: Bouchon is recording all actions done during the test so you can check at the end of the test that your process did exactly what you are expected. See `bouchon.logs.get()`.


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
      bouchon.server.start(pathFixtures, port)
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

    bouchon.server.stop().then(() => done());
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

## Tests

In progress.

More tests are also available in [bouchon-toolbox](https://github.com/cr0cK/bouchon-toolbox) and [bouchon-samples](https://github.com/cr0cK/bouchon-samples) repositories.
