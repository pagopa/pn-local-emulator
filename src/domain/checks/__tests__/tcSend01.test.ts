import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import * as UploadToS3RecordChecks from '../UploadToS3RecordChecks';
import * as NewNotificationRequestRecordChecks from '../NewNotificationRequestRecordChecks';
import * as data from '../../__tests__/data';

// TODO: Refactor using fast-check
const ex0 = [data.preLoadRecord, data.preLoadRecord];
const ex1 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];
const ex2 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3Record];
const ex21 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3RecordDangling];
const ex3 = [...ex2, data.newNotificationRecord];
const ex4 = [...ex2, data.mkNewNotificationRecord([data.aDocument0])];

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
      expect(check(ex21)).toStrictEqual(false);
      expect(check(ex2)).toStrictEqual(true);
    });
  });
  describe('Create a notification request', () => {
    it('atLeastOneRecordC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneRecordC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneRegisteredLetter890C', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneRegisteredLetter890C;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneValidTaxIdC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidTaxIdC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneValidDigitalDomicileC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidDigitalDomicileC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneValidPhysicalAddressC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidPhysicalAddressC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneValidCreditorTaxIdC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidCreditorTaxIdC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneValidNoticeCodeC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidNoticeCodeC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneValidPagoPaFormC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidPagoPaFormC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(true);
    });
    it('atLeastOneRequestWithValidDocumentsC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneRequestWithValidDocumentsC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(false);
      expect(check(ex4)).toStrictEqual(true);
    });
    it('atLeastOneNotificationSentC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneNotificationSentC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(false);
      expect(check(ex4)).toStrictEqual(true);
    });
  });
});
