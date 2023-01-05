import * as LegalFactDownloadMetadataChecks from '../LegalFactDownloadMetadataChecks';
import { MetadataRecords } from '../../__tests__/getMetadataRecordData';

describe('LegalFactDownloadMetadataChecks', () => {
  const LegalFactMetadata = MetadataRecords.legalFact;
  it('getLegalFactDownloadMetadataRecord', () => {
    const check = LegalFactDownloadMetadataChecks.getLegalFactDownloadMetadataRecord;
    expect(check(LegalFactMetadata.onlyLegalFact)).toStrictEqual(false);
    expect(check(LegalFactMetadata.withAcceptedNotification)).toStrictEqual(false);
    expect(check(LegalFactMetadata.withInvalidIunAndWithTimeline)).toStrictEqual(false);

    expect(check(LegalFactMetadata.validWithTimeline)).toStrictEqual(true);

    // If no legal facts are present, the check should be true
    expect(check(LegalFactMetadata.empty)).toStrictEqual(true);
  });
});
