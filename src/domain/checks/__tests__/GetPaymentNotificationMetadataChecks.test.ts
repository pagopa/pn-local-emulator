import * as GetPaymentNotificationMetadataChecks from '../GetPaymentNotificationMetadataChecks';
import * as data from '../../__tests__/data';
import type { Record as DomainRecord } from '../../Repository';

// Helper: coerciamo gli array verso il tipo union `Record` (solo in ambito test)
const recs = (xs: any[]): ReadonlyArray<DomainRecord> =>
  xs as unknown as ReadonlyArray<DomainRecord>;

describe('GetPaymentNotificationMetadataChecks', () => {
  it('matchesIunAndHasPAGOPAAsAttachmentName', () => {
    const check = GetPaymentNotificationMetadataChecks.matchesIunAndHasPAGOPAAsAttachmentName;

    expect(check(recs([]))).toStrictEqual(false);
    expect(check(recs([data.consumeEventStreamRecord]))).toStrictEqual(false);

    expect(
      check(
        recs([
          data.consumeEventStreamRecordDelivered,
          {
            ...data.getPaymentNotificationMetadataRecord,
            input: {
              ...data.getPaymentNotificationMetadataRecord.input,
              attachmentName: 'F24_STANDARD',
            },
          },
        ])
      )
    ).toStrictEqual(false);

    expect(check(recs([data.getPaymentNotificationMetadataRecord]))).toStrictEqual(true);
  });
});
