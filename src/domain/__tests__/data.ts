import crypto from 'crypto';
import {
  NewNotificationRequest,
  NotificationFeePolicyEnum,
  PhysicalCommunicationTypeEnum,
} from '../../generated/definitions/NewNotificationRequest';
import { NewStatusEnum } from '../../generated/streams/ProgressResponseElement';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from '../ConsumeEventStreamRecordRepository';
import { CreateEventStreamRecord } from '../CreateEventStreamRecordRepository';
import { makeNewNotificationRecord, NewNotificationRecord } from '../NewNotificationRepository';
import { PreLoadRecord } from '../PreLoadRepository';
import { UploadToS3Record } from '../UploadToS3RecordRepository';
import { GetNotificationDetailRecord, makeFullSentNotification } from '../GetNotificationDetailRepository';
import {
  GetNotificationDocumentMetadataRecord,
  makeNotificationAttachmentDownloadMetadataResponse,
} from '../GetNotificationDocumentMetadataRepository';
import { GetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecordRepository';
import { FullSentNotification } from '../../generated/definitions/FullSentNotification';
import { RecipientTypeEnum, TypeEnum } from '../../generated/definitions/NotificationRecipient';
import { SystemEnv } from '../../useCases/SystemEnv';
import { Logger, makeLogger } from '../../logger';
import * as inMemory from '../../adapters/inMemory';
import { unsafeCoerce } from 'fp-ts/function';
import { config } from '../../__tests__/data';

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

const anAttachmentRef = {
  key: 'key',
  versionToken: '123',
};

const aDocument0: FullSentNotification['documents'][0] = {
  docIdx: '0',
  digests: {
    sha256: 'aSha256',
  },
  contentType: 'application/pdf',
  ref: anAttachmentRef,
};

const aDocument1 = {
  ...aDocument0,
  docIdx: '1',
  ref: {
    ...aDocument0.ref,
    key: 'key1',
  },
};

export const makeTestSystemEnv = (
  preloadRecords: ReadonlyArray<PreLoadRecord> = [],
  uploadToS3Records: ReadonlyArray<UploadToS3Record> = [],
  createNotificationRequestRecords: ReadonlyArray<NewNotificationRecord> = [],
  findNotificationRequestRecords: ReadonlyArray<CheckNotificationStatusRecord> = [],
  consumeEventStreamRecords: ReadonlyArray<ConsumeEventStreamRecord> = [],
  logger: Logger = makeLogger()
): SystemEnv => ({
  uploadToS3URL: config.server.uploadToS3URL,
  downloadDocumentURL: new URL('http://localhost/downloaddocument'),
  sampleStaticPdfFileName: 'sample.pdf',
  occurrencesAfterComplete: 2,
  senderPAId: aSenderPaId,
  iunGenerator: crypto.randomUUID,
  dateGenerator: () => new Date(),
  preLoadRecordRepository: inMemory.makeRepository(logger)<PreLoadRecord>(preloadRecords),
  uploadToS3RecordRepository: inMemory.makeRepository(logger)<UploadToS3Record>(uploadToS3Records),
  createNotificationRequestRecordRepository: inMemory.makeRepository(logger)(createNotificationRequestRecords),
  findNotificationRequestRecordRepository: inMemory.makeRepository(logger)(findNotificationRequestRecords),
  createEventStreamRecordRepository: inMemory.makeRepository(logger)<CreateEventStreamRecord>([]),
  consumeEventStreamRecordRepository: inMemory.makeRepository(logger)(consumeEventStreamRecords),
  getNotificationDetailRecordRepository: inMemory.makeRepository(logger)<GetNotificationDetailRecord>([]),
  getNotificationDocumentMetadataRecordRepository: inMemory.makeRepository(
    logger
  )<GetNotificationDocumentMetadataRecord>([]),
  getPaymentNotificationMetadataRecordRepository: inMemory.makeRepository(logger)<GetPaymentNotificationMetadataRecord>(
    []
  ),
});

const aRecipient: FullSentNotification['recipients'][0] = {
  recipientType: RecipientTypeEnum.PF,
  denomination: 'denomination',
  taxId: 'aTaxId',
  digitalDomicile: {
    type: TypeEnum.PEC,
    address: 'hello@thisismypec.pec',
  },
  physicalAddress: {
    address: '',
    zip: '',
    municipality: '',
  },
  payment: {
    creditorTaxId: unsafeCoerce('77777777777'),
    noticeCode: unsafeCoerce('302000100000019421'),
    pagoPaForm: {
      digests: {
        sha256: 'aSha256',
      },
      contentType: 'application/pdf',
      ref: anAttachmentRef,
    },
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
  output: { statusCode: 200, returned: parseInt(anAttachmentRef.versionToken) },
};

// NewNotificationRecord //////////////////////////////////////////////////////

const newNotificationRequest: NewNotificationRequest = {
  paProtocolNumber: paProtocolNumber.valid,
  subject: 'subject',
  recipients: [aRecipient],
  documents: [{ ...aDocument0, docIdx: undefined }, aDocument1],
  notificationFeePolicy: NotificationFeePolicyEnum.FLAT_RATE,
  physicalCommunicationType: PhysicalCommunicationTypeEnum.REGISTERED_LETTER_890,
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

const checkNotificationStatusRecordReturned = {
  ...newNotificationRecord.input.body,
  // override any undefined `docIdx`
  documents: [aDocument0, aDocument1],
  paProtocolNumber: paProtocolNumber.valid,
  notificationRequestId: notificationId.valid,
  notificationRequestStatus: 'WAITING',
};

export const checkNotificationStatusRecord: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { notificationRequestId: notificationId.valid },
  output: {
    statusCode: 200,
    returned: checkNotificationStatusRecordReturned,
  },
};

export const checkNotificationStatusRecordAccepted: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { notificationRequestId: notificationId.valid },
  output: {
    statusCode: 200,
    returned: {
      ...checkNotificationStatusRecordReturned,
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
      ...checkNotificationStatusRecordReturned,
      idempotenceToken: idempotenceToken.valid,
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
  documents: [aDocument0, aDocument1],
  notificationRequestId: notificationId.valid,
})(aIun.valid);

export const getNotificationDetailRecordAccepted: GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid },
  output: { statusCode: 200, returned: acceptedNotification },
};

// GetNotificationDocumentMetadataRecord //////////////////////////////////////

export const getNotificationDocumentMetadataRecord0: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, docIdx: 0 },
  output: {
    statusCode: 200,
    returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument0),
  },
};

export const getNotificationDocumentMetadataRecord1: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, docIdx: 1 },
  output: {
    statusCode: 200,
    returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument1),
  },
};

// GetPaymentNotificationMetadataRecord //////////////////////////////////////

export const getPaymentNotificationMetadataRecord: GetPaymentNotificationMetadataRecord = {
  type: 'GetPaymentNotificationMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, recipientId: 0, attachmentName: 'PAGOPA' },
  output: {
    statusCode: 200,
    returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument0),
  },
};
