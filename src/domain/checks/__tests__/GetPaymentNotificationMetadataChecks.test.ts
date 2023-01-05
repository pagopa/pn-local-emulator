import * as GetPaymentNotificationMetadataChecks from '../GetPaymentNotificationMetadataChecks';
import { MetadataRecords } from '../../__tests__/getMetadataRecordData';

describe('GetPaymentNotificationMetadataChecks', () => {
  const PaymentMetadata = MetadataRecords.payment;
  it('matchesIunAndHasPAGOPAAsAttachmentName', () => {
    const check = GetPaymentNotificationMetadataChecks.matchesIunAndHasPAGOPAAsAttachmentName;
    expect(check(PaymentMetadata.empty)).toStrictEqual(false);
    expect(check(PaymentMetadata.onlyConsume)).toStrictEqual(false);
    expect(check(PaymentMetadata.withF24Payment)).toStrictEqual(false);

    expect(check(PaymentMetadata.withPagoPAPayment)).toStrictEqual(true);
  });
});
