import * as GetNotificationDocumentMetadataChecks from '../GetNotificationDocumentMetadataChecks';
import * as data from '../../__tests__/data';

describe('GetNotificationDocumentMetadataChecks', () => {
  it('getNotificationDocumentMetadataC', () => {
    const check = GetNotificationDocumentMetadataChecks.getNotificationDocumentMetadataC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecord])).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecord, data.getNotificationDocumentMetadataRecord0])).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered, data.getNotificationDocumentMetadataRecord0])).toStrictEqual(
      true
    );
  });

  it('downloadedNotificationDocumentC', () => {
    const check = GetNotificationDocumentMetadataChecks.downloadedNotificationDocumentC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered])).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered, data.getNotificationDocumentMetadataRecord0])).toStrictEqual(
      false
    );
    expect(
      check([data.consumeEventStreamRecordDelivered, data.getNotificationDocumentMetadataRecord0, data.downloadRecord])
    ).toStrictEqual(true);
  });
});
