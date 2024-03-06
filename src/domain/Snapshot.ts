import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRequestV23 } from '../generated/pnapi/NewNotificationRequestV23';
import { isCheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from './ConsumeEventStreamRecord';
import { DomainEnv } from './DomainEnv';
import { isGetNotificationDetailRecord } from './GetNotificationDetailRecord';
import { isNewNotificationRecord } from './NewNotificationRecord';
import { makeNotification, Notification } from './Notification';
import { makeNotificationRequestFromCreate } from './NotificationRequest';
import { Record } from './Repository';

export type Snapshot = ReadonlyArray<E.Either<NewNotificationRequestV23, Notification>>;

export const computeSnapshot = (env: DomainEnv): R.Reader<ReadonlyArray<Record>, Snapshot> =>
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
