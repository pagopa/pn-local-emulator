/* eslint-disable max-lines-per-function */

import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { FullSentNotificationV23 } from '../generated/pnapi/FullSentNotificationV23';
import { LegalFactCategoryEnum } from '../generated/pnapi/LegalFactCategory';
import { NotificationRecipient } from '../generated/pnapi/NotificationRecipient';
import { TimelineElementV23 } from '../generated/pnapi/TimelineElementV23';
import { NotificationStatusHistory } from '../generated/pnapi/NotificationStatusHistory';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { IUNGeneratorByIndex } from '../adapters/randexp/IUNGenerator';
import { TimelineElementCategoryV23Enum } from '../generated/pnapi/TimelineElementCategoryV23';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';
import { makeTimeLineListPEC_Array } from './TimelineElementCancelledNotificationTimelineEvents';

const makeTimelineListPEC =
  (env: DomainEnv) =>
  (notification: FullSentNotificationV23) =>
  (index: number, recipient: NotificationRecipient): ReadonlyArray<TimelineElementV23> =>
    notification.notificationStatus !== NotificationStatusEnum.CANCELLED ? 
    makeTimeLineListPEC_Array(env, notification, index, recipient) : 
    [...makeTimeLineListPEC_Array(env, notification, index, recipient),
      {
        elementId: `NOTIFICATION_CANCELLATION_REQUEST.IUN_${notification.iun}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV23Enum.NOTIFICATION_CANCELLATION_REQUEST,
        details: {
          cancellationRequestId: "90e3f130-cb23-4b6b-a0aa-858de7ffb3a0"
        }
      },
      {
        elementId: `NOTIFICATION_CANCELLED.IUN_${notification.iun}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV23Enum.NOTIFICATION_CANCELLED,
        details: {
          notificationCost: 100,
          notRefinedRecipientIndexes: [0]
        }
      }
    ];

export const makeTimelineList =
  (env: DomainEnv) =>
  (notification: FullSentNotificationV23): ReadonlyArray<TimelineElementV23> =>
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
        category: TimelineElementCategoryV23Enum.REQUEST_ACCEPTED,
      },
      ...pipe(notification.recipients, RA.chainWithIndex(makeTimelineListPEC(env)(notification))),
    ];

export const makeNotificationStatusHistory =
  (env: DomainEnv) =>
  (notificationStatus: NotificationStatusEnum, timeline: ReadonlyArray<TimelineElementV23>): NotificationStatusHistory =>
    [
      {
        status: notificationStatus,
        activeFrom: pipe(
          timeline,
          RA.head,
          O.fold(env.dateGenerator, ({ timestamp }) => timestamp || env.dateGenerator())
        ),
        relatedTimelineElements: pipe(
          timeline,
          RA.map(({ elementId }) => elementId || '')
        ),
      },
    ];

export const updateTimeline =
  (env: DomainEnv) =>
  (notification: Notification, newNotificationStatus: NotificationStatusEnum): Notification =>
    pipe(notification, makeTimelineList(env), (timelineList) => ({
      ...notification,
      notificationStatus: newNotificationStatus,
      notificationStatusHistory: makeNotificationStatusHistory(env)(newNotificationStatus, timelineList),
      timeline: timelineList,
    }));
