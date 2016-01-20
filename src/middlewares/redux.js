import colors from 'colors';

/**
 * Add some information about the dispatched action and set it in the request.
 */
export const outputLogger = () => next => action => {
  const { query, params, body, req, backendAction } = action.payload;
  const msgs = [];

  msgs.push({
    type: 'main',
    msg: `Action: ${colors.white(action.type)}`,
  });
  msgs.push({
    type: 'main',
    msg: `Payload: ${colors.white(JSON.stringify({query, params, body}))}`,
  });

  if (backendAction) {
    const seconds = Math.round(backendAction.delay) / 1000;
    if (seconds > 0) {
      msgs.push({
        type: 'delay',
        msg: `Backend action dispatched in ${colors.white(seconds)} seconds...`,
      });
    }
  }

  if (!('reduxLogs' in req)) {
    req.reduxLogs = [];
  }

  req.reduxLogs = [
    ...req.reduxLogs,
    msgs,
  ];

  return next(action);
};

/**
 * Add some information in the request object about the dispatched action.
 * Used when usin bouchon via the API.
 * Activities logs are available via `bouchon.logs.get` function.
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
