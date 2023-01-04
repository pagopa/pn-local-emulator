import { Group } from '../reportengine/reportengine';
import * as GetNotificationDocumentMetadataChecks from './GetNotificationDocumentMetadataChecks';
import * as GetPaymentNotificationMetadataChecks from './GetPaymentNotificationMetadataChecks';
import * as LegalFactDownloadMetadataChecks from './LegalFactDownloadMetadataChecks';
import {downloadedLegalFactsDocumentC} from "./LegalFactDownloadMetadataChecks";

export const tcSend03 = Group({
  'Download documents attached to the notification': Group({
    'Have you downloaded the notified document?': Group({
      'Have you requested the metadata of the notification with the IUN retrieved previously?':
        GetNotificationDocumentMetadataChecks.getNotificationDocumentMetadataC,
      'Have you downloaded the PDF of the notification?':
        GetNotificationDocumentMetadataChecks.downloadedNotificationDocumentC,
    }),
    'Have you downloaded the pagoPA payment document?': Group({
      'Have you requested the metadata of the pagoPA payment attachment with the IUN retrieved previously?':
        GetPaymentNotificationMetadataChecks.matchesIunAndHasPAGOPAAsAttachmentName,
      'Have you downloaded the PDF of the pagoPA payment document?':
        GetPaymentNotificationMetadataChecks.downloadedPaymentDocumentC,
    }),
  }),
  'Have you downloaded the legal facts?': Group({
    'Have you requested the metadata of the legal facts?':
      LegalFactDownloadMetadataChecks.getLegalFactDownloadMetadataRecord,
    'Have you downloaded the PDF of the legal facts?': LegalFactDownloadMetadataChecks.downloadedLegalFactsDocumentC,
  }),
});
