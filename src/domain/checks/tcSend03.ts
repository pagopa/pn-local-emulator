import { Group } from '../reportengine/reportengine';
import * as GetNotificationDocumentMetadataChecks from './GetNotificationDocumentMetadataChecks';

export const tcSend03 = Group({
  'Download documents attached to the notification': Group({
    'Have you downloaded the notified document?': Group({
      'Have you requested the metadata of the notification with the IUN retrieved previously?':
        GetNotificationDocumentMetadataChecks.getNotificationDocumentMetadataC,
      'Have you downloaded the PDF of the notification?': () => false,
    }),
    'Have you downloaded the pagoPA payment document?': Group({
      'Have you requested the metadata of the payment document?': () => false,
      'Have you downloaded the PDF of the payment document?': () => false,
    }),
  }),
});
