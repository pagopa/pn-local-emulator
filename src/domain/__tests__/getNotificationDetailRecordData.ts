import { GetNotificationDetailRecord, makeFullSentNotification } from '../GetNotificationDetailRecord';
import { TimelineElementCategoryEnum } from '../../generated/pnapi/TimelineElementCategory';
import {
  aDate,
  aDocument0,
  aDocument1,
  aIun,
  aLegalFactId,
  aLegalFactType,
  apiKey,
  aRecipient,
  aSenderPaId,
  notificationId,
  paProtocolNumber,
} from './data';
import { NewNotificationRecord } from '../NewNotificationRecord';
import { NotificationFeePolicyEnum, PhysicalCommunicationTypeEnum } from '../../generated/pnapi/NewNotificationRequest';
import { unsafeCoerce } from 'fp-ts/function';

const newNotificationRequest: NewNotificationRecord['input']['body'] = {
  paProtocolNumber: paProtocolNumber.valid,
  subject: 'subject',
  recipients: [aRecipient],
  documents: [{ ...aDocument0, docIdx: undefined }, aDocument1],
  notificationFeePolicy: NotificationFeePolicyEnum.FLAT_RATE,
  physicalCommunicationType: PhysicalCommunicationTypeEnum.REGISTERED_LETTER_890,
  senderDenomination: unsafeCoerce('senderDenomination'),
  senderTaxId: unsafeCoerce('senderTaxId'),
};

const acceptedNotification = makeFullSentNotification(aSenderPaId)(aDate)({
  ...newNotificationRequest,
  documents: [aDocument0, aDocument1],
  notificationRequestId: notificationId.valid,
})(aIun.valid);

const acceptedNotificationWithTimeline = {
  ...acceptedNotification,
  timeline: [
    {
      elementId: `${acceptedNotification.iun}_request_accepted`,
      timestamp: aDate,
      legalFactsIds: [
        {
          key: aLegalFactId,
          category: aLegalFactType,
        },
      ],
      category: TimelineElementCategoryEnum.REQUEST_ACCEPTED,
    },
  ],
};

const getNotificationDetailRecordAccepted: GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid },
  output: { statusCode: 200, returned: acceptedNotification },
  loggedAt: aDate,
};

const getNotificationDetailRecordAcceptedWithTimeline: GetNotificationDetailRecord = {
  ...getNotificationDetailRecordAccepted,
  output: { statusCode: 200, returned: acceptedNotificationWithTimeline },
};

export const GetNotificationDetailRecords = {
  one: [getNotificationDetailRecordAccepted],
  withTimeline: [getNotificationDetailRecordAcceptedWithTimeline],
};
