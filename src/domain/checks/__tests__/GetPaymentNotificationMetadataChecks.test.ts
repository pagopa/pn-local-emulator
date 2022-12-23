import * as GetPaymentNotificationMetadataChecks from '../GetPaymentNotificationMetadataChecks';
import * as data from '../../__tests__/data';
import { matchesIunAndHasPAGOPAAsAttachmentName } from '../GetPaymentNotificationMetadataChecks';

describe('GetPaymentNotificationMetadataChecks', () => {
  it('matchesIunAndHasPAGOPAAsAttachmentName', () => {
    const check = GetPaymentNotificationMetadataChecks.matchesIunAndHasPAGOPAAsAttachmentName;
    expect(check([])).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecord])).toStrictEqual(false);
    expect(
      check([
        data.consumeEventStreamRecordDelivered,
        {
          ...data.getPaymentNotificationMetadataRecord,
          input: { ...data.getPaymentNotificationMetadataRecord.input, attachmentName: 'F24_STANDARD' },
        },
      ])
    ).toStrictEqual(false);

    expect(check([data.getPaymentNotificationMetadataRecord])).toStrictEqual(true);
  });
});
