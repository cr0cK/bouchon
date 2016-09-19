/* eslint func-names: 0 */

import chai from 'chai';
import rewire from 'rewire';

const router = rewire('./router');

const assert = chai.assert;

describe('Router', function () {
  describe('getDelay()', function () {
    const getDelay = router.__get__('getDelay');

    it('should return a valid delay according args', () => {
      [
        [0, value => value === 0],
        ['abc', value => value === 0],
        [50, value => value === 50],
        [[50, 250], value => value >= 50 && value <= 250],
        [[50, 250, 1000, 2000], value => value >= 50 && value <= 250],
        [undefined, value => value === 0],
      ].forEach(([value, test]) => {
        assert(test(getDelay(value)), `Fails with value ${String(value)}`);
      });
    });
  });
});
