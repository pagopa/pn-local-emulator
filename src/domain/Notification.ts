/* eslint-disable functional/immutable-data */
/* eslint-disable sonarjs/cognitive-complexity */

import * as M from 'fp-ts/Monoid';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { flow, pipe } from 'fp-ts/function';
import * as n from 'fp-ts/number';
import * as s from 'fp-ts/string';
import { FullSentNotificationV27 } from '../generated/pnapi/FullSentNotificationV27';
import { IUN } from '../generated/pnapi/IUN';
import { NotificationStatusV26Enum } from '../generated/pnapi/NotificationStatusV26';
import { TimelineElementCategoryV27Enum } from '../generated/pnapi/TimelineElementCategoryV27';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { ConsumeEventStreamRecord, getProgressResponse, getProgressResponseList } from './ConsumeEventStreamRecord';
import { DomainEnv } from './DomainEnv';
import {
  GetNotificationDetailRecord,
  isGetNotificationDetailRecord,
  makeFullSentNotification,
} from './GetNotificationDetailRecord';
import { NotificationRequest, makeNotificationRequestFromFind } from './NotificationRequest';
import { updateTimeline } from './TimelineElement';
import { Response } from './types';

export type Notification = FullSentNotificationV27 & Pick<NotificationRequest, 'notificationRequestId'>;

export const mkNotification = (env: DomainEnv, notificationRequest: NotificationRequest, iun: IUN): Notification => ({
  notificationRequestId: notificationRequest.notificationRequestId,
  ...makeFullSentNotification(env)(notificationRequest)(iun),
});

