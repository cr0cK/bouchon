// // @flow

// import { expect } from 'chai';
// import rewire from 'rewire';

// const combineModule = rewire('../combine');

// /* eslint-disable no-underscore-dangle */
// const combineFixturesReducers = combineModule.__get__('combineFixturesReducers');
// const combineFixturesRoutes = combineModule.__get__('combineFixturesRoutes');

// combineModule.__set__('combineReducers', reducers => reducers);
// combineModule.__set__('createReducer', (actions, initialState) => ({ actions, initialState }));
// combineModule.__set__('dummyAction', 'DUMMY_ACTION');
// combineModule.__set__('returnState', 'RETURN_CURRENT_STATE');
// /* eslint-enable no-underscore-dangle */

// describe('combineFixturesReducers', () => {
//   it('returns a combined object of reducers', () => {
//     const actions = {
//       get: () => {},
//       get2: () => {},
//     };

//     const reducer = {
//       books: {
//         name: 'books',
//         data: { foo: 'bar' },
//         reducer: {
//           [(actions.get: any)]: 'function',
//         },
//       },
//       authors: {
//         name: 'authors',
//         data: { foo: 'baz' },
//         reducer: {
//           [(actions.get2: any)]: 'function',
//         },
//       },
//     };

//     expect(combineFixturesReducers(reducer)).to.deep.equal({
//       books: {
//         actions: {
//           [(actions.get: any)]: 'function',
//           DUMMY_ACTION: 'RETURN_CURRENT_STATE',
//         },
//         initialState: { foo: 'bar' },
//       },
//       authors: {
//         actions: {
//           [(actions.get2: any)]: 'function',
//           DUMMY_ACTION: 'RETURN_CURRENT_STATE',
//         },
//         initialState: { foo: 'baz' },
//       },
//     });
//   });
// });

// describe('combineFixturesRoutes', () => {
//   it('returns a combined object of routes', () => {
//     const routes = {
//       books: {
//         endpoint: 'books',
//         routes: {
//           'GET /': {
//             action: 'myaction',
//             selector: 'myselector',
//             status: 200,
//           },
//         },
//       },
//       authors: {
//         endpoint: 'authors',
//         routes: {
//           'GET /': {
//             action: 'myaction2',
//             selector: 'myselector2',
//             status: 200,
//           },
//           'GET /:id': {
//             action: 'myaction3',
//             selector: 'myselector3',
//             status: 200,
//           },
//         },
//       },
//     };

//     expect(combineFixturesRoutes(routes)).to.deep.equal({
//       'GET /books/': {
//         action: 'myaction',
//         selector: 'myselector',
//         status: 200,
//       },
//       'GET /authors/': {
//         action: 'myaction2',
//         selector: 'myselector2',
//         status: 200,
//       },
//       'GET /authors/:id': {
//         action: 'myaction3',
//         selector: 'myselector3',
//         status: 200,
//       },
//     });
//   });
// });
