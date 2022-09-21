import * as O from 'fp-ts/Option';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { PaProtocolNumber } from '../generated/definitions/PaProtocolNumber';
import { IdempotenceToken } from '../generated/definitions/IdempotenceToken';
import { NotificationRequestId } from '../generated/definitions/NotificationRequestId';
import { Repository } from './Repository';
import { Response } from './types';
import { NewNotificationRecord } from './NewNotificationRepository';

export type CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord';
  input:
    | { paProtocolNumber: PaProtocolNumber; idempotenceToken?: IdempotenceToken }
    | { notificationRequestId: NotificationRequestId };
  output: Response<200, NewNotificationRequestStatusResponse> | Response<401> | Response<404>;
};

export const makeNewNotificationRequestStatusResponse = (
  record: NewNotificationRecord
): O.Option<NewNotificationRequestStatusResponse> => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (record.output.statusCode) {
    case 202:
      return O.some({
        ...record.output.returned,
        ...record.input.body,
        notificationRequestStatus: '__WAITING__',
      });
    default:
      return O.none;
  }
};

export type CheckNotificationStatusRecordRepository = Repository<CheckNotificationStatusRecord>;
