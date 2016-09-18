/* eslint max-len: 0 */
/* eslint func-names: 0 */

import chai from 'chai';
import rewire from 'rewire';

const combineFixturesReducersModule = rewire('./combineFixturesReducers');

const expect = chai.expect;

describe('combineFixturesReducers', function () {
  const combineFixturesReducers = combineFixturesReducersModule.__get__('combineFixturesReducers');
  combineFixturesReducersModule.__set__('combineReducers', reducers => reducers);
  combineFixturesReducersModule.__set__('createReducer', (actions, initialState) => ({ actions, initialState }));
  combineFixturesReducersModule.__set__('dummyAction', 'DUMMY_ACTION');
  combineFixturesReducersModule.__set__('returnState', 'RETURN_CURRENT_STATE');

  it('returns a combined object of reducers', () => {
    const actions = {
      get: () => {},
      get2: () => {},
    };

    const reducer = {
      books: {
        name: 'books',
        data: { foo: 'bar' },
        reducer: {
          [actions.get]: 'function',
        },
      },
      authors: {
        name: 'authors',
        data: { foo: 'baz' },
        reducer: {
          [actions.get2]: 'function',
        },
      },
    };

    expect(combineFixturesReducers(reducer)).to.deep.equal({
      books: {
        actions: {
          [actions.get]: 'function',
          DUMMY_ACTION: 'RETURN_CURRENT_STATE',
        },
        initialState: { foo: 'bar' },
      },
      authors: {
        actions: {
          [actions.get2]: 'function',
          DUMMY_ACTION: 'RETURN_CURRENT_STATE',
        },
        initialState: { foo: 'baz' },
      },
    });
  });
});
