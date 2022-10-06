import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from './ConsumeEventStreamRecordRepository';
import { NewNotificationRecord } from './NewNotificationRepository';
import { makeNotificationRequestFromCreate, NotificationRequest } from './NotificationRequest';
import { makeNotification, Notification } from './Notification';

export type Snapshot = ReadonlyArray<E.Either<NotificationRequest, Notification>>;

// TODO: Use the State monad
export const computeSnapshot =
  (occurrencesAfterComplete: number, senderPaId: string, iunGenerator: () => string, dateGenerator: () => Date) =>
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
            senderPaId,
            iunGenerator(),
            dateGenerator()
          )(findNotificationRequestRecord)(consumeEventStreamRecord),
          E.fromOption(() => notificationRequest)
        )
      )
    );
