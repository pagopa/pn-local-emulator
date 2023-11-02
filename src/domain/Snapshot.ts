import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { NewNotificationRequestV21 } from '../generated/pnapi/NewNotificationRequestV21';
import { isCheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from './ConsumeEventStreamRecord';
import { isNewNotificationRecord } from './NewNotificationRecord';
import { makeNotificationRequestFromCreate } from './NotificationRequest';
import { makeNotification, Notification } from './Notification';
import { DomainEnv } from './DomainEnv';
import { isGetNotificationDetailRecord } from './GetNotificationDetailRecord';
import { Record } from './Repository';
import { traceWithValue } from 'fp-ts-std/Debug';

export type Snapshot = ReadonlyArray<E.Either<NewNotificationRequestV21, Notification>>;

export const computeSnapshot = (env: DomainEnv): R.Reader<ReadonlyArray<Record>, Snapshot> =>
  pipe(
    R.Do,
    traceWithValue('Debug #1 - Snapshot: '),
    R.apS('notificationRequestRecords', RA.filterMap(isNewNotificationRecord)),
    traceWithValue('Debug #2 - Snapshot: '),
    R.apS('checkNotificationStatusRecords', RA.filterMap(isCheckNotificationStatusRecord)),
    traceWithValue('Debug #3 - Snapshot: '),
    R.apS('consumeEventStreamRecords', RA.filterMap(isConsumeEventStreamRecord)),
    traceWithValue('Debug #4 - Snapshot: '),
    R.apS('getNotificationDetailRecords', RA.filterMap(isGetNotificationDetailRecord)),
    traceWithValue('Debug #5 - Snapshot: '),
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
          traceWithValue('Debug #6 - Snapshot: '),
          RA.filterMap(makeNotificationRequestFromCreate),
          // for each one try to create a Notification
          RA.map((notificationRequest) =>
            pipe(
              notificationRequest,
              traceWithValue('Debug #7 - Snapshot: '),
              makeNotification(env)(checkNotificationStatusRecords)(consumeEventStreamRecords)(
                getNotificationDetailRecords
              ),
              traceWithValue('Debug #8 - Snapshot: '),
              E.fromOption(() => notificationRequest)
            )
          )
        )
    )
  );
