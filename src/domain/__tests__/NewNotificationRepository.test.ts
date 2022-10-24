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
      hasRecipientDigitalDomicile({
        ...validRecord,
        input: {
          ...validRecord.input,
          body: {
            ...validRecord.input.body,
            recipients: [{ ...validRecord.input.body.recipients[0], digitalDomicile: undefined }],
          },
        },
      })
    ).toStrictEqual(false);
  });

  it('should return true if the record has the physical address', () => {
    expect(hasPhysicalAddress(validRecord)).toStrictEqual(true);

    expect(
      hasPhysicalAddress({
        ...validRecord,
        input: {
          ...validRecord.input,
          body: {
            ...validRecord.input.body,
            recipients: [{ ...validRecord.input.body.recipients[0], physicalAddress: undefined }],
          },
        },
      })
    ).toStrictEqual(false);
  });

  it('should return true if the record has the registered letter as physical document type', () => {
    expect(hasRegisteredLetterAsPhysicalDocumentType(validRecord)).toStrictEqual(true);

    expect(
      hasRegisteredLetterAsPhysicalDocumentType({
        ...validRecord,
        input: {
          ...validRecord.input,
          body: {
            ...validRecord.input.body,
            physicalCommunicationType: PhysicalCommunicationTypeEnum.SIMPLE_REGISTERED_LETTER,
          },
        },
      })
    ).toStrictEqual(false);
  });

  it('should return true if the record has the recipient payment information', () => {
    expect(hasRecipientPaymentCreditorTaxId(validRecord)).toStrictEqual(true);
    expect(hasRecipientPaymentNoticeCode(validRecord)).toStrictEqual(true);

    expect(
      hasRecipientPaymentCreditorTaxId({
        ...validRecord,
        input: {
          ...validRecord.input,
          body: {
            ...validRecord.input.body,
            recipients: [{ ...validRecord.input.body.recipients[0], payment: undefined }],
          },
        },
      })
    ).toStrictEqual(false);
    expect(
      hasRecipientPaymentNoticeCode({
        ...validRecord,
        input: {
          ...validRecord.input,
          body: {
            ...validRecord.input.body,
            recipients: [{ ...validRecord.input.body.recipients[0], payment: undefined }],
          },
        },
      })
    ).toStrictEqual(false);
  });
});
