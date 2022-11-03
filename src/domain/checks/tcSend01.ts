import { Group } from '../reportengine/reportengine';
import * as PreLoadRecordChecks from './PreLoadRecord';
import * as UploadToS3RecordChecks from './UploadToS3Record';
import * as NewNotificationRequestRecordChecks from './NewNotificationRequestRecord';

export const tcSend01 = Group({
  'Request at least two upload slots': Group({
    ...PreLoadRecordChecks.atLeastOneRequest,
    ...PreLoadRecordChecks.atLeastOneRequestWithUniqueIdx,
    ...PreLoadRecordChecks.atLeastTwoSlowWithContentTypePdf,
    ...PreLoadRecordChecks.atLeastRequestedTwoValidSlots,
  }),
  'Upload at least two files': Group({
    ...UploadToS3RecordChecks.uploadAtLeastTwoFiles,
  }),
  'Create a notification request': Group({
    ...NewNotificationRequestRecordChecks.atLeastOneRequest,
    ...NewNotificationRequestRecordChecks.atLeastOneRequestWithValidRecipient,
    ...NewNotificationRequestRecordChecks.atLeastOneRegisteredLetter890,
    ...NewNotificationRequestRecordChecks.atLeastOneRequestWithValidDocuments,
    ...NewNotificationRequestRecordChecks.atLeastOneNotificationSent,
  }),
});
