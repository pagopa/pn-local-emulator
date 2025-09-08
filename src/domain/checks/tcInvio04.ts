import { Group } from '../reportengine/reportengine';
import * as GetNotificationDocumentMetadataChecks from './GetNotificationDocumentMetadataChecks';
import * as GetPaymentNotificationMetadataChecks from './GetPaymentNotificationMetadataChecks';
import * as LegalFactDownloadMetadataChecks from './LegalFactDownloadMetadataChecks';

export const tcInvio04 = Group({
  'Have you downloaded the legal facts?': Group({
    'Have you requested the metadata of the legal facts?':
      LegalFactDownloadMetadataChecks.getLegalFactDownloadMetadataRecord,
    'Have you downloaded the PDF of the legal facts?': LegalFactDownloadMetadataChecks.downloadedLegalFactsDocumentC,
  }),
});
