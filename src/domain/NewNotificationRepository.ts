import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequest, PhysicalCommunicationTypeEnum } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { AllRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

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
    RA.every((recipient) =>
      pipe(
        recipient.payment,
        O.fromNullable,
        O.map((_) => _.creditorTaxId),
        O.isSome
      )
    )
  );

export const hasRecipientPaymentNoticeCode = (record: NewNotificationRecord) =>
  pipe(
    record.input.body.recipients,
    RA.every((recipient) =>
      pipe(
        recipient.payment,
        O.fromNullable,
        O.map((_) => _.noticeCode),
        O.isSome
      )
    )
  );

const getNotification = (record: NewNotificationRecord): O.Option<Notification> =>
  record.output.statusCode === 202 ? O.some({ ...record.input.body, ...record.output.returned }) : O.none;

export const getNotifications = RA.filterMap(getNotification);

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
