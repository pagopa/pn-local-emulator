import * as UploadToS3RecordChecks from '../UploadToS3RecordChecks';
import * as useCaseData from './data';
import * as data from '../../__tests__/data';

describe('UploadToS3RecordChecks', () => {
  it('atLeastTwoUploadMatchingPreLoadRecordC', () => {
    const check = UploadToS3RecordChecks.atLeastNUploadMatchingPreLoadRecordC(2);
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.preLoadRecords)).toStrictEqual(false);
    expect(check(useCaseData.twoPreLoadRecordsOneUploadRecord)).toStrictEqual(false);
    expect(check(useCaseData.evenPreLoadAndUploadRecordsThatAreNotLinked)).toStrictEqual(false);
    expect(check(useCaseData.evenPreLoadAndUploadRecordsThatAreLinked)).toStrictEqual(true);
  });
  it('matchAtLeastOneUploadToS3Record', () => {
    const check = UploadToS3RecordChecks.matchAtLeastOneUploadToS3Record;
    expect(check([])(data.aDocument0)).toStrictEqual(false);
    expect(check([data.uploadToS3RecordDangling])(data.aDocument0)).toStrictEqual(false);
    expect(check([data.uploadToS3Record])(data.aDocument0)).toStrictEqual(true);
  });
});
