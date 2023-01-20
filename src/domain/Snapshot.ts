import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { isCheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from './ConsumeEventStreamRecord';
import { isNewNotificationRecord } from './NewNotificationRecord';
import { makeNotificationRequestFromCreate, NotificationRequest } from './NotificationRequest';
import { makeNotification, Notification } from './Notification';
import { DomainEnv } from './DomainEnv';
import { isGetNotificationDetailRecord } from './GetNotificationDetailRecord';

export type Snapshot = ReadonlyArray<E.Either<NotificationRequest, Notification>>;

// TODO: Use the State monad
export const computeSnapshot = (env: DomainEnv) =>
  pipe(
    R.Do,
    R.apS('notificationRequestRecords', RA.filterMap(isNewNotificationRecord)),
    R.apS('checkNotificationStatusRecords', RA.filterMap(isCheckNotificationStatusRecord)),
    R.apS('consumeEventStreamRecords', RA.filterMap(isConsumeEventStreamRecord)),
    R.apS('getNotificationDetailRecords', RA.filterMap(isGetNotificationDetailRecord)),
    R.map(
      ({
        notificationRequestRecords,
        checkNotificationStatusRecords,
        consumeEventStreamRecords,
        getNotificationDetailRecords,
      }) =>
        pipe(
          // create all the NotificationRequest
          notificationRequestRecords,
          RA.filterMap(makeNotificationRequestFromCreate),
          // for each one try to create a Notification
          RA.map((notificationRequest) =>
            pipe(
              notificationRequest,
              makeNotification(env)(checkNotificationStatusRecords)(consumeEventStreamRecords)(
                getNotificationDetailRecords
              ),
              E.fromOption(() => notificationRequest)
            )
          )
        )
    )
  );
