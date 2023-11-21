import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { DigitalAddressSourceEnum } from '../generated/pnapi/DigitalAddressSource';
import { FullSentNotificationV21 } from '../generated/pnapi/FullSentNotificationV21';
import { IUN } from '../generated/pnapi/IUN';
import { LegalFactCategoryEnum } from '../generated/pnapi/LegalFactCategory';
import { NotificationRecipient } from '../generated/pnapi/NotificationRecipient';
import { TimelineElementV20 } from '../generated/pnapi/TimelineElementV20';
import { NotificationStatusHistory } from '../generated/pnapi/NotificationStatusHistory';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { IUNGeneratorByIndex } from '../adapters/randexp/IUNGenerator';
import { TimelineElementCategoryV20Enum } from '../generated/pnapi/TimelineElementCategoryV20';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';

const makeTimelineListPEC =
  (env: DomainEnv) =>
  (iun: IUN) =>
  (index: number, recipient: NotificationRecipient): ReadonlyArray<TimelineElementV20> =>
    [
      {
        elementId: `${iun}_aar_gen_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV20Enum.AAR_GENERATION,
        details: {
          recIndex: index,
          numberOfPages: 1,
          generatedAarUrl: `safestorage://PN_AAR-0002-${env.iunGenerator()}`,
        },
      },
      {
        elementId: `${iun}_get_address_${index}_source_PLATFORM_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV20Enum.GET_ADDRESS,
        details: {
          recIndex: index,
          digitalAddressSource: DigitalAddressSourceEnum.PLATFORM,
          isAvailable: false,
          attemptDate: env.dateGenerator(),
        },
      },
      {
        elementId: `${iun}_get_address_${index}_source_SPECIAL_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV20Enum.GET_ADDRESS,
        details: {
          recIndex: index,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          isAvailable: true,
          attemptDate: env.dateGenerator(),
        },
      },
      {
        elementId: `${iun}_send_digital_domicile_${index}_source_SPECIAL_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV20Enum.SEND_DIGITAL_DOMICILE,
        details: {
          recIndex: index,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          retryNumber: 0,
        },
      },
      {
        elementId: `${iun}_digital_delivering_progress_${index}_source_SPECIAL_attempt_0_progidx_1`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: `safestorage://PN_NOTIFICATION_ATTACHMENTS-${IUNGeneratorByIndex(iun, 1)}`,
            category: LegalFactCategoryEnum.PEC_RECEIPT,
          },
        ],
        category: TimelineElementCategoryV20Enum.SEND_DIGITAL_PROGRESS,
        details: {
          recIndex: index,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          retryNumber: 0,
          notificationDate: env.dateGenerator(),
          sendingReceipts: [{}],
          shouldRetry: false,
        },
      },
      {
        elementId: `${iun}_send_digital_feedback_${index}_source_SPECIAL_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: `safestorage://PN_LEGAL_FACTS-0002-${IUNGeneratorByIndex(iun, 2)}`,
            category: LegalFactCategoryEnum.PEC_RECEIPT,
          },
        ],
        category: TimelineElementCategoryV20Enum.SEND_DIGITAL_FEEDBACK,
        details: {
          recIndex: index,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          // responseStatus: ResponseStatusEnum.OK,
          notificationDate: env.dateGenerator(),
          sendingReceipts: [{}],
        },
      },
      {
        elementId: `${iun}_digital_success_workflow_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: `safestorage://PN_LEGAL_FACTS-0001-${IUNGeneratorByIndex(iun, 3)}`,
            category: LegalFactCategoryEnum.DIGITAL_DELIVERY,
          },
        ],
        category: TimelineElementCategoryV20Enum.DIGITAL_SUCCESS_WORKFLOW,
        details: {
          recIndex: index,
          digitalAddress: recipient.digitalDomicile,
        },
      },
      {
        elementId: `${iun}_schedule_refinement_workflow_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV20Enum.SCHEDULE_REFINEMENT,
        details: {
          recIndex: index,
        },
      },
      {
        elementId: `${iun}_refinement_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryV20Enum.REFINEMENT,
        details: {
          recIndex: index,
          notificationCost: 100,
        },
      },
      {
        elementId: `${iun}_notification_viewed_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: `safestorage://PN_LEGAL_FACTS-0002-${IUNGeneratorByIndex(iun, 4)}`,
            category: LegalFactCategoryEnum.RECIPIENT_ACCESS,
          },
        ],
        category: TimelineElementCategoryV20Enum.NOTIFICATION_VIEWED,
        details: {
          recIndex: index,
        },
      },
    ];

export const makeTimelineList =
  (env: DomainEnv) =>
  (notification: FullSentNotificationV21): ReadonlyArray<TimelineElementV20> =>
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
        category: TimelineElementCategoryV20Enum.REQUEST_ACCEPTED,
      },
      ...pipe(notification.recipients, RA.chainWithIndex(makeTimelineListPEC(env)(notification.iun))),
    ];

export const makeNotificationStatusHistory =
  (env: DomainEnv) =>
  (notificationStatus: NotificationStatusEnum, timeline: ReadonlyArray<TimelineElementV20>): NotificationStatusHistory =>
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
