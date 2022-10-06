import { pipe, flow } from 'fp-ts/function';
import * as M from 'fp-ts/Monoid';
import * as n from 'fp-ts/number';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { FullSentNotification } from '../generated/definitions/FullSentNotification';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord, getProgressResponseList } from './ConsumeEventStreamRecordRepository';
import { makeNotificationRequestFromFind, NotificationRequest } from './NotificationRequest';
import { makeFullSentNotification } from './GetNotificationDetailRepository';

export type Notification = FullSentNotification & Pick<NotificationRequest, 'notificationRequestId'>;

const makeNotificationFromFind =
  (notificationRequest: NotificationRequest, sentAt: Date, senderPaId: string) =>
  (findNotificationRequestRecord: CheckNotificationStatusRecord): O.Option<Notification> =>
    pipe(
      findNotificationRequestRecord.output.statusCode === 200
        ? O.some(findNotificationRequestRecord.output.returned)
        : O.none,
      O.filter((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun)),
      O.map((iun) => ({
        ...notificationRequest,
        ...makeFullSentNotification(senderPaId)(sentAt)(notificationRequest)(iun),
      }))
    );

const makeNotificationFromConsume =
  (notificationRequest: NotificationRequest, sentAt: Date, senderPaId: string) =>
  (consumeEventStreamRecord: ConsumeEventStreamRecord): O.Option<Notification> =>
    pipe(
      getProgressResponseList([consumeEventStreamRecord]),
      RA.findLast((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun)),
      O.map((iun) => ({
        ...notificationRequest,
        ...makeFullSentNotification(senderPaId)(sentAt)(notificationRequest)(iun),
      }))
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
      // try to create notification from find records
      pipe(
        findNotificationRequestRecord,
        RA.findLastMap(makeNotificationFromFind(notificationRequest, sentAt, senderPaId))
      ),
      // try to create notification from create records
      O.alt(() =>
        pipe(
          consumeEventStreamRecord,
          RA.findLastMap(makeNotificationFromConsume(notificationRequest, sentAt, senderPaId))
        )
      ),
      // if none then create a new notification based on occurrences
      O.alt(() =>
        pipe(
          M.concatAll(n.MonoidSum)([
            pipe(findNotificationRequestRecord, countFromFind(notificationRequest.notificationRequestId)),
            pipe(consumeEventStreamRecord, countFromConsume(notificationRequest.notificationRequestId)),
          ]),
          (occurrences) =>
            occurrences >= occurrencesAfterComplete
              ? O.some({
                  ...notificationRequest,
                  ...makeFullSentNotification(senderPaId)(sentAt)(notificationRequest)(iun),
                })
              : O.none
        )
      )
    );
