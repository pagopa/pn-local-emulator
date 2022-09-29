import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { Notification } from '../domain/NewNotificationRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { ProgressResponse } from '../generated/streams/ProgressResponse';
import { NewStatusEnum, ProgressResponseElement } from '../generated/streams/ProgressResponseElement';
import { makeNewNotificationRequestStatusResponse } from './CheckNotificationStatusRepository';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type ConsumeEventStreamRecord = {
  type: 'ConsumeEventStreamRecord';
  input: { apiKey: ApiKey; streamId: string; lastEventId?: string };
  output: Response<200, ProgressResponse> | Response<403, UnauthorizedMessageBody> | Response<419>;
};

const getProgressResponse = (record: ConsumeEventStreamRecord): O.Option<ProgressResponse> =>
  record.output.statusCode === 200 ? O.some(record.output.returned) : O.none;

export const getProgressResponseList = flow(RA.filterMap(getProgressResponse), RA.flatten);

export const makeProgressResponseElement =
  (numberOfWaitingBeforeAccepted: number, nowDate: () => Date, iunGenerator: () => string) =>
  (notificationRequestList: ReadonlyArray<NewNotificationRequestStatusResponse>) =>
  (progressResponseElementList: ProgressResponse) =>
  (notification: Notification): ProgressResponseElement =>
    pipe(
      progressResponseElementList,
      // find a response with a valid status
      RA.findLast(({ newStatus }) => newStatus !== undefined),
      // otherwise create a new response
      O.getOrElse<ProgressResponseElement>(() =>
        pipe(
          // compose the NotificationRequest
          makeNewNotificationRequestStatusResponse(
            numberOfWaitingBeforeAccepted,
            iunGenerator
          )(notificationRequestList)(progressResponseElementList)(notification),
          (notification) => ({
            eventId: '0',
            timestamp: nowDate(),
            notificationRequestId: notification.notificationRequestId,
            iun: notification.iun,
            newStatus: notification.notificationRequestStatus === 'ACCEPTED' ? NewStatusEnum.ACCEPTED : undefined,
          })
        )
      )
    );

export type ConsumeEventStreamRecordRepository = Repository<ConsumeEventStreamRecord>;
