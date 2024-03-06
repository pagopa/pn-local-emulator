import { UploadToS3Record, isUploadToS3Record, makeUploadToS3Record } from '../UploadToS3Record';
import * as data from './data';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';

describe('makeUploadToS3Record', () => {
  it('makeUploadToS3Record correctly built', () => {
    const input = {
      url: data.aUrl,
      key: 'test',
      checksumAlg: undefined,
      secret: 'test',
      checksum: 'test',
      computedSha256: 'test',
    } as UploadToS3Record['input'];
    const actual = makeUploadToS3Record(data.makeTestSystemEnv())(input);

    expect(actual.output.statusCode).toStrictEqual(200);
  });
});

describe('isUploadToS3Record', () => {
  it('isUploadToS3Record with a real UploadToS3Record', () => {
    const expected = data.getUploadToS3Record;

    const actual = isUploadToS3Record(expected);

    const valueActual = pipe(
      actual,
      O.fold(
        () => undefined,
        (record) => record
      )
    );

    expect(valueActual).toEqual(expected);
  });

  it('isUploadToS3Record with a different type', () => {
    const expected = data.getLegalFactDownloadMetadataRecord;

    const actual = isUploadToS3Record(expected);

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
