import { withoutNullValues } from '../Handler';

describe('Handler', () => {
  it('should filter out null properties recursively', async () => {
    const obj = {
      a: 1,
      b: null,
      c: {
        d: [1, 2],
        e: null,
      },
    };
    const actual = withoutNullValues(obj);
    const expected = {
      a: 1,
      c: {
        d: [1, 2],
      },
    };

    expect(actual).toStrictEqual(expected);
  });
});
