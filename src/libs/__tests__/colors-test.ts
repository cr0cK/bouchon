// @flow

import { getNextColor } from '../colors'

describe('colors', () => {
  describe('getNextColor', () => {
    it('should return the next color and restart to 0 when all colors have been returned', () => {
      expect(getNextColor()).toEqual('red')
      expect(getNextColor()).toEqual('green')
      expect(getNextColor()).toEqual('yellow')
      expect(getNextColor()).toEqual('blue')
      expect(getNextColor()).toEqual('magenta')
      expect(getNextColor()).toEqual('cyan')
      expect(getNextColor()).toEqual('red')
      expect(getNextColor()).toEqual('green')
    })
  })
})
