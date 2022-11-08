import * as UploadToS3RecordChecks from '../UploadToS3RecordChecks';
import * as data from '../../__tests__/data';

// TODO: Refactor using fast-check
const ex0 = [data.preLoadRecord, data.preLoadRecord];
const ex1 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];
const ex2 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3Record];
const ex21 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3RecordDangling];

describe('UploadToS3RecordChecks', () => {
  it('atLeastTwoUploadMatchingPreLoadRecordC', () => {
    const check = UploadToS3RecordChecks.atLeastNUploadMatchingPreLoadRecordC(2);
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(false);
    expect(check(ex1)).toStrictEqual(false);
    expect(check(ex21)).toStrictEqual(false);
    expect(check(ex2)).toStrictEqual(true);
  });
  it('matchAtLeastOneUploadToS3Record', () => {
    const check = UploadToS3RecordChecks.matchAtLeastOneUploadToS3Record;
    expect(check([])(data.aDocument0)).toStrictEqual(false);
    expect(check([data.uploadToS3RecordDangling])(data.aDocument0)).toStrictEqual(false);
    expect(check([data.uploadToS3Record])(data.aDocument0)).toStrictEqual(true);
  });
});
