import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import * as UploadToS3RecordChecks from '../UploadToS3RecordChecks';
import * as data from '../../__tests__/data';

const ex0 = [data.preLoadRecord, data.preLoadRecord];
const ex1 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];
const ex2 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3Record];

describe('TC-SEND-01', () => {
  describe('Request at least two upload slots', () => {
    it('atLeastOnePreLoadRecordC', () => {
      const check = PreLoadRecordChecks.atLeastOnePreLoadRecordC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex0)).toStrictEqual(true);
    });
    it('atLeastOnePreLoadRecordWithPdfC', () => {
      const check = PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex0)).toStrictEqual(true);
    });
    it('atLeastTwoValidSlotC', () => {
      const check = PreLoadRecordChecks.atLeastTwoValidSlotC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex0)).toStrictEqual(true);
    });
  });
  describe('Upload at at least two files', () => {
    it('atLeastTwoUploadMatchingPreLoadRecordC', () => {
      const check = UploadToS3RecordChecks.atLeastTwoUploadMatchingPreLoadRecordC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex0)).toStrictEqual(false);
      expect(check(ex1)).toStrictEqual(false);
      expect(check(ex2)).toStrictEqual(true);
    });
  });
});
