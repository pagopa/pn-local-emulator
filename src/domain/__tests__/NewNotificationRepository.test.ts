import * as data from './data';
import {
  hasPhysicalAddress,
  hasRecipientDigitalDomicile,
  hasRecipientPaymentCreditorTaxId,
  hasRecipientPaymentNoticeCode,
  hasRecipientTaxId,
  hasRegisteredLetterAsPhysicalDocumentType,
  hasSuccessfulResponse,
} from '../NewNotificationRepository';
import { unauthorizedResponse } from '../types';
import { PhysicalCommunicationTypeEnum } from '../../generated/definitions/NewNotificationRequest';

const validOverridingBody = (body: Partial<typeof data.newNotificationRecord['input']['body']>) => ({
  ...data.newNotificationRecord,
  input: { ...data.newNotificationRecord.input, body: { ...data.newNotificationRecord.input.body, ...body } },
});

describe('NewNotificationRepository', () => {
  const validRecord = data.newNotificationRecord;

  it('should return true if the response status code is 202', () => {
    expect(hasSuccessfulResponse(validRecord)).toStrictEqual(true);
    expect(hasSuccessfulResponse({ ...validRecord, output: unauthorizedResponse })).toStrictEqual(false);
  });

  it('should return true if the record has the recipient tax id', () => {
    expect(hasRecipientTaxId(validRecord)).toStrictEqual(true);
  });

  it('should return true if the record has the digital domicile', () => {
    expect(hasRecipientDigitalDomicile(validRecord)).toStrictEqual(true);

    expect(
      hasRecipientDigitalDomicile(
        validOverridingBody({
          recipients: [{ ...validRecord.input.body.recipients[0], digitalDomicile: undefined }],
        })
      )
    ).toStrictEqual(false);
  });

  it('should return true if the record has the physical address', () => {
    expect(hasPhysicalAddress(validRecord)).toStrictEqual(true);

    expect(
      hasPhysicalAddress(
        validOverridingBody({
          recipients: [{ ...validRecord.input.body.recipients[0], physicalAddress: undefined }],
        })
      )
    ).toStrictEqual(false);
  });

  it('should return true if the record has the registered letter as physical document type', () => {
    expect(hasRegisteredLetterAsPhysicalDocumentType(validRecord)).toStrictEqual(true);

    expect(
      hasRegisteredLetterAsPhysicalDocumentType(
        validOverridingBody({
          physicalCommunicationType: PhysicalCommunicationTypeEnum.SIMPLE_REGISTERED_LETTER,
        })
      )
    ).toStrictEqual(false);
  });

  it('should return true if the record has the recipient payment information', () => {
    expect(hasRecipientPaymentCreditorTaxId(validRecord)).toStrictEqual(true);
    expect(hasRecipientPaymentNoticeCode(validRecord)).toStrictEqual(true);

    const invalid = validOverridingBody({
      recipients: [{ ...validRecord.input.body.recipients[0], payment: undefined }],
    });

    expect(hasRecipientPaymentCreditorTaxId(invalid)).toStrictEqual(false);
    expect(hasRecipientPaymentNoticeCode(invalid)).toStrictEqual(false);
  });
});
