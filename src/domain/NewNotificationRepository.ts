import * as O from 'fp-ts/Option';
// import * as RA from 'fp-ts/ReadonlyArray';
// import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { AllRecord, AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type Notification = NewNotificationRequest & NewNotificationResponse;

export type NewNotificationRecord = AuditRecord & {
  type: 'NewNotificationRecord';
  input: { apiKey: ApiKey; body: NewNotificationRequest };
  output: Response<202, NewNotificationResponse> | Response<403, UnauthorizedMessageBody>;
};

export const isNewNotificationRecord = (record: AllRecord): O.Option<NewNotificationRecord> =>
  record.type === 'NewNotificationRecord' ? O.some(record) : O.none;

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
