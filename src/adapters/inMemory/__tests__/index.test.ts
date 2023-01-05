import * as i from '../.';
import * as E from 'fp-ts/Either';
import { makeLogger } from '../../../logger';
import { PreLoadRecords } from '../../../domain/__tests__/preLoadRecordData';

describe('Repository', () => {
  it('should insert the given element', async () => {
    const element = PreLoadRecords.one[0];
    const service = i.makeRecordRepository(makeLogger())([]);

    await service.insert(PreLoadRecords.one[0])();

    const expected = E.right([element]);
    const actual = await service.list()();

    expect(actual).toStrictEqual(expected);
  });
});
