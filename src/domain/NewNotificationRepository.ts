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

export const matchNewNotificationRecordCriteria = pipe(
  existsApiKey,
  P.and(hasRecipientTaxId),
  P.and(hasRecipientDigitalDomicile),
  P.and(hasPhysicalAddress),
  P.and(hasRegisteredLetterAsPhysicalDocumentType),
  P.and(hasRecipientPaymentCreditorTaxId),
  P.and(hasRecipientPaymentNoticeCode),
  P.and(hasSuccessfulResponse)
);

export const matchAgainstPreLoadRecordList =
  (preLoadRecords: ReadonlyArray<PreLoadRecord>) =>
  (newNotificationRecord: NewNotificationRecord): boolean =>
    pipe(
      preLoadRecords,
      RA.some(
        (record) =>
          record.output.statusCode === 200 &&
          hasSameContentType(newNotificationRecord, record) &&
          hasSameSha256(newNotificationRecord, record)
      )
    );

export const matchAgainstUploadToS3RecordList =
  (uploadToS3Records: ReadonlyArray<UploadToS3Record>) =>
  (newNotificationRecord: NewNotificationRecord): boolean =>
    pipe(
      uploadToS3Records,
      RA.some(
        (record) =>
          hasSameVersionToken(newNotificationRecord, record) && hasSameDocumentKey(newNotificationRecord, record)
      )
    );

export const makeNewNotificationRecord = (record: Omit<NewNotificationRecord, 'type'>): NewNotificationRecord => ({
  type: 'NewNotificationRecord',
  ...record,
});

export type NewNotificationRepository = Repository<NewNotificationRecord>;
