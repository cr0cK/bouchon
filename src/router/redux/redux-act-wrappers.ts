import {
  createAction as reduxActCreateAction,
  createReducer,
  PayloadReducer,
  MetaReducer
} from 'redux-act'

import { IActionPayload, IActionMeta } from '../../types'

const payloadReducer: PayloadReducer<IActionPayload> = payload => payload
const metaReducer: MetaReducer<IActionMeta> = (_, meta) => meta

/**
 * Wrap the createAction function to provide meta data to the action.
 * It allows to abstract this behavior in fixtures.
 */
export function createAction(description: string) {
  return reduxActCreateAction(description, payloadReducer, metaReducer)
}

export { createReducer }