/** ---------- IUN helpers ---------- */
const getIunFromFind =
  (notificationRequest: NotificationRequest) => (findRecord: CheckNotificationStatusRecord) =>
    pipe(
      findRecord.output.statusCode === 200 ? O.some(findRecord.output.returned) : O.none,
      O.filter((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap((e) => O.fromNullable(e.iun))
    );

const getIunFromConsume =
  (notificationRequest: NotificationRequest) => (consumeRecord: ConsumeEventStreamRecord) =>
    pipe(
      getProgressResponseList([consumeRecord]),
      RA.findLast((e) => e.notificationRequestId === notificationRequest.notificationRequestId),
      O.filterMap(({ iun }) => pipe(IUN.decode(iun), O.fromEither))
    );

/** ---------- Counters ---------- */
const countFromFind = (notificationRequestId: string) =>
  flow(
    RA.filterMap(makeNotificationRequestFromFind),
    RA.filter((e) => e.notificationRequestId === notificationRequestId),
    RA.size
  );

const countFromConsume = (notificationRequestId: string) =>
  flow(
    RA.filterMap(getProgressResponse),
    RA.map(
      flow(
        RA.filterMap((e) => O.fromNullable(e.notificationRequestId)),
        RA.uniq(s.Eq)
      )
    ),
    RA.flatten,
    RA.filter((nrId) => nrId === notificationRequestId),
    RA.size
  );

const countFromDetail = (iun: IUN) =>
  flow(
    RA.filterMap(isGetNotificationDetailRecord),
    RA.filterMap(({ output }) => (output.statusCode === 200 ? O.some(output) : O.none)),
    RA.filter(({ returned }) => returned.iun === iun),
    RA.size
  );

/** ---------- Status from occurrences ---------- */
const makeStatus = (env: DomainEnv, occurrences: number): O.Option<NotificationStatusV26Enum> =>
  env.occurrencesToDelivering <= occurrences && occurrences < env.occurrencesToDelivered
    ? O.some(NotificationStatusV26Enum.DELIVERING)
    : env.occurrencesToDelivered <= occurrences && occurrences < env.occurrencesToViewed
    ? O.some(NotificationStatusV26Enum.DELIVERED)
    : env.occurrencesToViewed <= occurrences
    ? O.some(NotificationStatusV26Enum.VIEWED)
    : O.none;

/** ---------- Detail helpers & type guard ---------- */
type OkDetail = { output: Response<200, FullSentNotificationV27> };

const isOkDetailForIun =
  (iun: IUN) =>
  (r: GetNotificationDetailRecord): r is GetNotificationDetailRecord & OkDetail =>
    r.input.iun === iun && r.output.statusCode === 200;

const latestDetailStatusForIun = (
  records: ReadonlyArray<GetNotificationDetailRecord>,
  iun: IUN
): O.Option<NotificationStatusV26Enum> =>
  pipe(
    records,
    RA.findLast(isOkDetailForIun(iun)),
    O.map((r) => r.output.returned.notificationStatus),
    O.filter((s): s is NotificationStatusV26Enum => s !== undefined)
  );

/**
 * Compose a NotificationRequest starting from a list of records
 */
export const makeNotification =
  (env: DomainEnv) =>
  (findRecords: ReadonlyArray<CheckNotificationStatusRecord>) =>
  (consumeRecords: ReadonlyArray<ConsumeEventStreamRecord>) =>
  (detailRecords: ReadonlyArray<GetNotificationDetailRecord>) =>
  (notificationRequest: NotificationRequest): O.Option<Notification> =>
    pipe(
      // 1) IUN da find
      pipe(findRecords, RA.findLastMap(getIunFromFind(notificationRequest))),
      // 2) IUN da consume
      O.alt(() => pipe(consumeRecords, RA.findLastMap(getIunFromConsume(notificationRequest)))),
      // 3) se ho IUN → notifica
      O.map((iun) => mkNotification(env, notificationRequest, iun)),
      // 4) altrimenti crea notifica su base occurrences
      O.alt(() =>
        pipe(
          M.concatAll(n.MonoidSum)([
            pipe(findRecords, countFromFind(notificationRequest.notificationRequestId)),
            pipe(consumeRecords, countFromConsume(notificationRequest.notificationRequestId)),
          ]),
          (occ) =>
            occ >= env.occurrencesToAccepted
              ? O.some(mkNotification(env, notificationRequest, env.iunGenerator()))
              : O.none
        )
      ),
      // 5) aggiorna stato finale — evitando Option<void>
      O.map((notification) => {
        const occurrences = M.concatAll(n.MonoidSum)([
          pipe(findRecords, countFromFind(notificationRequest.notificationRequestId)),
          pipe(consumeRecords, countFromConsume(notificationRequest.notificationRequestId)),
          pipe(detailRecords, countFromDetail(notification.iun)),
        ]);

        // CANCELLED da detail (per lo stesso IUN) ha priorità
        const isCancelled = pipe(
          latestDetailStatusForIun(detailRecords, notification.iun),
          O.exists((st) => st === NotificationStatusV26Enum.CANCELLED)
        );

        if (isCancelled) {
          notification.notificationStatus = NotificationStatusV26Enum.CANCELLED;
          notification.cancelledIun = notification.iun;
          notification.timeline = [
            ...notification.timeline,
            {
              elementId: `NOTIFICATION_CANCELLATION_REQUEST.IUN_${notification.iun}`,
              timestamp: env.dateGenerator(),
              legalFactsIds: [],
              category: TimelineElementCategoryV27Enum.NOTIFICATION_CANCELLATION_REQUEST,
              details: { cancellationRequestId: '90e3f130-cb23-4b6b-a0aa-858de7ffb3a0' },
            },
            {
              elementId: `NOTIFICATION_CANCELLED.IUN_${notification.iun}`,
              timestamp: env.dateGenerator(),
              legalFactsIds: [],
              category: TimelineElementCategoryV27Enum.NOTIFICATION_CANCELLED,
              details: { notificationCost: 100, notRefinedRecipientIndexes: [0] },
            },
          ];
          notification.notificationStatusHistory = [
            ...notification.notificationStatusHistory,
            {
              status: NotificationStatusV26Enum.CANCELLED,
              activeFrom: env.dateGenerator(),
              relatedTimelineElements: [`NOTIFICATION_CANCELLED.IUN_${notification.iun}`],
            },
          ];
        }

        const maybeStatus = makeStatus(env, occurrences);

        // Applica side-effect e ritorna SEMPRE notification
        return pipe(
          maybeStatus,
          O.match(
            () => {
              if (isCancelled) {
                updateTimeline(env)(notification, NotificationStatusV26Enum.CANCELLED);
              }
              return notification;
            },
            (st) => {
              const finalSt = isCancelled ? NotificationStatusV26Enum.CANCELLED : st;
              updateTimeline(env)(notification, finalSt);
              return notification;
            }
          )
        );
      })
    );
