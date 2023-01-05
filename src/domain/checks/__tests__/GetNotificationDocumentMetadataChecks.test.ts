import * as GetNotificationDocumentMetadataChecks from '../GetNotificationDocumentMetadataChecks';
import { MetadataRecords } from '../../__tests__/getMetadataRecordData';

describe('GetNotificationDocumentMetadataChecks', () => {
  const NotificationMetadata = MetadataRecords.notification;
  it('getNotificationDocumentMetadataC', () => {
    const check = GetNotificationDocumentMetadataChecks.getNotificationDocumentMetadataC;
    expect(check(NotificationMetadata.empty)).toStrictEqual(false);
    expect(check(NotificationMetadata.onlyConsume)).toStrictEqual(false);
    expect(check(NotificationMetadata.withAcceptedEventAndMetadata)).toStrictEqual(true);
  });

  it('downloadedNotificationDocumentC', () => {
    const check = GetNotificationDocumentMetadataChecks.downloadedNotificationDocumentC;
    expect(check(NotificationMetadata.empty)).toStrictEqual(false);
    expect(check(NotificationMetadata.onlyConsume)).toStrictEqual(false);
    expect(check(NotificationMetadata.withAcceptedEventAndMetadata)).toStrictEqual(false);
    expect(check(NotificationMetadata.withoutDocumentWithDownloadRequest)).toStrictEqual(false);
    expect(check(NotificationMetadata.withDocumentWithDownloadRequest)).toStrictEqual(true);
  });
});
