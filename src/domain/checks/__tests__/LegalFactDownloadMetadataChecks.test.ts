import * as LegalFactDownloadMetadataChecks from '../LegalFactDownloadMetadataChecks';
import * as data from '../../__tests__/data';

describe('LegalFactDownloadMetadataChecks', () => {
  it('getLegalFactDownloadMetadataRecord', () => {
    const check = LegalFactDownloadMetadataChecks.getLegalFactDownloadMetadataRecord;
    expect(check([data.getLegalFactDownloadMetadataRecord])).toStrictEqual(false);
    expect(check([data.getLegalFactDownloadMetadataRecord, data.getNotificationDetailRecordAccepted])).toStrictEqual(
      false
    );
    expect(
      check([
        {
          ...data.getLegalFactDownloadMetadataRecord,
          input: { ...data.getLegalFactDownloadMetadataRecord.input, iun: data.aIun.invalid },
        },
        data.getNotificationDetailRecordAcceptedWithTimeline,
      ])
    ).toStrictEqual(false);

    expect(
      check([data.getLegalFactDownloadMetadataRecord, data.getNotificationDetailRecordAcceptedWithTimeline])
    ).toStrictEqual(true);

    // If no legal facts are present, the check should be false
    expect(check([])).toStrictEqual(false);
  });
});
