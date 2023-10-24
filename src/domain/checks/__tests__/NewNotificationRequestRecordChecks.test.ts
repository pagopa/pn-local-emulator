import * as NewNotificationRequestRecordChecks from '../NewNotificationRequestRecordChecks';
import * as data from '../../__tests__/data';

// TODO: Refactor using fast-check
const ex2 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3Record];
const ex3 = [...ex2, data.newNotificationRecord];
const ex4 = [...ex2, data.mkNewNotificationRecord([data.aDocument0], [data.aRecipient])];
const ex5 = [...ex2, data.mkNewNotificationRecord([data.aDocument0], [{ ...data.aRecipient, payments: undefined }])];
const ex6 = [
  ...ex2,
  data.mkNewNotificationRecord(
    [data.aDocument0],
    [
      {
        ...data.aRecipient,
        payments: data.aRecipient.payments
          ? { ...data.aRecipient.payments }
          : undefined,
      },
    ]
  ),
];

describe('TC-SEND-01', () => {
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
    it('atLeastOneNotificationSentNoPaymentC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneNotificationSentNoPaymentC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(false);
      expect(check(ex5)).toStrictEqual(true);
    });
    it('atLeastOneNotificationSentC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneNotificationSentC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(false);
      expect(check(ex5)).toStrictEqual(false);
      expect(check(ex4)).toStrictEqual(true);
    });
  });
});

describe('TC-PAYMENT-01', () => {
  describe('Create a notification request providing the same sender and creditor', () => {
    it('atLeastOneNotificationSameSenderAndCreatorC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneNotificationSameSenderAndCreatorC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex3)).toStrictEqual(false);
      expect(check(ex5)).toStrictEqual(false);
      expect(check(ex4)).toStrictEqual(false);
      expect(check(ex5)).toStrictEqual(false);
      expect(check(ex6)).toStrictEqual(true);
    });
  });
});
