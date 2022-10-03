import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { PaProtocolNumber } from '../generated/definitions/PaProtocolNumber';
import { IdempotenceToken } from '../generated/definitions/IdempotenceToken';
import { NotificationRequestId } from '../generated/definitions/NotificationRequestId';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord';
  input:
    | { paProtocolNumber: PaProtocolNumber; idempotenceToken?: IdempotenceToken }
    | { notificationRequestId: NotificationRequestId };
  output: Response<200, NewNotificationRequestStatusResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type CheckNotificationStatusRecordRepository = Repository<CheckNotificationStatusRecord>;
