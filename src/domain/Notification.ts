import { pipe, flow } from 'fp-ts/function';
import * as n from 'fp-ts/number';
import * as M from 'fp-ts/Monoid';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { Iun } from '../generated/definitions/Iun';
import { FullSentNotification } from '../generated/definitions/FullSentNotification';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord, getProgressResponseList } from './ConsumeEventStreamRecordRepository';
import { makeNotificationRequestFromFind, NotificationRequest } from './NotificationRequest';
import { makeFullSentNotification } from './GetNotificationDetailRepository';

export type Notification = FullSentNotification & Pick<NotificationRequest, 'notificationRequestId'>;

const mkNotification = (notificationRequest: NotificationRequest, sentAt: Date, senderPaId: string, iun: Iun) => ({
  ...notificationRequest,
  ...makeFullSentNotification(senderPaId)(sentAt)(notificationRequest)(iun),
});

const getIunFromFind =
  (notificationRequest: NotificationRequest) => (findNotificationRequestRecord: CheckNotificationStatusRecord) =>
    pipe(
      findNotificationRequestRecord.output.statusCode === 200
        ? O.some(findNotificationRequestRecord.output.returned)
        : O.none,
      O.filter((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun))
    );

const getIunFromConsume =
  (notificationRequest: NotificationRequest) => (consumeEventStreamRecord: ConsumeEventStreamRecord) =>
    pipe(
      getProgressResponseList([consumeEventStreamRecord]),
      RA.findLast((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun))
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
  (occurrencesAfterComplete: number, senderPaId: string, iun: string, sentAt: Date) =>
  (findNotificationRequestRecord: ReadonlyArray<CheckNotificationStatusRecord>) =>
  (consumeEventStreamRecord: ReadonlyArray<ConsumeEventStreamRecord>) =>
  (notificationRequest: NotificationRequest): O.Option<Notification> =>
    pipe(
      // get iun from find records
      pipe(findNotificationRequestRecord, RA.findLastMap(getIunFromFind(notificationRequest))),
      // get iun from consume records
      O.alt(() => pipe(consumeEventStreamRecord, RA.findLastMap(getIunFromConsume(notificationRequest)))),
      // create Notification from iun if any
      O.map((iun) => mkNotification(notificationRequest, sentAt, senderPaId, iun)),
      // try to create notification from find records
      // if no iun was found then create a new notification based on occurrences counter
      O.alt(() =>
        pipe(
          M.concatAll(n.MonoidSum)([
            pipe(findNotificationRequestRecord, countFromFind(notificationRequest.notificationRequestId)),
            pipe(consumeEventStreamRecord, countFromConsume(notificationRequest.notificationRequestId)),
          ]),
          (occurrences) =>
            occurrences >= occurrencesAfterComplete
              ? O.some(mkNotification(notificationRequest, sentAt, senderPaId, iun))
              : O.none
        )
      )
    );
