import * as GetNotificationDocumentMetadataChecks from '../GetNotificationDocumentMetadataChecks';
import * as data from '../../__tests__/data';
import type { Record as DomainRecord } from '../../Repository';

// Helper: coerciamo i fixture verso il tipo union `Record` solo a livello di test,
// senza cambiare nessuna logica runtime.
const recs = (xs: any[]): ReadonlyArray<DomainRecord> =>
  xs as unknown as ReadonlyArray<DomainRecord>;

describe('GetNotificationDocumentMetadataChecks', () => {
  it('getNotificationDocumentMetadataC', () => {
    const check = GetNotificationDocumentMetadataChecks.getNotificationDocumentMetadataC;
    expect(check([] as unknown as ReadonlyArray<DomainRecord>)).toStrictEqual(false);
    expect(check(recs([data.consumeEventStreamRecord]))).toStrictEqual(false);
    expect(
      check(recs([data.consumeEventStreamRecordDelivered, data.getNotificationDocumentMetadataRecord0]))
    ).toStrictEqual(true);
  });

  it('downloadedNotificationDocumentC', () => {
    const check = GetNotificationDocumentMetadataChecks.downloadedNotificationDocumentC;
    expect(check([] as unknown as ReadonlyArray<DomainRecord>)).toStrictEqual(false);
    expect(check(recs([data.consumeEventStreamRecordDelivered]))).toStrictEqual(false);
    expect(
      check(recs([data.consumeEventStreamRecordDelivered, data.getNotificationDocumentMetadataRecord0]))
    ).toStrictEqual(false);
    expect(
      check(recs([data.consumeEventStreamRecordDelivered, data.getPaymentNotificationMetadataRecord, data.downloadRecord]))
    ).toStrictEqual(false);
    expect(
      check(recs([data.consumeEventStreamRecordDelivered, data.getNotificationDocumentMetadataRecord0, data.downloadRecord]))
    ).toStrictEqual(true);
  });
});
