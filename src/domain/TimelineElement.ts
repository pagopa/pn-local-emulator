import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import { DigitalAddressSourceEnum } from '../generated/pnapi/DigitalAddressSource';
import { IUN } from '../generated/pnapi/IUN';
import { LegalFactCategoryEnum } from '../generated/pnapi/LegalFactCategory';
import { NewNotificationRequest } from '../generated/pnapi/NewNotificationRequest';
import { NotificationRecipient } from '../generated/pnapi/NotificationRecipient';
import { TimelineElement } from '../generated/pnapi/TimelineElement';
import { TimelineElementCategoryEnum } from '../generated/pnapi/TimelineElementCategory';
import { DomainEnv } from './DomainEnv';

const makeTimelineListPEC = (env: DomainEnv) => (iun: IUN) => (recipient: NotificationRecipient) =>
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
      timestamp: new Date(),
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
      timestamp: new Date(),
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
  ];

export const makeTimelineList =
  (env: DomainEnv) =>
  (iun: IUN) =>
  (notification: NewNotificationRequest): ReadonlyArray<TimelineElement> =>
    [
      {
        elementId: `${iun}_request_accepted`,
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
        elementId: `${iun}_aar_gen_1`,
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
        elementId: `${iun}_aar_gen_0`,
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
      ...pipe(notification.recipients, RA.map(makeTimelineListPEC(env)(iun))),
    ];
