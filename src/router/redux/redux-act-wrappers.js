// @flow

import {
  createAction as reduxActCreateAction,
  createReducer,
} from 'redux-act';


const assignPayload = payload => payload;
const assignMeta = (payload, meta) => meta;

/**
 * Wrap the createAction function to provide meta data to the action.
 * It allows to abstract this behavior in fixtures.
 */
export function createAction(actionDesc: string): Function {
  return reduxActCreateAction(
    actionDesc,
    assignPayload,
    assignMeta,
  );
}

export { createReducer };
