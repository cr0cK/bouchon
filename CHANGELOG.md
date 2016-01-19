# Change log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## master

## 0.2.1 - 2016/01/19

* Fix: Params were not set in `backendAction`s.

## 0.2.0 - 2016/01/11

* Reducers and routes are now combinable (new `combineFixturesReducers`, `combineFixturesRoutes`, `combineFixtures` functions).
* Use `filterRows` and `extendRows` new implementation from bouchon-toolbox.
* Expose `combineReducers` via bouchon (in case of you need it)

## 0.1.0 - 2015/12/30

* Add a `responseBody` key. Useful to return arbitrary data instead of data of the state.
* Add a `backendAction` key. Useful to dispatch an action in the future in order to simulate asynchronous processes.

```js
  'POST /': {
    responseBody: { status: 'OK' },
    backendAction: {action: actions.postBackend, delay: 2000},
    status: 201,
  },
```

* `delay` key is deprecated, use the object notation for `action` to set a delay.
* `action` and `backendAction` can now be a function or an object that defines a function and a delay.

```js
  'GET /:id': {
    action: {action: actions.get, delay: [400, 500]},
    selector: selectors.byId,
    status: 200,
  },
```

* `action` key is optionnal. If not set, bouchon will emit a 'DUMMY_ACTION' (needed to enable logs).
* `selector` key is optionnal.

## 0.0.2 - 2015/12/26

* Improve logger output.
* Update README.

## 0.0.1 - 2015/12/16

* Initial commit.
