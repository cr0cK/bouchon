/**
 * Add some information about the dispatched action and set it in the request
 * object to display it after the morgan logs.
 */
export const outputLogger = () => next => action => {
  const { query, params, body, req } = action.payload;
  const str = `Payload: ${JSON.stringify({query, params, body})}`;

  req.reduxDispatchedAction = str;

  return next(action);
};


/**
 * Log activity.
 */
export const activitiesLogger = () => next => action => {
  const { query, params, body, req, res } = action.payload;

  const log = {
    method: req.method,
    originalUrl: req.originalUrl,
    statusCode: res.statusCode,
    query,
    params,
    body,
  };

  req.activityLog = log;

  return next(action);
};
