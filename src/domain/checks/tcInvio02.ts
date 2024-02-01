import { Group } from '../reportengine/reportengine';
import * as PreLoadRecordChecks from './PreLoadRecordChecks';
import * as UploadToS3RecordChecks from './UploadToS3RecordChecks';
import * as NewNotificationRequestRecordChecks from './NewNotificationRequestRecordChecks';

export const tcInvio02 = Group({
  'Request at least two upload slots': Group({
    'Have you done at least one request?': PreLoadRecordChecks.atLeastOnePreLoadRecordC,
    'Have you required at least one pdf?': PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC,
    'Have you received at least two valid slots?': PreLoadRecordChecks.atLeastTwoValidSlotC,
  }),
  'Upload at least two files': Group({
    'Have you upload two files using the information of previous step?':
      UploadToS3RecordChecks.atLeastNUploadMatchingPreLoadRecordC(2),
  }),
  'Create a notification request': Group({
    'Have you done at least one request?': NewNotificationRequestRecordChecks.atLeastOneRecordC,
    'Have you provided the value REGISTERED_LETTER_890 for the property physicalCommunicationType?':
      NewNotificationRequestRecordChecks.atLeastOneRegisteredLetter890C,
    'Have you filled the following properties for every recipient?': Group({
      'Have you filled the property taxId?': NewNotificationRequestRecordChecks.atLeastOneValidTaxIdC,
      'Have you filled the property digitalDomicile?':
        NewNotificationRequestRecordChecks.atLeastOneValidDigitalDomicileC,
      'Have you filled the property physicalAddress?':
        NewNotificationRequestRecordChecks.atLeastOneValidPhysicalAddressC,
      'Have you filled the following properties for every payment?': Group({
        'Have you filled the property creditorTaxId?': NewNotificationRequestRecordChecks.atLeastOneValidCreditorTaxIdC,
        'Have you filled the property noticeCode?': NewNotificationRequestRecordChecks.atLeastOneValidNoticeCodeC,
        'Have you filled the property pagoPa with the references of a file previously uploaded?':
          NewNotificationRequestRecordChecks.atLeastOneValidPagoPaFormC,
      }),
    }),
    'Have you filled the property documents with the references of files previously uploaded?':
      NewNotificationRequestRecordChecks.atLeastOneRequestWithValidDocumentsC,
    'Have you created at least one valid notification?': NewNotificationRequestRecordChecks.atLeastOneNotificationSentC,
  }),
});
