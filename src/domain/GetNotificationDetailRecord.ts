import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { Iun } from '../generated/definitions/Iun';
import { FullSentNotification } from '../generated/definitions/FullSentNotification';
import { NotificationStatusEnum } from '../generated/definitions/NotificationStatus';
import { NotificationStatusHistoryElement } from '../generated/definitions/NotificationStatusHistoryElement';
import { TimelineElementCategoryEnum } from '../generated/definitions/TimelineElementCategory';
import { TimelineElement } from '../generated/definitions/TimelineElement';
import { AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { NotificationRequest } from './NotificationRequest';
import { authorizeApiKey } from './authorize';
import { Snapshot } from './Snapshot';
import { DomainEnv } from './DomainEnv';

export type GetNotificationDetailRecord = AuditRecord & {
  type: 'GetNotificationDetailRecord';
  input: { apiKey: string; iun: Iun };
  output: Response<200, FullSentNotification> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

const makeTimelineElementId = (iun: string) => `${iun}_request_accepted`;

const makeNotificationStatusHistoryElement = (
  iun: Iun,
  status: NotificationStatusEnum,
  activeFrom: Date
): NotificationStatusHistoryElement => ({
  status,
  activeFrom,
  relatedTimelineElements: [makeTimelineElementId(iun)],
});

const makeTimelineElement = (elementId: string): TimelineElement => ({
  elementId,
  category: TimelineElementCategoryEnum.REQUEST_ACCEPTED,
  legalFactsIds: [],
});

export const makeFullSentNotification =
  (senderPaId: string) =>
  (sentAt: Date) =>
  (notificationRequest: NotificationRequest) =>
  (iun: string): FullSentNotification => ({
    ...notificationRequest,
    iun,
    sentAt,
    notificationStatus: NotificationStatusEnum.ACCEPTED,
    notificationStatusHistory: [makeNotificationStatusHistoryElement(iun, NotificationStatusEnum.ACCEPTED, sentAt)],
    documentsAvailable: true,
    timeline: [pipe(iun, makeTimelineElementId, makeTimelineElement)],
    senderPaId,
  });

export const makeGetNotificationDetailRecord =
  (env: DomainEnv) =>
  (input: GetNotificationDetailRecord['input']) =>
  (snapshot: Snapshot): GetNotificationDetailRecord => ({
    type: 'GetNotificationDetailRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() =>
        pipe(
          snapshot,
          RA.filterMap(O.fromEither),
          RA.findFirstMap((notification) => (notification.iun === input.iun ? O.some(notification) : O.none)),
          O.map((returned) => ({ statusCode: 200 as const, returned })),
          O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
        )
      ),
      E.toUnion
    ),
  });
