import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type NewNotificationRecord = {
  type: 'NewNotificationRecord';
  input: { apiKey: ApiKey; body: NewNotificationRequest };
  output: Response<202, NewNotificationResponse> | Response<403, UnauthorizedMessageBody>;
};

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
