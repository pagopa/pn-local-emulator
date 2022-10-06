import { pipe } from 'fp-ts/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { FullSentNotification } from '../generated/definitions/FullSentNotification';
import { NotificationStatusEnum } from '../generated/definitions/NotificationStatus';
import { NotificationStatusHistoryElement } from '../generated/definitions/NotificationStatusHistoryElement';
import { TimelineElementCategoryEnum } from '../generated/definitions/TimelineElementCategory';
import { TimelineElement } from '../generated/definitions/TimelineElement';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { NotificationRequest } from './NotificationRequest';

export type GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord';
  input: { apiKey: ApiKey; iun: Iun };
  output: Response<200, FullSentNotification> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type GetNotificationDetailRecordRepository = Repository<GetNotificationDetailRecord>;

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
});

export const makeFullSentNotification =
  (senderPaId: string) =>
  (sentAt: Date) =>
  (notification: NotificationRequest) =>
  (iun: string): FullSentNotification => ({
    iun,
    ...notification,
    sentAt,
    notificationStatus: NotificationStatusEnum.ACCEPTED,
    notificationStatusHistory: [makeNotificationStatusHistoryElement(iun, NotificationStatusEnum.ACCEPTED, sentAt)],
    documentsAvailable: true,
    timeline: [pipe(iun, makeTimelineElementId, makeTimelineElement)],
    senderPaId,
  });
