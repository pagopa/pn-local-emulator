import * as i from '../.';
import * as E from 'fp-ts/Either';
import { makeLogger } from '../../../logger';
import * as data from '../../../domain/__tests__/data';

describe('Repository', () => {
  it('should insert the given element', async () => {
    const element = data.preLoadRecord;
    const service = i.makeRecordRepository(makeLogger())([]);

    await service.insert(data.preLoadRecord)();

    const expected = E.right([element]);
    const actual = await service.list()();

    expect(actual).toStrictEqual(expected);
  });
});
