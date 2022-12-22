import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { DigitalAddressSourceEnum } from '../generated/pnapi/DigitalAddressSource';
import { FullSentNotification } from '../generated/pnapi/FullSentNotification';
import { IUN } from '../generated/pnapi/IUN';
import { LegalFactCategoryEnum } from '../generated/pnapi/LegalFactCategory';
import { NotificationRecipient } from '../generated/pnapi/NotificationRecipient';
import { ResponseStatusEnum } from '../generated/pnapi/ResponseStatus';
import { TimelineElement } from '../generated/pnapi/TimelineElement';
import { TimelineElementCategoryEnum } from '../generated/pnapi/TimelineElementCategory';
import { NotificationStatusHistory } from '../generated/pnapi/NotificationStatusHistory';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';

const makeTimelineListPEC =
  (env: DomainEnv) =>
  (iun: IUN) =>
  (recipient: NotificationRecipient): ReadonlyArray<TimelineElement> =>
    [
      {
        elementId: `${iun}_get_address_1_source_PLATFORM_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.GET_ADDRESS,
        details: {
          recIndex: 1,
          digitalAddressSource: DigitalAddressSourceEnum.PLATFORM,
          isAvailable: false,
          attemptDate: env.dateGenerator(),
          errors: [],
        },
      },
      {
        elementId: `${iun}_get_address_1_source_SPECIAL_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.GET_ADDRESS,
        details: {
          recIndex: 1,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          isAvailable: true,
          attemptDate: env.dateGenerator(),
          errors: [],
        },
      },
      {
        elementId: `${iun}_send_digital_domicile_1_source_SPECIAL_attempt_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.SEND_DIGITAL_DOMICILE,
        details: {
          recIndex: 1,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          errors: [],
          retryNumber: 0,
        },
      },
      {
        elementId: `${iun}_digital_delivering_progress_0_source_SPECIAL_attempt_0_progidx_1`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: 'safestorage://PN_NOTIFICATION_ATTACHMENTS-0001-NRUG-D5AW-BN0N-07Z2',
            category: LegalFactCategoryEnum.PEC_RECEIPT,
          },
        ],
        category: TimelineElementCategoryEnum.SEND_DIGITAL_PROGRESS,
        details: {
          recIndex: 0,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          errors: [],
          retryNumber: 0,
          notificationDate: env.dateGenerator(),
          sendingReceipts: [{}],
          eventCode: 'C001',
          shouldRetry: false,
        },
      },
      {
        elementId: `${iun}_digital_delivering_progress_0_source_SPECIAL_attempt_0_progidx_1`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: 'safestorage://PN_NOTIFICATION_ATTACHMENTS-0001-NRUG-D5AW-BN0N-07Z2',
            category: LegalFactCategoryEnum.PEC_RECEIPT,
          },
        ],
        category: TimelineElementCategoryEnum.SEND_DIGITAL_FEEDBACK,
        details: {
          recIndex: 1,
          digitalAddress: recipient.digitalDomicile,
          digitalAddressSource: DigitalAddressSourceEnum.SPECIAL,
          errors: [],
          responseStatus: ResponseStatusEnum.OK,
          notificationDate: env.dateGenerator(),
          sendingReceipts: [{}],
        },
      },
      {
        elementId: `${iun}_digital_success_workflow_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: 'safestorage://PN_LEGAL_FACTS-0001-NRUG-D5AW-BN0N-07Z2',
            category: LegalFactCategoryEnum.DIGITAL_DELIVERY,
          },
        ],
        category: TimelineElementCategoryEnum.DIGITAL_SUCCESS_WORKFLOW,
        details: {
          recIndex: 0,
          digitalAddress: recipient.digitalDomicile,
          errors: [],
        },
      },
      {
        elementId: `${iun}_schedule_refinement_workflow_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.SCHEDULE_REFINEMENT,
        details: {
          recIndex: 0,
          errors: [],
        },
      },
      {
        elementId: `${iun}_refinement_0`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.REFINEMENT,
        details: {
          recIndex: 0,
          notificationCost: 100,
          errors: [],
        },
      },
      {
        elementId: `${iun}_notification_viewed_1`,
        timestamp: env.dateGenerator(),
        legalFactsIds: [
          {
            key: 'safestorage://PN_LEGAL_FACTS-0002-TF2V-Z8RP-ZQRD-5AWL',
            category: LegalFactCategoryEnum.RECIPIENT_ACCESS,
          },
        ],
        category: TimelineElementCategoryEnum.NOTIFICATION_VIEWED,
        details: {
          recIndex: 1,
          errors: [],
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
            key: `safestorage://PN_LEGAL_FACTS-0002-${env.iunGenerator()}`,
            category: LegalFactCategoryEnum.SENDER_ACK,
          },
        ],
        category: TimelineElementCategoryEnum.REQUEST_ACCEPTED,
      },
      {
        elementId: `${notification.iun}_aar_gen_1`,
        timestamp: new Date(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.AAR_GENERATION,
        details: {
          recIndex: 1,
          errors: [],
          numberOfPages: 1,
          generatedAarUrl: `safestorage://PN_AAR-0002-${env.iunGenerator()}`,
        },
      },
      {
        elementId: `${notification.iun}_aar_gen_0`,
        timestamp: new Date(),
        legalFactsIds: [],
        category: TimelineElementCategoryEnum.AAR_GENERATION,
        details: {
          recIndex: 0,
          errors: [],
          numberOfPages: 1,
          generatedAarUrl: `safestorage://PN_AAR-0002-${env.iunGenerator()}`,
        },
      },
      ...pipe(notification.recipients, RA.chain(makeTimelineListPEC(env)(notification.iun))),
    ];

export const makeNotificationStatusHistory =
  (env: DomainEnv) =>
  (timeline: ReadonlyArray<TimelineElement>): NotificationStatusHistory =>
    [
      {
        status: NotificationStatusEnum.VIEWED,
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
  (notification: Notification): Notification =>
    pipe(notification, makeTimelineList(env), (timelineList) => ({
      ...notification,
      notificationStatus: NotificationStatusEnum.VIEWED,
      notificationStatusHistory: makeNotificationStatusHistory(env)(timelineList),
      timeline: timelineList,
    }));
