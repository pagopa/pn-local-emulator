import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe, tuple } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequest, PhysicalCommunicationTypeEnum } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { AllRecord, existsApiKey, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { UploadToS3Record } from './UploadToS3RecordRepository';
import { PreLoadRecord } from './PreLoadRepository';

export type Notification = NewNotificationRequest & NewNotificationResponse;

export type NewNotificationRecord = {
  type: 'NewNotificationRecord';
  input: { apiKey: ApiKey; body: NewNotificationRequest };
  output: Response<202, NewNotificationResponse> | Response<403, UnauthorizedMessageBody>;
};

export const isNewNotificationRecord = (record: AllRecord): O.Option<NewNotificationRecord> =>
  record.type === 'NewNotificationRecord' ? O.some(record) : O.none;

export const hasSuccessfulResponse = (record: NewNotificationRecord) => record.output.statusCode === 202;

export const hasRecipientTaxId = (record: NewNotificationRecord) =>
  pipe(
    record.input.body.recipients,
    RA.every((recipient) => pipe(recipient.taxId, O.fromNullable, O.isSome))
  );

export const hasRecipientDigitalDomicile = (record: NewNotificationRecord) =>
  pipe(
    record.input.body.recipients,
    RA.every((recipient) => pipe(recipient.digitalDomicile, O.fromNullable, O.isSome))
  );

export const hasPhysicalAddress = (record: NewNotificationRecord) =>
  pipe(
    record.input.body.recipients,
    RA.every((recipient) => pipe(recipient.physicalAddress, O.fromNullable, O.isSome))
  );

export const hasRegisteredLetterAsPhysicalDocumentType = (record: NewNotificationRecord) =>
  record.input.body.physicalCommunicationType === PhysicalCommunicationTypeEnum.REGISTERED_LETTER_890;

export const hasRecipientPaymentCreditorTaxId = (record: NewNotificationRecord) =>
  pipe(
    record.input.body.recipients,
    RA.every(({ payment }) => pipe(payment?.creditorTaxId, O.fromNullable, O.isSome))
  );

export const hasRecipientPaymentNoticeCode = (record: NewNotificationRecord) =>
  pipe(
    record.input.body.recipients,
    RA.every(({ payment }) => pipe(payment?.noticeCode, O.fromNullable, O.isSome))
  );

export const hasSameVersionToken = (newNotificationRecord: NewNotificationRecord, uploadToS3Record: UploadToS3Record) =>
  pipe(
    newNotificationRecord.input.body.documents,
    RA.some((document) => document.ref.versionToken === uploadToS3Record.output.returned.toString())
  );

export const hasSameDocumentKey = (newNotificationRecord: NewNotificationRecord, uploadToS3Record: UploadToS3Record) =>
  pipe(
    newNotificationRecord.input.body.documents,
    RA.some((document) => document.ref.key === uploadToS3Record.input.key)
  );

export const hasSameContentType = (newNotificationRecord: NewNotificationRecord, preLoadRecord: PreLoadRecord) =>
  pipe(
    newNotificationRecord.input.body.documents,
    RA.some((document) =>
      pipe(
        preLoadRecord.input.body,
        RA.every(({ contentType }) => contentType === document.contentType)
      )
    )
  );

export const hasSameSha256 = (newNotificationRecord: NewNotificationRecord, preLoadRecord: PreLoadRecord) =>
  pipe(
    RA.comprehension(
      [preLoadRecord.input.body, newNotificationRecord.input.body.documents],
      tuple,
      (preLoad, newNotification) => preLoad.sha256 === newNotification.digests.sha256
    ),
    RA.isNonEmpty
  );

export const makeNewNotificationResponse =
  (input: NewNotificationRequest) =>
  (notificationRequestId: string): NewNotificationResponse => ({
    idempotenceToken: input.idempotenceToken,
    paProtocolNumber: input.paProtocolNumber,
    notificationRequestId,
  });

// Send notification endpoint
//  expect a request that produces a 2xx as a response
//      the x-api-key header should be filled
export const satisfyIndependentChecks = (records: ReadonlyArray<NewNotificationRecord>) =>
  pipe(
    records,
    RA.some(
      pipe(
        existsApiKey,
        P.and(hasRecipientTaxId),
        P.and(hasRecipientDigitalDomicile),
        P.and(hasPhysicalAddress),
        P.and(hasRegisteredLetterAsPhysicalDocumentType),
        P.and(hasRecipientPaymentCreditorTaxId),
        P.and(hasRecipientPaymentNoticeCode),
        P.and(hasSuccessfulResponse)
      )
    )
  );

const satisfyCheckWithUploadToS3Record = (
  uploadToS3Record: UploadToS3Record,
  newNotificationRecord: NewNotificationRecord
): boolean =>
  uploadToS3Record.output.statusCode === 200 &&
  hasSameVersionToken(newNotificationRecord, uploadToS3Record) &&
  hasSameDocumentKey(newNotificationRecord, uploadToS3Record);

const satisfyCheckWithPreloadRecord = (
  preLoadRecord: PreLoadRecord,
  newNotificationRecord: NewNotificationRecord
): boolean =>
  preLoadRecord.output.statusCode === 200 &&
  hasSameContentType(newNotificationRecord, preLoadRecord) &&
  hasSameSha256(newNotificationRecord, preLoadRecord);

export const satisfyChecksDependentToPreviousRequests = (
  preLoadRecord: PreLoadRecord,
  uploadToS3Record: UploadToS3Record,
  newNotificationRecord: NewNotificationRecord
): boolean =>
  satisfyCheckWithUploadToS3Record(uploadToS3Record, newNotificationRecord) &&
  satisfyCheckWithPreloadRecord(preLoadRecord, newNotificationRecord);

export const makeNewNotificationRecord = (record: Omit<NewNotificationRecord, 'type'>): NewNotificationRecord => ({
  type: 'NewNotificationRecord',
  ...record,
});

export type NewNotificationRepository = Repository<NewNotificationRecord>;
