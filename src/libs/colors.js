// @flow

export { default as colors } from 'colors';

const allColors = [
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
];

let idx = -1;

/**
 * Loop over allColors and return the next color
 * at each call.
 */
export function getNextColor(): string {
  function next() {
    idx += 1;

    if (idx >= allColors.length) {
      idx = 0;
    }

    return allColors[idx];
  }

  return next();
}
