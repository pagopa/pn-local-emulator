/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */

import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { FullSentNotificationV27 } from '../generated/pnapi/FullSentNotificationV27';
import { LegalFactCategoryEnum } from '../generated/pnapi/LegalFactCategory';
import { NotificationRecipientV24 } from '../generated/pnapi/NotificationRecipientV24';
import { TimelineElementV27 } from '../generated/pnapi/TimelineElementV27';
import { NotificationStatusHistory } from '../generated/pnapi/NotificationStatusHistory';
import { NotificationStatusV26Enum } from '../generated/pnapi/NotificationStatusV26';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { IUNGeneratorByIndex } from '../adapters/randexp/IUNGenerator';
import { TimelineElementCategoryV27Enum } from '../generated/pnapi/TimelineElementCategoryV27';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';
import { makeTimeLineListPEC_Array } from './TimelineElementCancelledNotificationTimelineEvents';

// --- Helpers to adapt older timeline items (V23) to V27 shape/enums ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toV27 = (e: any): TimelineElementV27 => ({
  elementId: e?.elementId,
  timestamp: e?.timestamp,
  ingestionTimestamp: e?.ingestionTimestamp,
  eventTimestamp: e?.eventTimestamp,
  notificationSentAt: e?.notificationSentAt,
  legalFactsIds: e?.legalFactsIds,
  category: (e?.category as unknown) as TimelineElementCategoryV27Enum,
  details: e?.details,
});

const makeTimelineListPEC =
  (env: DomainEnv) =>
  (notification: FullSentNotificationV27) =>
  (index: number, recipient: NotificationRecipientV24): ReadonlyArray<TimelineElementV27> => {
    const base: ReadonlyArray<any> = makeTimeLineListPEC_Array(env as any, notification as any, index, recipient as any);
    const mapped = base.map(toV27);
    if (notification.notificationStatus !== NotificationStatusV26Enum.CANCELLED) {
      return mapped;
    }
    return [
      ...mapped,
      {
        elementId: `NOTIFICATION_CANCELLATION_REQUEST.IUN_${notification.iun}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV27Enum.NOTIFICATION_CANCELLATION_REQUEST,
        details: {
          cancellationRequestId: '90e3f130-cb23-4b6b-a0aa-858de7ffb3a0',
        },
      },
      {
        elementId: `NOTIFICATION_CANCELLED.IUN_${notification.iun}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV27Enum.NOTIFICATION_CANCELLED,
        details: {
          notificationCost: 100,
          notRefinedRecipientIndexes: [0],
        },
      },
    ];
  };

export const makeTimelineList =
  (env: DomainEnv) =>
  (notification: FullSentNotificationV27): ReadonlyArray<TimelineElementV27> =>
    [
      {
        elementId: `${notification.iun}_request_accepted`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: `safestorage://PN_LEGAL_FACTS-0002-${IUNGeneratorByIndex(notification.iun, 0)}`,
            category: LegalFactCategoryEnum.SENDER_ACK,
          },
        ],
        category: TimelineElementCategoryV27Enum.REQUEST_ACCEPTED,
      },
      ...pipe(notification.recipients, RA.chainWithIndex(makeTimelineListPEC(env)(notification))),
    ];

const toStatusEnum = (s: NotificationStatusV26Enum): NotificationStatusEnum =>
  (s as unknown) as NotificationStatusEnum;

export const makeNotificationStatusHistory =
  (env: DomainEnv) =>
  (notificationStatus: NotificationStatusV26Enum, timeline: ReadonlyArray<TimelineElementV27>): NotificationStatusHistory =>
    [
      {
        status: toStatusEnum(notificationStatus),
        activeFrom: pipe(
          timeline,
          RA.head,
          O.fold(env.dateGenerator, ({ timestamp }) => timestamp || env.dateGenerator())
        ),
        relatedTimelineElements: pipe(timeline, RA.map(({ elementId }) => elementId || '')),
      },
    ] as unknown as NotificationStatusHistory;

export const updateTimeline =
  (env: DomainEnv) =>
  (notification: Notification, newNotificationStatus: NotificationStatusV26Enum): Notification =>
    pipe(notification, makeTimelineList(env), (timelineList) => ({
      ...notification,
      notificationStatus: newNotificationStatus,
      notificationStatusHistory: makeNotificationStatusHistory(env)(newNotificationStatus, timelineList) as unknown as Notification['notificationStatusHistory'],
      timeline: timelineList,
    }));
