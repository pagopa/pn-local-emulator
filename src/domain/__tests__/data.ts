import {
  NewNotificationRequest,
  NotificationFeePolicyEnum,
  PhysicalCommunicationTypeEnum,
} from '../../generated/definitions/NewNotificationRequest';
import { NewStatusEnum } from '../../generated/streams/ProgressResponseElement';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from '../ConsumeEventStreamRecordRepository';
import { CreateEventStreamRecord } from '../CreateEventStreamRecordRepository';
import { makeNewNotificationRecord } from '../NewNotificationRepository';
import { PreLoadRecord } from '../PreLoadRepository';
import { UploadToS3Record } from '../UploadToS3RecordRepository';
import { GetNotificationDetailRecord, makeFullSentNotification } from '../GetNotificationDetailRepository';
import {
  GetNotificationDocumentMetadataRecord,
  makeNotificationAttachmentDownloadMetadataResponse,
} from '../GetNotificationDocumentMetadataRepository';
import { NewNotificationResponse } from '../../generated/definitions/NewNotificationResponse';
import { FullSentNotification } from '../../generated/definitions/FullSentNotification';

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

export const streamId = {
  valid: 'streamId',
};

export const aDate = new Date(0);

export const aSenderPaId = 'aSenderPaId';

const aDocument: FullSentNotification['documents'][0] = {
  docIdx: '0',
  digests: {
    sha256: 'aSha256',
  },
  contentType: 'application/pdf',
  ref: {
    key: 'key',
    versionToken: '123',
  },
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
    checksumAlg: undefined,
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
  documents: [aDocument],
  notificationFeePolicy: NotificationFeePolicyEnum.FLAT_RATE,
  physicalCommunicationType: PhysicalCommunicationTypeEnum.SIMPLE_REGISTERED_LETTER,
};

export const newNotificationRecord = makeNewNotificationRecord({
  input: { apiKey: apiKey.valid, body: newNotificationRequest },
  output: {
    statusCode: 202,
    returned: {
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
  returned: { ...streamCreationRequest, streamId: streamId.valid, activationDate: aDate },
};

export const createEventStreamRecord: CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord',
  input: { apiKey: apiKey.valid, body: streamCreationRequest },
  output: createEventStreamResponse,
};

// ConsumeEventStreamRecord ///////////////////////////////////////////////////

export const consumeEventStreamResponse = {
  statusCode: 200 as const,
  returned: [
    {
      eventId: '0',
      timestamp: aDate,
      notificationRequestId: notificationId.valid,
    },
  ],
};

export const consumeEventStreamRecord: ConsumeEventStreamRecord = {
  type: 'ConsumeEventStreamRecord',
  input: { apiKey: apiKey.valid, streamId: streamId.valid },
  output: consumeEventStreamResponse,
};

export const consumeEventStreamRecordDelivered = {
  ...consumeEventStreamRecord,
  output: {
    ...consumeEventStreamResponse,
    returned: consumeEventStreamResponse.returned.map((returned) => ({
      ...returned,
      newStatus: NewStatusEnum.ACCEPTED,
      iun: aIun.valid,
    })),
  },
};

// GetNotificationDetailRecord /////////////////////////////////////////////////

const acceptedNotification = makeFullSentNotification(aSenderPaId)(aDate)({
  ...newNotificationRequest,
  notificationRequestId: notificationId.valid,
})(aIun.valid);

export const getNotificationDetailRecordAccepted: GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid },
  output: { statusCode: 200, returned: acceptedNotification },
};

// GetNotificationDocumentMetadataRecord //////////////////////////////////////

const notificationAttachmentDownloadMetadataResponse = makeNotificationAttachmentDownloadMetadataResponse(aDocument);

export const getNotificationDocumentMetadataRecord: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, docIdx: 0 },
  output: { statusCode: 200, returned: notificationAttachmentDownloadMetadataResponse },
};
