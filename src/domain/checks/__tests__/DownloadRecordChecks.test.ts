import * as DownloadRecordChecks from '../DownloadRecordChecks';
import { DownloadRecords } from '../../__tests__/downloadRecordData';
import { MetadataRecords } from '../../__tests__/getMetadataRecordData';

describe('DownloadRecordChecks', () => {
  it('metadataRecordMatchesDownloadRecordC', () => {
    const check = DownloadRecordChecks.metadataRecordMatchesDownloadRecordC;
    expect(check(DownloadRecords.empty)(MetadataRecords.payment.withF24Payment[0])).toStrictEqual(false);
    expect(check(DownloadRecords.withFakeUrl)(MetadataRecords.payment.withF24Payment[0])).toStrictEqual(false);
    expect(check(DownloadRecords.withFakeUrl)(MetadataRecords.notification.onlyNotification[0])).toStrictEqual(false);

    expect(check(DownloadRecords.onlyDownload)(MetadataRecords.payment.withF24Payment[0])).toStrictEqual(true);
    expect(check(DownloadRecords.onlyDownload)(MetadataRecords.notification.onlyNotification[0])).toStrictEqual(true);
    expect(check(DownloadRecords.withRealAndFakeUrl)(MetadataRecords.notification.onlyNotification[0])).toStrictEqual(
      true
    );
  });
});
