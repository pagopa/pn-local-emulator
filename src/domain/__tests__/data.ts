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
import {
  LegalFactDownloadMetadataRecord,
  makeLegalFactDownloadMetadataResponse,
} from '../LegalFactDownloadMetadataRecordRepository';
import { LegalFactCategoryEnum } from '../../generated/definitions/LegalFactCategory';
import { GetNotificationPriceRecord } from '../GetNotificationPriceRecordRepository';

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

export const aLegalFactId = 'aLegalFactId';

export const aLegalFactType = LegalFactCategoryEnum.ANALOG_DELIVERY;

export const aDate = new Date(0);

export const aSenderPaId = 'aSenderPaId';

export const anAttachmentRef = {
  key: 'key',
  versionToken: '123',
};

export const aSha256 = 'jezIVxlG1M1woCSUngM6KipUN3/p8cG5RMIPnuEanlE=';

export const aDocument0: FullSentNotification['documents'][0] = {
  docIdx: '0',
  digests: {
    sha256: aSha256,
  },
  contentType: 'application/pdf',
  ref: anAttachmentRef,
};

export const aDocument1 = {
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
): SystemEnv => {
  const baseRepository = inMemory.makeRepository(logger);
  return {
    uploadToS3URL: config.server.uploadToS3URL,
    downloadDocumentURL: new URL('http://localhost/downloaddocument'),
    sampleStaticPdfFileName: 'sample.pdf',
    occurrencesAfterComplete: 2,
    senderPAId: aSenderPaId,
    iunGenerator: crypto.randomUUID,
    dateGenerator: () => new Date(),
    preLoadRecordRepository: baseRepository(preloadRecords),
    uploadToS3RecordRepository: baseRepository(uploadToS3Records),
    createNotificationRequestRecordRepository: baseRepository(createNotificationRequestRecords),
    findNotificationRequestRecordRepository: baseRepository(findNotificationRequestRecords),
    createEventStreamRecordRepository: baseRepository<CreateEventStreamRecord>([]),
    consumeEventStreamRecordRepository: baseRepository(consumeEventStreamRecords),
    getNotificationDetailRecordRepository: baseRepository<GetNotificationDetailRecord>([]),
    getNotificationDocumentMetadataRecordRepository: baseRepository<GetNotificationDocumentMetadataRecord>([]),
    getPaymentNotificationMetadataRecordRepository: baseRepository<GetPaymentNotificationMetadataRecord>([]),
    getLegalFactDownloadMetadataRecordRepository: baseRepository<LegalFactDownloadMetadataRecord>([]),
    getNotificationPriceRecordRepository: baseRepository<GetNotificationPriceRecord>([]),
  };
};

export const aRecipient: FullSentNotification['recipients'][0] = {
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
        sha256: aSha256,
      },
      contentType: 'application/pdf',
      ref: anAttachmentRef,
    },
  },
};

export const aSecret = 'a-secret';
export const aUrl = 'a-url';

// PreLoadRecord //////////////////////////////////////////////////////////////

const preLoadBody = { preloadIdx: '0', contentType: 'application/pdf', sha256: aSha256 };
const preLoadResponse = { preloadIdx: '0', secret: 'a-secret', url: 'a-url', key: anAttachmentRef.key };

export const preLoadRecord: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: apiKey.valid, body: [preLoadBody] },
  output: { statusCode: 200, returned: [preLoadResponse] },
  loggedAt: aDate,
};

export const preLoadRecordBulk: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: apiKey.valid, body: [preLoadBody, { ...preLoadBody, preloadIdx: '1' }] },
  output: { statusCode: 200, returned: [preLoadResponse, { ...preLoadResponse, preloadIdx: '1' }] },
  loggedAt: aDate,
};
// UploadToS3Record ///////////////////////////////////////////////////////////

export const uploadToS3Record: UploadToS3Record = {
  type: 'UploadToS3Record',
  input: {
    url: preLoadResponse.url,
    key: preLoadResponse.key,
    checksumAlg: undefined,
    secret: preLoadResponse.secret,
    checksum: preLoadBody.sha256,
    computedSha256: preLoadBody.sha256,
  },
  output: { statusCode: 200, returned: parseInt(anAttachmentRef.versionToken, 10) },
  loggedAt: new Date(preLoadRecord.loggedAt.getTime() + 1000),
};

export const uploadToS3RecordDangling: UploadToS3Record = {
  ...uploadToS3Record,
  input: {
    ...uploadToS3Record.input,
    key: `${preLoadResponse.key}-dangling`,
    secret: `${preLoadResponse.secret}-dangling`,
    checksum: `${preLoadBody.sha256}-dangling`,
  },
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

export const mkNewNotificationRecord = (
  documents: NewNotificationRequest['documents'],
  recipients: NewNotificationRequest['recipients']
) =>
  makeNewNotificationRecord({
    input: { apiKey: apiKey.valid, body: { ...newNotificationRequest, documents, recipients } },
    output: {
      statusCode: 202,
      returned: {
        paProtocolNumber: paProtocolNumber.valid,
        notificationRequestId: notificationId.valid,
      },
    },
    loggedAt: aDate,
  });

export const newNotificationRecord = mkNewNotificationRecord(
  [{ ...aDocument0, docIdx: undefined }, aDocument1],
  [aRecipient]
);

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
  loggedAt: aDate,
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
  loggedAt: aDate,
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
  loggedAt: aDate,
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
  loggedAt: aDate,
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
  loggedAt: aDate,
};

// ConsumeEventStreamRecord ///////////////////////////////////////////////////

export const acceptedEvent = {
  eventId: '1',
  timestamp: aDate,
  notificationRequestId: notificationId.valid,
  newStatus: NewStatusEnum.ACCEPTED,
  iun: aIun.valid,
};

export const inValidationEvent = {
  eventId: '1',
  timestamp: aDate,
  notificationRequestId: notificationId.valid,
  newStatus: NewStatusEnum.IN_VALIDATION,
};

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
  loggedAt: aDate,
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
  loggedAt: aDate,
};

// GetNotificationDocumentMetadataRecord //////////////////////////////////////

export const getNotificationDocumentMetadataRecord0: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, docIdx: 0 },
  output: {
    statusCode: 200,
    returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument0),
  },
  loggedAt: aDate,
};

export const getNotificationDocumentMetadataRecord1: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, docIdx: 1 },
  output: {
    statusCode: 200,
    returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument1),
  },
  loggedAt: aDate,
};

// GetPaymentNotificationMetadataRecord //////////////////////////////////////

export const getPaymentNotificationMetadataRecord: GetPaymentNotificationMetadataRecord = {
  type: 'GetPaymentNotificationMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, recipientId: 0, attachmentName: 'PAGOPA' },
  output: {
    statusCode: 200,
    returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument0),
  },
  loggedAt: aDate,
};

// GetLegalFactDownloadMetadataRecord //////////////////////////////////////

export const getLegalFactDownloadMetadataRecord: LegalFactDownloadMetadataRecord = {
  type: 'LegalFactDownloadMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, legalFactType: aLegalFactType, legalFactId: aLegalFactId },
  output: {
    statusCode: 200,
    returned: makeLegalFactDownloadMetadataResponse(makeTestSystemEnv()),
  },
};
