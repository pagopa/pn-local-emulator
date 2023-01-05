import * as NewNotificationRequestRecordChecks from '../NewNotificationRequestRecordChecks';
import { NewNotificationRecords } from '../../__tests__/newNotificationRequestRecordData';

describe('TC-SEND-01', () => {
  describe('Create a notification request', () => {
    it('atLeastOneRecordC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneRecordC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneRegisteredLetter890C', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneRegisteredLetter890C;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneValidTaxIdC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidTaxIdC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneValidDigitalDomicileC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidDigitalDomicileC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneValidPhysicalAddressC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidPhysicalAddressC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneValidCreditorTaxIdC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidCreditorTaxIdC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneValidNoticeCodeC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidNoticeCodeC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneValidPagoPaFormC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneValidPagoPaFormC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(true);
    });
    it('atLeastOneRequestWithValidDocumentsC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneRequestWithValidDocumentsC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withIdx)).toStrictEqual(true);
    });
    it('atLeastOneNotificationSentNoPaymentC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneNotificationSentNoPaymentC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withIdxWithoutPayment)).toStrictEqual(true);
    });
    it('atLeastOneNotificationSentC', () => {
      const check = NewNotificationRequestRecordChecks.atLeastOneNotificationSentC;
      expect(check(NewNotificationRecords.empty)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withoutIdx)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withIdxWithoutPayment)).toStrictEqual(false);
      expect(check(NewNotificationRecords.withIdx)).toStrictEqual(true);
    });
  });
});
