import * as O from 'fp-ts/Option';
import {
  NewNotificationRequest,
  NotificationFeePolicyEnum,
  PhysicalCommunicationTypeEnum,
} from '../../generated/definitions/NewNotificationRequest';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRepository';
import { CreateEventStreamRecord } from '../CreateEventStreamRecordRepository';
import { makeNewNotificationRecord } from '../NewNotificationRepository';
import { PreLoadRecord } from '../PreLoadRepository';
import { UploadToS3Record } from '../UploadToS3RecordRepository';

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

export const aIun = {
  valid: 'aIunValue',
};

// PreLoadRecord //////////////////////////////////////////////////////////////

const preLoadBody = { preloadIdx: '0', contentType: 'application/pdf', sha256: 'a-sha256' };
const preLoadResponse = { preloadIdx: '0', secret: 'a-secret', url: 'a-url', key: 'a-key' };

export const preLoadRecord: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: apiKey.valid, body: [preLoadBody] },
  output: { statusCode: 200, returned: [preLoadResponse] },
};

// UploadToS3Record ///////////////////////////////////////////////////////////

export const uploadToS3Record: UploadToS3Record = {
  type: 'UploadToS3Record',
  input: {
    key: preLoadResponse.key,
    checksumAlg: O.none,
    secret: preLoadResponse.secret,
    checksum: preLoadBody.sha256,
  },
  output: { statusCode: 200, returned: 10 },
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
      notificationRequestStatus: 'WAITING',
    },
  },
};

export const checkNotificationStatusRecordAccepted: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { notificationRequestId: notificationId.valid },
  output: {
    statusCode: 200,
    returned: {
      ...newNotificationRecord.input.body,
      idempotenceToken: undefined,
      paProtocolNumber: paProtocolNumber.valid,
      notificationRequestId: notificationId.valid,
      notificationRequestStatus: 'ACCEPTED',
      iun: aIun.valid,
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
      notificationRequestStatus: 'WAITING',
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
