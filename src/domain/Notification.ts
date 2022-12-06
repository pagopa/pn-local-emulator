import { pipe, flow } from 'fp-ts/function';
import * as n from 'fp-ts/number';
import * as M from 'fp-ts/Monoid';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../generated/pnapi/IUN';
import { FullSentNotification } from '../generated/pnapi/FullSentNotification';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { ConsumeEventStreamRecord, getProgressResponseList } from './ConsumeEventStreamRecord';
import { makeNotificationRequestFromFind, NotificationRequest } from './NotificationRequest';
import { makeFullSentNotification } from './GetNotificationDetailRecord';

export type Notification = FullSentNotification & Pick<NotificationRequest, 'notificationRequestId'>;

const mkNotification = (notificationRequest: NotificationRequest, sentAt: Date, senderPaId: string, iun: IUN) => ({
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
      O.filterMap(({ iun }) => pipe(IUN.decode(iun), O.fromEither))
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
  (occurrencesAfterComplete: number, senderPaId: string, iun: IUN, sentAt: Date) =>
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
