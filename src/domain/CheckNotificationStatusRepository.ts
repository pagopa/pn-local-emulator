import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { PaProtocolNumber } from '../generated/definitions/PaProtocolNumber';
import { IdempotenceToken } from '../generated/definitions/IdempotenceToken';
import { NotificationRequestId } from '../generated/definitions/NotificationRequestId';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { NewNotificationRecord } from './NewNotificationRepository';

export type CheckNotificationStatusRecord = {
  type: 'CheckNotificationStatusRecord';
  input:
    | { paProtocolNumber: PaProtocolNumber; idempotenceToken?: IdempotenceToken }
    | { notificationRequestId: NotificationRequestId };
  output: Response<200, NewNotificationRequestStatusResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

const WAITING = 'WAITING';

export const makeNewNotificationRequestStatusResponse = (
  minNumberOfWaitingBeforeDelivering: number,
  notification: NewNotificationRecord,
  checkNotificationStatusRecordList: ReadonlyArray<CheckNotificationStatusRecord>,
  iunGenerator: () => string
): O.Option<NewNotificationRequestStatusResponse> =>
  pipe(
    notification.output.statusCode === 202
      ? O.some({ ...notification.input.body, ...notification.output.returned })
      : O.none,
    O.map((notification) =>
      pipe(
        // find all records that match the given notification
        checkNotificationStatusRecordList,
        RA.filterMap(({ output }) => (output.statusCode === 200 ? O.some(output.returned) : O.none)),
        RA.filter(({ notificationRequestId: id }) => id === notification.notificationRequestId),
        (list) =>
          pipe(
            list,
            // if a non pending element exists then return it
            RA.findLast(({ notificationRequestStatus }) => notificationRequestStatus !== WAITING),
            // if doesn't exist
            O.getOrElse(() => {
              const response = {
                ...notification,
                notificationRequestStatus: WAITING,
              };
              const completed = { ...response, notificationRequestStatus: 'ACCEPTED', iun: iunGenerator() };
              // if the resource was requested more times
              // than the threshold then return it as completed
              return list.length >= minNumberOfWaitingBeforeDelivering ? completed : response;
            })
          )
      )
    )
  );

export type CheckNotificationStatusRecordRepository = Repository<CheckNotificationStatusRecord>;
