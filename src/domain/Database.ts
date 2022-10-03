/* eslint-disable @typescript-eslint/no-unused-vars */
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from './ConsumeEventStreamRecordRepository';
import { NewNotificationRecord } from './NewNotificationRepository';
import { makeNotificationRequestFromCreate, NotificationRequest } from './NotificationRequest';
import { makeNotification, Notification } from './Notification';

export type Database = ReadonlyArray<E.Either<NotificationRequest, Notification>>;

export const makeDatabase =
  (occurencesAfterComplete: number, iunGenerator: () => string) =>
  (createNotificationRequestRecord: ReadonlyArray<NewNotificationRecord>) =>
  (findNotificationRequestRecord: ReadonlyArray<CheckNotificationStatusRecord>) =>
  (consumeEventStreamRecord: ReadonlyArray<ConsumeEventStreamRecord>): Database =>
    pipe(
      // create all the NotificationRequest
      createNotificationRequestRecord,
      RA.filterMap(makeNotificationRequestFromCreate),
      // for each one try to create a Notification
      RA.map((notificationRequest) =>
        pipe(
          notificationRequest,
          makeNotification(occurencesAfterComplete, iunGenerator)(findNotificationRequestRecord)(
            consumeEventStreamRecord
          ),
          E.fromOption(() => notificationRequest)
        )
      )
    );
