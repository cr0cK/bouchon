import { get } from 'lodash'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import produce from 'immer'

import { IFullState } from '../../samples/types'
import { fixture as todoFixture, TodosAction } from '../../samples/todos'
import { IAction, IFixture, BouchonAction } from '../../samples/bouchonTypes'

function createFixtureReducer<A extends string, S = any>(
  fixture: IFixture<A, S>
) {
  function initState(state: S, action: IAction) {
    return action.payload
  }

  return function _reducer(state: S, action: IAction): S | null {
    // dispatched at startup to set initial state asynchronously
    if (action.type === BouchonAction.INIT) {
      return initState(state, action)
    }

    const reducer = get(fixture.reducers, action.type)

    if (reducer) {
      return produce(state, draft => {
        return reducer(draft, action)
      })
    }

    // first, set the initialState to null (because the INITialization)
    return null
  }
}

function createAction(type: string, payload?: any) {
  return {
    type,
    payload
  }
}

// function createAsyncAction(type: string, payload: any) {
//   return (dispatch: Dispatch<any>) => {
//     dispatch(createAction(type, payload))
//   }
// }

// @ts-ignore payload is missing in redux.AnyAction...
export const rootReducer = combineReducers<IFullState>({
  todos: createFixtureReducer(todoFixture)
})

const store = createStore<IFullState>(rootReducer, applyMiddleware(thunk))

todoFixture.init().then(initialState => {
  store.dispatch(createAction(BouchonAction.INIT, initialState))

  const newTodo = {
    name: 'encore du boulot',
    done: false
  }

  store.dispatch(createAction(TodosAction.ADD_TODO, newTodo))
  // store.dispatch(createAction(TodosAction.GET_TODO))

  const s = store.getState()
  console.log(JSON.stringify(s, null, 2))
})

// store.dispatch(createAction(TodosAction.GET_TODO))
