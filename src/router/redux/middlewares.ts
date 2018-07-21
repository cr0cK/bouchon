import * as colors from 'colors'
import { Dispatch } from 'redux'

import { getNextColor } from '../../libs/colors'
import { log, colorizeMethod } from '../../libs/logger'

import { IBouchonAction, IFullState } from '../../types'

/**
 * Log some informations about the current dispatched action.
 */
export const outputLogger = () => (next: Dispatch<IFullState>) => (
  action: IBouchonAction
) => {
  // if meta is not available, skip
  if (!action.meta) {
    return next(action)
  }

  const { req, isBouchonAction, backendAction } = action.meta

  // if not dispatched by Bouchon, skip
  if (!isBouchonAction) {
    return next(action)
  }

  // pick a color random
  const color = getNextColor()

  const actionType =
    action.type.replace(/\[\d+\]/, '').trim() || 'No description provided'

  const logs = [
    `${colorizeMethod(req.method)} ${req.originalUrl}`,
    `${colors.cyan('Action:')} ${colors.white(actionType)}`,
    `${colors.cyan('Payload:')} ${colors.white(JSON.stringify(action.payload))}`
  ]

  if (backendAction) {
    const delay = Math.round((backendAction.delay / 1000) * 100) / 100
    logs.push(colors.cyan(`Backend actions dispatched in ${delay} seconds...`))
  }

  logs.forEach(str => {
    // @ts-ignore
    log.info(`${colors[color]('|')} ${str}`)
  })

  // save the color to log the morgan response with the same color
  req.app.locals.logColor = color

  return next(action)
}

// /**
//  * Add some information in the request object about the dispatched action.
//  * Used when usin bouchon via the API.
//  * Activities logs are available via `bouchon.logs.get` function.
//  */
// export const activitiesLogger = () => (next: Function) => (action: Function) => {
//   const bouchonAction = action.payload && action.payload.bouchonAction;

//   // not an action dispatched by Bouchon, skip this middleware
//   if (!bouchonAction) {
//     return next(action);
//   }

//   const {
//     query, params, body, req, res,
//   } = action.payload;

//   const log = {
//     method: req.method,
//     originalUrl: req.originalUrl,
//     statusCode: res.statusCode,
//     query,
//     params,
//     body,
//   };

//   req.activityLog = log;

//   return next(action);
// };

/**
 * Write the state in a file, merged in the initialState when Bouchon is starting
 * with the --hot option.
 */
// export const hotReload = (store: Object) => (next: Function) => (action: Function) => {
//   saveState(store.getState());
//   return next(action);
// };
