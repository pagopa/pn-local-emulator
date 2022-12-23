import * as DownloadRecordChecks from '../DownloadRecordChecks';
import * as data from '../../__tests__/data';

describe('DownloadRecordChecks', () => {
  it('metadataRecordMatchesDownloadRecordC', () => {
    const check = DownloadRecordChecks.metadataRecordMatchesDownloadRecordC;
    expect(check([])(data.getPaymentNotificationMetadataRecord)).toStrictEqual(false);
    expect(check([data.downloadRecordWithFakeUrl])(data.getPaymentNotificationMetadataRecord)).toStrictEqual(false);
    expect(check([data.downloadRecordWithFakeUrl])(data.getNotificationDocumentMetadataRecord0)).toStrictEqual(false);

    expect(check([data.downloadRecord])(data.getPaymentNotificationMetadataRecord)).toStrictEqual(true);
    expect(check([data.downloadRecord])(data.getNotificationDocumentMetadataRecord0)).toStrictEqual(true);
    expect(
      check([data.downloadRecord, data.downloadRecordWithFakeUrl])(data.getNotificationDocumentMetadataRecord0)
    ).toStrictEqual(true);
  });
});
