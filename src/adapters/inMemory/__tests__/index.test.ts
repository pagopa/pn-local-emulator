import * as i from '../.';
import * as E from 'fp-ts/Either';
import { makeLogger } from '../../../logger';

describe('Repository', () => {
  it('should insert the given element', async () => {
    const element = 0;
    const service = i.makeRepository(makeLogger())([]);

    await service.insert(element)();

    const expected = E.right([element]);
    const actual = await service.list()();

    expect(actual).toStrictEqual(expected);
  });
});
