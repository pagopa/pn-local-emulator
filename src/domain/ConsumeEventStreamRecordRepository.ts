import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { ProgressResponse } from '../generated/streams/ProgressResponse';
import { NewStatusEnum, ProgressResponseElement } from '../generated/streams/ProgressResponseElement';
import { NewNotificationRecord } from './NewNotificationRepository';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type ConsumeEventStreamRecord = {
  type: 'ConsumeEventStreamRecord';
  input: { apiKey: ApiKey; streamId: string; lastEventId?: string };
  output: Response<200, ProgressResponse> | Response<403, UnauthorizedMessageBody> | Response<419>;
};

const makeProgressResponseElement = (
  minNumberOfWaitingBeforeDelivering: number,
  response: NewNotificationResponse,
  consumeEventStreamRecordList: ReadonlyArray<ConsumeEventStreamRecord>,
  nowDate: () => Date,
  iunGenerator: () => string
): ProgressResponseElement =>
  pipe(
    consumeEventStreamRecordList,
    RA.filterMap(({ output }) => (output.statusCode === 200 ? O.some(output.returned) : O.none)),
    RA.chain(RA.filter(({ notificationRequestId }) => notificationRequestId === response.notificationRequestId)),
    (list) =>
      pipe(
        list,
        // if exist an element not in pending return it
        RA.findLast(({ newStatus }) => newStatus !== NewStatusEnum.IN_VALIDATION),
        O.getOrElse(() => {
          const element: ProgressResponseElement = {
            // TODO: use a date as eventId
            eventId: 'eventIdValue',
            timestamp: nowDate(),
            notificationRequestId: response.notificationRequestId,
            newStatus: NewStatusEnum.IN_VALIDATION,
          };
          const completed = { ...element, newStatus: NewStatusEnum.DELIVERED, iun: iunGenerator() };
          // if the resource was required more times
          // than the threshold then return it as completed
          return RA.size(list) >= minNumberOfWaitingBeforeDelivering ? completed : element;
        })
      )
  );

export const makeProgressResponse = (
  minNumberOfWaitingBeforeDelivering: number,
  newNotificationRecordList: ReadonlyArray<NewNotificationRecord>,
  consumeEventStreamRecordList: ReadonlyArray<ConsumeEventStreamRecord>,
  nowDate: () => Date,
  iunGenerator: () => string
): ProgressResponse =>
  pipe(
    newNotificationRecordList,
    RA.filterMap((record) =>
      pipe(
        record.output.statusCode === 202 ? O.of(record.output.returned) : O.none,
        O.map((response) =>
          makeProgressResponseElement(
            minNumberOfWaitingBeforeDelivering,
            response,
            consumeEventStreamRecordList,
            nowDate,
            iunGenerator
          )
        )
      )
    )
  );

export type ConsumeEventStreamRecordRepository = Repository<ConsumeEventStreamRecord>;
