// @flow

import { expect } from 'chai';

import { getNextColor } from '../colors';

describe.only('colors', () => {
  describe('getNextColor', () => {
    it('should return the next color and restart to 0 when all colors have been returned', () => {
      expect(getNextColor()).to.equal('red');
      expect(getNextColor()).to.equal('green');
      expect(getNextColor()).to.equal('yellow');
      expect(getNextColor()).to.equal('blue');
      expect(getNextColor()).to.equal('magenta');
      expect(getNextColor()).to.equal('cyan');
      expect(getNextColor()).to.equal('red');
      expect(getNextColor()).to.equal('green');
    });
  });
});
