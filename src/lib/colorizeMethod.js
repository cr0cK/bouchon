/* eslint no-multi-spaces: 0 */

import colors from 'colors';


export const colorizeMethod = method => {
  switch (method) {
  case 'GET':     return colors.green(method);
  case 'POST':    return colors.yellow(method);
  case 'PATCH':   return colors.magenta(method);
  case 'PUT':     return colors.cyan(method);
  case 'DELETE':  return colors.red(method);
  default:        return colors.white(method);
  }
};
