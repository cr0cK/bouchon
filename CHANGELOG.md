# Change log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## master

* **[API-BREAK]** Delay is no longer settable via the `delay` key.
* `action` and `backendAction` can now be a function or an object that defines a function and a delay.

```js
  'GET /:id': {
    action: {action: actions.get, delay: [400, 500]},
    selector: selectors.byId,
    status: 200,
  },
```

* Implements backend actions to dispatch delayed actions in order to simulate a backend.

```js
  'POST /': {
    action: actions.post,
    backendAction: {action: actions.postBackend, delay: 1000},
    middlewares: [sendOperation],
    selector: selectors.all,
    status: 201,
  },
```

## 0.0.2 - 2015/12/26

* Improve logger output
* Update README.

## 0.0.1 - 2015/12/16

* Initial commit.
