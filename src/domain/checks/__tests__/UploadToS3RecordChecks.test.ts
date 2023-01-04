import * as UploadToS3RecordChecks from '../UploadToS3RecordChecks';
import * as data from '../../__tests__/data';

describe('UploadToS3RecordChecks', () => {
  it('atLeastTwoUploadMatchingPreLoadRecordC', () => {
    const check = UploadToS3RecordChecks.atLeastNUploadMatchingPreLoadRecordC(2);
    expect(check([])).toStrictEqual(false);
    expect(check([data.preLoadRecord, data.preLoadRecord])).toStrictEqual(false);
    expect(check([data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record])).toStrictEqual(false);
    expect(
      check([data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3RecordDangling])
    ).toStrictEqual(false);
    expect(check([data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3Record])).toStrictEqual(
      true
    );
  });
  it('matchAtLeastOneUploadToS3Record', () => {
    const check = UploadToS3RecordChecks.matchAtLeastOneUploadToS3Record;
    expect(check([])(data.aDocument0)).toStrictEqual(false);
    expect(check([data.uploadToS3RecordDangling])(data.aDocument0)).toStrictEqual(false);
    expect(check([data.uploadToS3Record])(data.aDocument0)).toStrictEqual(true);
  });
});
