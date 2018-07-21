export const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']

let idx = -1

/**
 * Loop over allColors and return the next color
 * at each call.
 */
export function getNextColor(): string {
  function next() {
    idx += 1

    if (idx >= colors.length) {
      idx = 0
    }

    return colors[idx]
  }

  return next()
}
