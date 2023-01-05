import { NewNotificationRecord } from '../NewNotificationRecord';
import { NotificationFeePolicyEnum, PhysicalCommunicationTypeEnum } from '../../generated/pnapi/NewNotificationRequest';
import { unsafeCoerce } from 'fp-ts/function';
import * as data from './data';
import { UploadToS3Records } from './uploadToS3RecordData';

const newNotificationRequest: NewNotificationRecord['input']['body'] = {
  paProtocolNumber: data.paProtocolNumber.valid,
  subject: 'subject',
  recipients: [data.aRecipient],
  documents: [{ ...data.aDocument0, docIdx: undefined }, data.aDocument1],
  notificationFeePolicy: NotificationFeePolicyEnum.FLAT_RATE,
  physicalCommunicationType: PhysicalCommunicationTypeEnum.REGISTERED_LETTER_890,
  senderDenomination: unsafeCoerce('senderDenomination'),
  senderTaxId: unsafeCoerce('senderTaxId'),
};

const mkNewNotificationRecord = (
  documents: NewNotificationRecord['input']['body']['documents'],
  recipients: NewNotificationRecord['input']['body']['recipients']
): NewNotificationRecord => ({
  type: 'NewNotificationRecord',
  input: { apiKey: data.apiKey.valid, body: { ...newNotificationRequest, documents, recipients } },
  output: {
    statusCode: 202,
    returned: {
      paProtocolNumber: data.paProtocolNumber.valid,
      notificationRequestId: data.notificationId.valid,
    },
  },
  loggedAt: data.aDate,
});

const newNotificationRecordWithoutDocIdx = mkNewNotificationRecord(
  [{ ...data.aDocument0, docIdx: undefined }, data.aDocument1],
  [data.aRecipient]
);

const newNotificationRecordWithDocIdx = mkNewNotificationRecord([data.aDocument0], [data.aRecipient]);
const newNotificationRecordWithoutPayment = mkNewNotificationRecord(
  [data.aDocument0],
  [{ ...data.aRecipient, payment: undefined }]
);

export const NewNotificationRecords = {
  empty: [],
  withoutIdx: [...UploadToS3Records.evenPreloadAndUpload, newNotificationRecordWithoutDocIdx],
  withIdx: [...UploadToS3Records.evenPreloadAndUpload, newNotificationRecordWithDocIdx],
  withIdxWithoutPayment: [...UploadToS3Records.evenPreloadAndUpload, newNotificationRecordWithoutPayment],
};
