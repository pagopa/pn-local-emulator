import { Group } from '../reportengine/reportengine';
import * as PreLoadRecordChecks from './PreLoadRecordChecks';
import * as UploadToS3RecordChecks from './UploadToS3RecordChecks';
import * as NewNotificationRequestRecordChecks from './NewNotificationRequestRecordChecks';

export const tcSend01bis = Group({
  'Request at least one upload slot': Group({
    'Have you done at least one request': PreLoadRecordChecks.atLeastOnePreLoadRecordC,
    'Have you required at least one pdf': PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC,
    'Have you received at least one valid slot': PreLoadRecordChecks.atLeastOneValidSlotC,
  }),
  'Upload at least one file': Group({
    'Have you upload one file using the information of previous step?':
      UploadToS3RecordChecks.atLeastNUploadMatchingPreLoadRecordC(1),
  }),
  'Create a notification request': Group({
    'Have you done at least one request?': NewNotificationRequestRecordChecks.atLeastOneRecordC,
    'Have you provided the value REGISTERED_LETTER_890 for the property physicalCommunicationType?':
      NewNotificationRequestRecordChecks.atLeastOneRegisteredLetter890C,
    'Have you filled the following properties for every recipients?': Group({
      'Have you filled the property taxId?': NewNotificationRequestRecordChecks.atLeastOneValidTaxIdC,
      'Have you filled the property digitalDomicile?':
        NewNotificationRequestRecordChecks.atLeastOneValidDigitalDomicileC,
      'Have you filled the property physicalAddress?':
        NewNotificationRequestRecordChecks.atLeastOneValidPhysicalAddressC,
      'Have you filled the following properties for every payment?': Group({
        'Have you filled the property creditorTaxId': NewNotificationRequestRecordChecks.atLeastOneValidCreditorTaxIdC,
        'Have you filled the property noticeCode': NewNotificationRequestRecordChecks.atLeastOneValidNoticeCodeC,
      }),
    }),
    'Have you filled the property documents with the references of files previously uploaded?':
      NewNotificationRequestRecordChecks.atLeastOneRequestWithValidDocumentsC,
    'Have you created at least one valid notification': NewNotificationRequestRecordChecks.atLeastOneNotificationSentC,
  }),
});
