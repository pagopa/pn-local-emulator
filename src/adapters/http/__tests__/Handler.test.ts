import { removeNullValues } from '../Handler';

describe('removeNullValues', () => {
  const inputObject = {
    a: 1,
    b: null,
    c: {
      d: [1, 2],
      e: null,
    },
    f: [{ g: null, h: 1 }],
  };
  const expected = {
    a: 1,
    c: {
      d: [1, 2],
    },
    f: [{ h: 1 }],
  };

  it('should filter out null properties recursively', async () => {
    const actual = removeNullValues(inputObject);
    expect(actual).toStrictEqual(expected);
  });

  it('should filter out null properties recursively - input is an array', async () => {
    const actual = removeNullValues([inputObject]);
    expect(actual).toStrictEqual(expected);
  });
});
