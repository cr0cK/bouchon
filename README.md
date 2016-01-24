<div align="center">
  <img src="https://raw.githubusercontent.com/cr0cK/bouchon/assets/assets/images/bouchon-icon.png" />
</div>

# bouchon

Efficient API mocking with cool libraries.

## Summary

- [Big picture](#big-picture)


## Big picture

Bouchon provides a way to make mocks easily with [redux](https://github.com/rackt/redux) and
[reselect](https://github.com/rackt/reselect).

Redux keeps your API stateful in order to create/edit/delete objects in your fake API and
reselect allows to retrieve any data from that state.

You define some data in a JSON file and your actions/reducers/selectors/middlewares/routes in a JS file.
These two files [constitue] a fixture.

Each route (HTTP Verb + url) defines an action, a selector and some optionnal middlewares.


## Quick start

Follow the following instructions to make your first fixture. The full code is available in `./tests/0-readme-tutorial`.

Start an empty projet, install bouchon and create folders and files:

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

### Reducers

Like every redux apps, you have to implement reducers that will maintain the state according to dispathed actions.

Here a basic implementation for the GET, POST, DELETE actions
(reminder, bouchon is using [redux-act](https://github.com/pauldijou/redux-act)
and the syntax is different that one you may know):

```js
// articles.fixture.js

// [...]

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
```

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

### The final touch

It's almost done. It remains to add a `name` used to store the JSON in the state, the `data` and it should be ok.

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

Start bouchon by providing your fixture folder and an optionnal port:

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


### Asynchronous actions

TODO

### Delays

TODO

### Middlewares

TODO

### Combine fixtures

TODO

### Use Babel for your fixtures

If you want to write your fixtures with modern Javascript, you have to workaround a little bit in order to require Babel before your fixtures.
The simplest way is a have only one fixture that requires all the others. Check it there https://github.com/cr0cK/bouchon/blob/master/tests/0-readme-tutorial/all.fixture.js

## Bouchon full API

TODO

## Using Bouchon in integration tests

TODO

## Installation

```
npm install --save bouchon
```

## Other related packages

- [bouchon-toolbox](https://github.com/cr0cK/bouchon-toolbox): a set of useful reducers, selectors and middlewares for common use cases
- [bouchon-samples](https://github.com/cr0cK/bouchon-samples): some examples for inspiration

## License

MIT.
