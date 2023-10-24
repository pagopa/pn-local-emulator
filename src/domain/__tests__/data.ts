import crypto from 'crypto';
import { unsafeCoerce } from 'fp-ts/function';
import { PhysicalCommunicationTypeEnum } from '../../generated/pnapi/NewNotificationRequest';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRecord';
import { ConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { CreateEventStreamRecord } from '../CreateEventStreamRecord';
import { NewNotificationRecord } from '../NewNotificationRecord';
import { PreLoadRecord } from '../PreLoadRecord';
import { UploadToS3Record } from '../UploadToS3Record';
import { GetNotificationDetailRecord, makeFullSentNotification } from '../GetNotificationDetailRecord';
import { GetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { GetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { ListEventStreamRecord } from '../ListEventStreamRecord';
import { RecipientTypeEnum } from '../../generated/pnapi/NotificationRecipient';
import { SystemEnv } from '../../useCases/SystemEnv';
import { Logger, makeLogger } from '../../logger';
import * as inMemory from '../../adapters/inMemory';
import { config } from '../../__tests__/data';
import {
  LegalFactDownloadMetadataRecord,
  makeLegalFactDownloadMetadataResponse,
} from '../LegalFactDownloadMetadataRecord';
import { LegalFactCategoryEnum } from '../../generated/pnapi/LegalFactCategory';
import { IUN } from '../../generated/pnapi/IUN';
import { TypeEnum } from '../../generated/pnapi/NotificationDigitalAddress';
import { makeNotificationAttachmentDownloadMetadataResponse } from '../NotificationAttachmentDownloadMetadataResponse';
import { DownloadRecord } from '../DownloadRecord';
import { EventTypeEnum } from '../../generated/streams/StreamCreationRequest';
import { GetNotificationPriceRecord } from '../GetNotificationPriceRecord';
import { noticeCode } from '../../generated/pnapi/noticeCode';
import { TimelineElementCategoryEnum } from '../../generated/pnapi/TimelineElementCategory';
import { NotificationFeePolicyEnum } from '../../generated/pnapi/NotificationFeePolicy';
import { NotificationStatusEnum } from '../../generated/streams/NotificationStatus';
import { RequestResponseRecord } from '../RequestResponseRecord';

export const apiKey = {
  valid: 'key-value',
  invalid: 'invalid-key-value',
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
  valid: unsafeCoerce<string, IUN>('ILNK-HRTZ-CRNL-163785-I-2'),
  invalid: unsafeCoerce<string, IUN>('ILNK-HRTZ-CRNL-186985-I-2'),
};

export const streamId = {
  valid: aIun.valid,
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

export const aDocument0: NewNotificationRecord['input']['body']['documents'][0] = {
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

export const aRetryAfterMs = 1000;

export const aNotificationPrice = 100;

export const aNoticeCode: noticeCode = unsafeCoerce('302000100000019421');

export const aCurl = 'aCurl';

export const aJson = 'aCurl';

export const makeTestSystemEnv = (
  createNotificationRequestRecords: ReadonlyArray<NewNotificationRecord> = [],
  findNotificationRequestRecords: ReadonlyArray<CheckNotificationStatusRecord> = [],
  consumeEventStreamRecords: ReadonlyArray<ConsumeEventStreamRecord> = [],
  createEventStreamRecords: ReadonlyArray<CreateEventStreamRecord> = [],
  logger: Logger = makeLogger()
): SystemEnv => {
  return {
    uploadToS3URL: config.server.uploadToS3URL,
    downloadDocumentURL: config.server.downloadDocumentURL,
    sampleStaticPdfFileName: 'sample.pdf',
    occurrencesToAccepted: 2,
    occurrencesToDelivering: 4,
    occurrencesToDelivered: 6,
    occurrencesToViewed: 8,
    senderPAId: aSenderPaId,
    retryAfterMs: aRetryAfterMs,
    notificationPrice: aNotificationPrice,
    iunGenerator: () => aIun.valid,
    dateGenerator: () => new Date(0),
    uuidGenerator: () => crypto.randomUUID(),
    recordRepository: inMemory.makeRecordRepository(logger)([
      ...createNotificationRequestRecords,
      ...findNotificationRequestRecords,
      ...consumeEventStreamRecords,
      ...createEventStreamRecords,
    ]),
  };
};

export const aRecipient: NewNotificationRecord['input']['body']['recipients'][0] = {
  recipientType: RecipientTypeEnum.PF,
  denomination: unsafeCoerce('denomination'),
  taxId: unsafeCoerce('aTaxId'),
  digitalDomicile: {
    type: TypeEnum.PEC,
    address: 'hello@thisismypec.pec',
  },
  physicalAddress: {
    address: '',
    zip: '',
    municipality: '',
  },
  payments: [{
    pagoPa: {
      noticeCode: aNoticeCode,
      creditorTaxId: unsafeCoerce('77777777777'),
      applyCost: true
    }
  }],
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

export const mkNewNotificationRecord = (
  documents: NewNotificationRecord['input']['body']['documents'],
  recipients: NewNotificationRecord['input']['body']['recipients']
): NewNotificationRecord => ({
  type: 'NewNotificationRecord',
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

export const newNotificationRecordWithIdempotenceToken: NewNotificationRecord = {
  type: 'NewNotificationRecord',
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
};

// CheckNotificationStatusRecord //////////////////////////////////////////////

const checkNotificationStatusRecordReturned = {
  ...newNotificationRecord.input.body,
  // override any undefined `docIdx`
  documents: [aDocument0, aDocument1],
  paProtocolNumber: paProtocolNumber.valid,
  notificationRequestId: notificationId.valid,
  notificationRequestStatus: 'WAITING',
  retryAfter: aRetryAfterMs / 1000,
};

export const checkNotificationStatusRecord: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { apiKey: apiKey.valid, body: { notificationRequestId: notificationId.valid } },
  output: {
    statusCode: 200,
    returned: checkNotificationStatusRecordReturned,
  },
  loggedAt: aDate,
};

export const checkNotificationStatusRecordAccepted: CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord',
  input: { apiKey: apiKey.valid, body: { notificationRequestId: notificationId.valid } },
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
  input: { apiKey: apiKey.valid, body: { notificationRequestId: notificationId.valid } },
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

const createEventStatusStreamBody = {
  title: 'Stream Title',
  eventType: EventTypeEnum.STATUS,
};

export const createEventStatusStreamResponse = {
  statusCode: 200 as const,
  returned: {
    ...createEventStatusStreamBody,
    streamId: streamId.valid,
    activationDate: aDate,
  },
};

export const createEventStreamRecord: CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord',
  input: { apiKey: apiKey.valid, body: createEventStatusStreamBody },
  output: createEventStatusStreamResponse,
  loggedAt: aDate,
};

export const createTimelineEventStreamRecord: CreateEventStreamRecord = {
  ...createEventStreamRecord,
  input: {
    ...createEventStreamRecord.input,
    body: { ...createEventStreamRecord.input.body, eventType: EventTypeEnum.TIMELINE },
  },
  output: {
    ...createEventStatusStreamResponse,
    returned: {
      ...createEventStatusStreamResponse.returned,
      eventType: EventTypeEnum.TIMELINE,
    },
  },
};

// ListEventStreamRecord ////////////////////////////////////////////////////

export const listEventStreamRecord: ListEventStreamRecord = {
  type: 'ListEventStreamRecord',
  input: { apiKey: apiKey.valid },
  output: { statusCode: 200, returned: [createEventStatusStreamResponse.returned] },
  loggedAt: aDate,
};

// ConsumeEventStreamRecord ///////////////////////////////////////////////////

export const acceptedEvent = {
  eventId: '1',
  timestamp: aDate,
  notificationRequestId: notificationId.valid,
  newStatus: NotificationStatusEnum.ACCEPTED,
  iun: aIun.valid,
};

export const inValidationEvent = {
  eventId: '1',
  timestamp: aDate,
  notificationRequestId: notificationId.valid,
  newStatus: NotificationStatusEnum.IN_VALIDATION,
};

export const consumeEventStreamResponse = {
  statusCode: 200 as const,
  headers: { 'retry-after': aRetryAfterMs },
  returned: [
    {
      eventId: '0',
      analogCost: 325,
      channel: 'B2B',
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

export const consumeEventStreamRecordInValidation = {
  ...consumeEventStreamRecord,
  output: {
    ...consumeEventStreamResponse,
    returned: [inValidationEvent],
  },
};

export const consumeEventStreamRecordDelivered = {
  ...consumeEventStreamRecord,
  output: {
    ...consumeEventStreamResponse,
    returned: consumeEventStreamResponse.returned.map((returned) => ({
      ...returned,
      newStatus: NotificationStatusEnum.ACCEPTED,
      timelineEventCategory: TimelineElementCategoryEnum.REQUEST_ACCEPTED,
      iun: aIun.valid,
    })),
  },
};

export const consumeEventStreamRecordDeliveredDelayed = {
  ...consumeEventStreamRecordDelivered,
  loggedAt: new Date(aDate.getTime() + 2000),
};

// GetNotificationDetailRecord /////////////////////////////////////////////////

const acceptedNotification = makeFullSentNotification(makeTestSystemEnv())({
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
          key: `safestorage://${aLegalFactId}`, // Format of the key is: safestorage://<legalFactId>
          category: aLegalFactType,
        },
      ],
      category: TimelineElementCategoryEnum.REQUEST_ACCEPTED,
    },
  ],
};

export const getNotificationDetailRecordAccepted: GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid },
  output: { statusCode: 200, returned: acceptedNotification },
  loggedAt: aDate,
};

export const getNotificationDetailRecordAcceptedWithTimeline: GetNotificationDetailRecord = {
  ...getNotificationDetailRecordAccepted,
  output: { statusCode: 200, returned: acceptedNotificationWithTimeline },
};

// GetNotificationDocumentMetadataRecord //////////////////////////////////////

const getNotificationDocumentMetadataRecordOutput200: GetNotificationDocumentMetadataRecord['output'] = {
  statusCode: 200,
  returned: makeNotificationAttachmentDownloadMetadataResponse(makeTestSystemEnv())(aDocument0),
};

export const getNotificationDocumentMetadataRecord0: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: apiKey.valid, iun: aIun.valid, docIdx: 0 },
  output: getNotificationDocumentMetadataRecordOutput200,
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
  output: getNotificationDocumentMetadataRecordOutput200,
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
  loggedAt: aDate,
};

// DownloadRecord ////////////////////////////////////////////////////////////
export const downloadRecord: DownloadRecord = {
  type: 'DownloadRecord',
  input: { url: getNotificationDocumentMetadataRecordOutput200.returned.url || aUrl },
  output: {
    statusCode: 200,
    returned: undefined,
  },
  loggedAt: aDate,
};

export const downloadRecordWithFakeUrl: DownloadRecord = {
  ...downloadRecord,
  input: { url: 'https://fakeurl.com' },
};

// GetNotificationPriceRecord ////////////////////////////////////////////////
export const getNotificationPriceRecord: GetNotificationPriceRecord = {
  type: 'GetNotificationPriceRecord',
  input: { apiKey: apiKey.valid, paTaxId: newNotificationRequest.senderTaxId, noticeCode: aNoticeCode },
  output: {
    statusCode: 200,
    returned: {
      iun: aIun.valid,
      amount: 100,
    },
  },
  loggedAt: aDate,
};

// UploadToS3Record ////////////////////////////////////////////////
export const getUploadToS3Record: UploadToS3Record = {
  type: 'UploadToS3Record',
  input: {
    url: aUrl,
    key: 'test',
    checksumAlg: undefined,
    secret: 'test',
    checksum: 'test',
    computedSha256: 'test',
  },
  output: { statusCode: 200, returned: 0 },
  loggedAt: aDate,
};
// RequestResponseRecord ////////////////////////////////////////////////////
export const requestResponseRecordWithoutReturned = {
  type: 'RequestResponseRecord',
  input: {
    apiKey: apiKey.valid,
    requestCurl: aCurl,
    responseJson: aJson,
  },
  output: { statusCode: 200, returned: [] },
  loggedAt: aDate,
} as RequestResponseRecord;
