import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { PaProtocolNumber } from '../generated/definitions/PaProtocolNumber';
import { IdempotenceToken } from '../generated/definitions/IdempotenceToken';
import { NotificationRequestId } from '../generated/definitions/NotificationRequestId';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { Notification } from './NewNotificationRepository';

export type CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord';
  input:
    | { paProtocolNumber: PaProtocolNumber; idempotenceToken?: IdempotenceToken }
    | { notificationRequestId: NotificationRequestId };
  output: Response<200, NewNotificationRequestStatusResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

const getNewNotificationRequestStatusResponse = (
  record: CheckNotificationStatusRecord
): O.Option<NewNotificationRequestStatusResponse> =>
  record.output.statusCode === 200 ? O.some(record.output.returned) : O.none;

export const getNotificationStatusList = RA.filterMap(getNewNotificationRequestStatusResponse);

const WAITING = 'WAITING';

export const makeNewNotificationRequestStatusResponse =
  (minNumberOfWaitingBeforeDelivering: number, iunGenerator: () => string) =>
  (responseList: ReadonlyArray<NewNotificationRequestStatusResponse>) =>
  (notification: Notification): NewNotificationRequestStatusResponse =>
    pipe(
      responseList,
      // find all responses that match the given notification
      RA.filter(({ notificationRequestId: id }) => id === notification.notificationRequestId),
      (list) =>
        pipe(
          list,
          // if a non pending response already exists then return it
          RA.findLast(({ notificationRequestStatus }) => notificationRequestStatus !== WAITING),
          // otherwise create a new response
          O.getOrElse(() => ({ ...notification, notificationRequestStatus: WAITING })),
          (response) =>
            // if the resource was requested more times
            // than the threshold then return it as completed
            list.length >= minNumberOfWaitingBeforeDelivering
              ? { ...response, notificationRequestStatus: 'ACCEPTED', iun: iunGenerator() }
              : response
        )
    );

export type CheckNotificationStatusRecordRepository = Repository<CheckNotificationStatusRecord>;
