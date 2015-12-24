/**
 * Logger basic API to save and retrieve logs.
 */

const logs = [];

/**
 * Return logs.
 */
export const get = () => logs;

/**
 * Push a log into the list and return logs.
 */
export const push = log => {
  logs.push(log);
  return logs;
};

/**
 * Reset logs.
 */
export const reset = () => {
  logs.length = 0;
  return logs;
};
