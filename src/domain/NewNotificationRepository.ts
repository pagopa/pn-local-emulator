import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as P from 'fp-ts/Predicate';
import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequest, PhysicalCommunicationTypeEnum } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { AllRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import {
  existsUploadToS3RecordWithSameDocumentKey,
  existsUploadToS3RecordWithSameVersionToken,
  UploadToS3Record,
} from './UploadToS3RecordRepository';
import {
  existsPreLoadRecordWithSameSha256,
  PreLoadRecord,
  hasSuccessfulResponse as hasPreLoadSuccessfulResponse,
} from './PreLoadRepository';

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

export const hasSameSha256UsedInPreLoadRecordRequest =
  (preLoadRecords: ReadonlyArray<PreLoadRecord>) =>
  (newNotificationRecord: NewNotificationRecord): boolean =>
    pipe(
      newNotificationRecord.input.body.documents,
      RA.every(({ digests }) =>
        pipe(
          preLoadRecords,
          RA.some(pipe(hasPreLoadSuccessfulResponse, P.and(existsPreLoadRecordWithSameSha256(digests.sha256))))
        )
      )
    );

export const hasSameDocumentReferenceOfUploadToS3Record =
  (uploadToS3Records: ReadonlyArray<UploadToS3Record>) =>
  (newNotificationRecord: NewNotificationRecord): boolean =>
    pipe(
      newNotificationRecord.input.body.documents,
      RA.every(({ ref }) =>
        pipe(
          uploadToS3Records,
          RA.some(
            pipe(
              existsUploadToS3RecordWithSameVersionToken(ref.versionToken),
              P.and(existsUploadToS3RecordWithSameDocumentKey(ref.key))
            )
          )
        )
      )
    );

export const hasSamePaymentDocumentReferenceOfUploadToS3Record =
  (uploadToS3Records: ReadonlyArray<UploadToS3Record>) =>
  (newNotificationRecord: NewNotificationRecord): boolean =>
    pipe(
      newNotificationRecord.input.body.recipients,
      RA.every(({ payment }) =>
        pipe(
          uploadToS3Records,
          RA.some(
            pipe(
              existsUploadToS3RecordWithSameVersionToken(payment?.pagoPaForm?.ref.versionToken),
              P.and(existsUploadToS3RecordWithSameDocumentKey(payment?.pagoPaForm?.ref.key))
            )
          )
        )
      )
    );

export const hasSamePaymentDocumentSha256UsedInPreLoadRecordRequest =
  (preLoadRecords: ReadonlyArray<PreLoadRecord>) =>
  (newNotificationRecord: NewNotificationRecord): boolean =>
    pipe(
      newNotificationRecord.input.body.recipients,
      RA.every(({ payment }) =>
        pipe(preLoadRecords, RA.some(existsPreLoadRecordWithSameSha256(payment?.pagoPaForm?.digests.sha256)))
      )
    );

export const makeNewNotificationResponse =
  (input: NewNotificationRequest) =>
  (notificationRequestId: string): NewNotificationResponse => ({
    idempotenceToken: input.idempotenceToken,
    paProtocolNumber: input.paProtocolNumber,
    notificationRequestId,
  });

export const makeNewNotificationRecord = (record: Omit<NewNotificationRecord, 'type'>): NewNotificationRecord => ({
  type: 'NewNotificationRecord',
  ...record,
});

export type NewNotificationRepository = Repository<NewNotificationRecord>;
