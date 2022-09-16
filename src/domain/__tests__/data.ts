import {
  NewNotificationRequest,
  NotificationFeePolicyEnum,
  PhysicalCommunicationTypeEnum,
} from '../../generated/definitions/NewNotificationRequest';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRepository';
import { CreateEventStreamRecord } from '../CreateEventStreamRecordRepository';
import { makeNewNotificationRecord } from '../NewNotificationRepository';

export const apiKey = {
  valid: 'key-value',
};

export const notificationId = {
  valid: 'notification-id',
};

export const paProtocolNumber = {
  valid: 'paProtocolNumber',
};

export const idempotenceToken = {
  valid: 'idempotenceToken',
};

// NewNotificationRecord //////////////////////////////////////////////////////

const newNotificationRequest: NewNotificationRequest = {
  paProtocolNumber: paProtocolNumber.valid,
  subject: 'subject',
  recipients: [],
  documents: [],
  notificationFeePolicy: NotificationFeePolicyEnum.FLAT_RATE,
  physicalCommunicationType: PhysicalCommunicationTypeEnum.SIMPLE_REGISTERED_LETTER,
};

export const newNotificationRecord = makeNewNotificationRecord({
  input: { apiKey: apiKey.valid, body: newNotificationRequest },
  output: {
    statusCode: 202,
    returned: {
      idempotenceToken: undefined,
      paProtocolNumber: paProtocolNumber.valid,
      notificationRequestId: notificationId.valid,
    },
  },
});

export const newNotificationRecordWithIdempotenceToken = makeNewNotificationRecord({
  input: { apiKey: apiKey.valid, body: { ...newNotificationRequest, idempotenceToken: idempotenceToken.valid } },
  output: {
    statusCode: 202,
    returned: {
      idempotenceToken: idempotenceToken.valid,
      paProtocolNumber: paProtocolNumber.valid,
      notificationRequestId: notificationId.valid,
    },
  },
});

// CheckNotificationStatusRecord //////////////////////////////////////////////

export const checkNotificationStatusRecord: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { notificationRequestId: notificationId.valid },
  output: {
    statusCode: 200,
    returned: {
      ...newNotificationRecord.input.body,
      idempotenceToken: undefined,
      paProtocolNumber: paProtocolNumber.valid,
      notificationRequestId: notificationId.valid,
      notificationRequestStatus: '__WAITING__',
    },
  },
};

export const checkNotificationStatusRecordWithIdempotenceToken: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { notificationRequestId: notificationId.valid },
  output: {
    statusCode: 200,
    returned: {
      ...newNotificationRecordWithIdempotenceToken.input.body,
      idempotenceToken: idempotenceToken.valid,
      paProtocolNumber: paProtocolNumber.valid,
      notificationRequestId: notificationId.valid,
      notificationRequestStatus: '__WAITING__',
    },
  },
};

// CreateEventStreamRecord ////////////////////////////////////////////////////

const streamCreationRequest = {
  title: 'Stream Title',
};

export const createEventStreamResponse = {
  statusCode: 200 as const,
  returned: { ...streamCreationRequest, streamId: 'stream-id', activationDate: new Date() },
};

export const createEventStreamRecord: CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord',
  input: { apiKey: apiKey.valid, body: streamCreationRequest },
  output: createEventStreamResponse,
};
