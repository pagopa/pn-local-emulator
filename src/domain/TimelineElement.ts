import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { DigitalAddressSourceEnum } from '../generated/pnapi/DigitalAddressSource';
import { FullSentNotification } from '../generated/pnapi/FullSentNotification';
import { IUN } from '../generated/pnapi/IUN';
import { LegalFactCategoryEnum } from '../generated/pnapi/LegalFactCategory';
import { NotificationRecipient } from '../generated/pnapi/NotificationRecipient';
import { TimelineElement } from '../generated/pnapi/TimelineElement';
import { TimelineElementCategoryEnum } from '../generated/pnapi/TimelineElementCategory';
import { NotificationStatusHistory } from '../generated/pnapi/NotificationStatusHistory';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { ResponseStatusEnum } from '../generated/pnapi/ResponseStatus';
import { IUNGeneratorByIndex } from '../adapters/randexp/IUNGenerator';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';

const makeTimelineListPEC =
  (env: DomainEnv) =>
  (iun: IUN) =>
  (index: number, recipient: NotificationRecipient): ReadonlyArray<TimelineElement> =>
    [
      {
        elementId: `${iun}_aar_gen_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.AAR_GENERATION,
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
        category: TimelineElementCategoryEnum.GET_ADDRESS,
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
        category: TimelineElementCategoryEnum.GET_ADDRESS,
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
        category: TimelineElementCategoryEnum.SEND_DIGITAL_DOMICILE,
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
        category: TimelineElementCategoryEnum.SEND_DIGITAL_PROGRESS,
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
        category: TimelineElementCategoryEnum.SEND_DIGITAL_FEEDBACK,
        details: {
          recIndex: index,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          responseStatus: ResponseStatusEnum.OK,
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
        category: TimelineElementCategoryEnum.DIGITAL_SUCCESS_WORKFLOW,
        details: {
          recIndex: index,
          digitalAddress: recipient.digitalDomicile,
        },
      },
      {
        elementId: `${iun}_schedule_refinement_workflow_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.SCHEDULE_REFINEMENT,
        details: {
          recIndex: index,
        },
      },
      {
        elementId: `${iun}_refinement_${index}`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.REFINEMENT,
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
        category: TimelineElementCategoryEnum.NOTIFICATION_VIEWED,
        details: {
          recIndex: index,
        },
      },
    ];

export const makeTimelineList =
  (env: DomainEnv) =>
  (notification: FullSentNotification): ReadonlyArray<TimelineElement> =>
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
        category: TimelineElementCategoryEnum.REQUEST_ACCEPTED,
      },
      ...pipe(notification.recipients, RA.chainWithIndex(makeTimelineListPEC(env)(notification.iun))),
    ];

export const makeNotificationStatusHistory =
  (env: DomainEnv) =>
  (notificationStatus: NotificationStatusEnum, timeline: ReadonlyArray<TimelineElement>): NotificationStatusHistory =>
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
