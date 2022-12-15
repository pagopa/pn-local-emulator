import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { CheckNotificationStatusRecord, isCheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { ConsumeEventStreamRecord, isConsumeEventStreamRecord } from './ConsumeEventStreamRecord';
import { isNewNotificationRecord, NewNotificationRecord } from './NewNotificationRecord';
import { makeNotificationRequestFromCreate, NotificationRequest } from './NotificationRequest';
import { makeNotification, Notification } from './Notification';
import { DomainEnv } from './DomainEnv';

export type Snapshot = ReadonlyArray<E.Either<NotificationRequest, Notification>>;

// TODO: Use the State monad
export const computeSnapshot =
  ({ occurrencesAfterComplete, senderPAId, iunGenerator, dateGenerator }: DomainEnv) =>
  (createNotificationRequestRecord: ReadonlyArray<NewNotificationRecord>) =>
  (findNotificationRequestRecord: ReadonlyArray<CheckNotificationStatusRecord>) =>
  (consumeEventStreamRecord: ReadonlyArray<ConsumeEventStreamRecord>): Snapshot =>
    pipe(
      // create all the NotificationRequest
      createNotificationRequestRecord,
      RA.filterMap(makeNotificationRequestFromCreate),
      // for each one try to create a Notification
      RA.map((notificationRequest) =>
        pipe(
          notificationRequest,
          makeNotification(
            occurrencesAfterComplete,
            senderPAId,
            iunGenerator(),
            dateGenerator()
          )(findNotificationRequestRecord)(consumeEventStreamRecord),
          E.fromOption(() => notificationRequest)
        )
      )
    );

export const computeSnapshotSlim = ({ occurrencesAfterComplete, senderPAId, iunGenerator, dateGenerator }: DomainEnv) =>
  pipe(
    R.Do,
    R.apS('newNotificationRecords', RA.filterMap(isNewNotificationRecord)),
    R.apS('checkNotificationStatusRecords', RA.filterMap(isCheckNotificationStatusRecord)),
    R.apS('consumeEventStreamRecords', RA.filterMap(isConsumeEventStreamRecord)),
    R.map(({ newNotificationRecords, checkNotificationStatusRecords, consumeEventStreamRecords }) =>
      pipe(
        // create all the NotificationRequest
        newNotificationRecords,
        // createNotificationRequestRecord,
        RA.filterMap(makeNotificationRequestFromCreate),
        // for each one try to create a Notification
        RA.map((notificationRequest) =>
          pipe(
            notificationRequest,
            makeNotification(
              occurrencesAfterComplete,
              senderPAId,
              iunGenerator(),
              dateGenerator()
            )(checkNotificationStatusRecords)(consumeEventStreamRecords),
            E.fromOption(() => notificationRequest)
          )
        )
      )
    )
  );
