import * as UploadToS3RecordChecks from '../UploadToS3RecordChecks';
import * as data from '../../__tests__/data';
import { UploadToS3Records } from '../../__tests__/uploadToS3RecordData';

describe('UploadToS3RecordChecks', () => {
  it('atLeastTwoUploadMatchingPreLoadRecordC', () => {
    const check = UploadToS3RecordChecks.atLeastNUploadMatchingPreLoadRecordC(2);
    expect(check(UploadToS3Records.empty)).toStrictEqual(false);
    expect(check(UploadToS3Records.onlyUploadToS3Record)).toStrictEqual(false);
    expect(check(UploadToS3Records.evenPreLoadOddUploadToS3Record)).toStrictEqual(false);
    expect(check(UploadToS3Records.evenPreloadAndUploadButOneIsDangling)).toStrictEqual(false);
    expect(check(UploadToS3Records.evenPreloadAndUpload)).toStrictEqual(true);
  });
  it('matchAtLeastOneUploadToS3Record', () => {
    const check = UploadToS3RecordChecks.matchAtLeastOneUploadToS3Record;
    expect(check(UploadToS3Records.empty)(data.aDocument0)).toStrictEqual(false);
    expect(check(UploadToS3Records.onlyDangling)(data.aDocument0)).toStrictEqual(false);
    expect(check(UploadToS3Records.onlyUploadToS3Record)(data.aDocument0)).toStrictEqual(true);
  });
});
