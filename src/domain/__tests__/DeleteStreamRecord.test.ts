import { DeleteStreamRecord, isDeleteStreamRecord, makeDeleteStreamRecord } from '../DeleteStreamRecord';
import * as O from 'fp-ts/Option';
import * as data from './data';
import { pipe } from 'fp-ts/lib/function';

describe('makeDeleteStreamRecord', () => {
  it('check if  DeleteStreamRecord is correctly built', () => {
    const expected = {
      type: 'DeleteStreamRecord',
      input: { apiKey: data.apiKey.valid, streamId: data.streamId.valid },
      output: { statusCode: 204, returned: undefined },
      loggedAt: data.aDate,
    } as DeleteStreamRecord;

    const actual = makeDeleteStreamRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      streamId: data.streamId.valid,
    });

    expect(actual).toEqual(expected);
  });
});

describe('isDeleteStreamRecord', () => {
  it('check if correctly recognises a real DeleteStreamRecord based on type', () => {
    const expected = {
      type: 'DeleteStreamRecord',
      input: { apiKey: data.apiKey.valid, streamId: data.streamId.valid },
      output: { statusCode: 204, returned: undefined },
      loggedAt: data.aDate,
    } as DeleteStreamRecord;

    const actual: O.Option<DeleteStreamRecord> = isDeleteStreamRecord(expected);

    const valueActual = pipe(
      actual,
      O.fold(
        () => undefined,
        (record) => record
      )
    );

    expect(valueActual).toEqual(expected);
  });

  it('check if correctly recognises a fake DeleteStreamRecord based on type', () => {
    const expected = data.getLegalFactDownloadMetadataRecord;

    const actual: O.Option<DeleteStreamRecord> = isDeleteStreamRecord(expected);

    const valueActual = pipe(
      actual,
      O.fold(
        () => undefined,
        (record) => record
      )
    );

    expect(valueActual).toEqual(undefined);
  });
});
