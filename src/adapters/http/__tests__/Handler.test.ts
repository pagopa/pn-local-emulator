import { removeNullValues } from '../Handler';

describe('withoutNullValues', () => {
  it('should filter out null properties recursively', async () => {
    const obj = {
      a: 1,
      b: null,
      c: {
        d: [1, 2],
        e: null,
      },
    };
    const actual = removeNullValues(obj);
    const expected = {
      a: 1,
      c: {
        d: [1, 2],
      },
    };

    expect(actual).toStrictEqual(expected);
  });
});
