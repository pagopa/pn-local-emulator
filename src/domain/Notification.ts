import { pipe, flow } from 'fp-ts/lib/function';
import * as M from 'fp-ts/Monoid';
import * as n from 'fp-ts/number';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord, getProgressResponseList } from './ConsumeEventStreamRecordRepository';
import { makeNotificationRequestFromFind, NotificationRequest } from './NotificationRequest';

// TODO: Use generated model of FullNotification
export type Notification = NotificationRequest & Required<Pick<NewNotificationRequestStatusResponse, 'iun'>>;

const makeNotificationFromFind =
  (notificationRequest: NotificationRequest) =>
  (findNotificationRequestRecord: CheckNotificationStatusRecord): O.Option<Notification> =>
    pipe(
      findNotificationRequestRecord.output.statusCode === 200
        ? O.some(findNotificationRequestRecord.output.returned)
        : O.none,
      O.filter((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun)),
      O.map((iun) => ({ ...notificationRequest, iun }))
    );

const makeNotificationFromConsume =
  (notificationRequest: NotificationRequest) =>
  (consumeEventStreamRecord: ConsumeEventStreamRecord): O.Option<Notification> =>
    pipe(
      getProgressResponseList([consumeEventStreamRecord]),
      RA.findLast((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun)),
      O.map((iun) => ({ ...notificationRequest, iun }))
    );

const countFromFind = (notificationRequestId: string) =>
  flow(
    RA.filterMap(makeNotificationRequestFromFind),
    RA.filter((e) => e.notificationRequestId === notificationRequestId),
    RA.size
  );

const countFromConsume = (notificationRequestId: string) =>
  flow(
    getProgressResponseList,
    RA.filter((e) => e.notificationRequestId === notificationRequestId),
    RA.size
  );

/**
 * Compose a NotificationRequest starting from a list of records
 */
export const makeNotification =
  (occurencesAfterComplete: number, iunGenerator: () => string) =>
  (findNotificationRequestRecord: ReadonlyArray<CheckNotificationStatusRecord>) =>
  (consumeEventStreamRecord: ReadonlyArray<ConsumeEventStreamRecord>) =>
  (notificationRequest: NotificationRequest): O.Option<Notification> =>
    pipe(
      // try to create notification from find records
      pipe(findNotificationRequestRecord, RA.findLastMap(makeNotificationFromFind(notificationRequest))),
      // try to create notification from create records
      O.alt(() => pipe(consumeEventStreamRecord, RA.findLastMap(makeNotificationFromConsume(notificationRequest)))),
      // if none then create a new notification based on occurrences
      O.alt(() =>
        pipe(
          M.concatAll(n.MonoidSum)([
            pipe(findNotificationRequestRecord, countFromFind(notificationRequest.notificationRequestId)),
            pipe(consumeEventStreamRecord, countFromConsume(notificationRequest.notificationRequestId)),
          ]),
          (occurences) =>
            occurences >= occurencesAfterComplete ? O.some({ ...notificationRequest, iun: iunGenerator() }) : O.none
        )
      )
    );
