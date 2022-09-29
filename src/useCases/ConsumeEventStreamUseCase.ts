import * as crypto from 'crypto';
import { pipe, flow } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import {
  ConsumeEventStreamRecord,
  ConsumeEventStreamRecordRepository,
  getProgressResponseList,
  makeProgressResponseElement,
} from '../domain/ConsumeEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { getNotifications, NewNotificationRepository } from '../domain/NewNotificationRepository';
import {
  CheckNotificationStatusRecordRepository,
  getNotificationStatusList,
} from '../domain/CheckNotificationStatusRepository';

export const ConsumeEventStreamUseCase =
  (
    numberOfWaitingBeforeComplete: number,
    consumeEventStreamRepository: ConsumeEventStreamRecordRepository,
    newNotificationRecordRepository: NewNotificationRepository,
    checkNotificationStatusRecordRepository: CheckNotificationStatusRecordRepository,
    nowDate: () => Date = () => new Date(),
    iunGenerator: () => string = crypto.randomUUID
  ) =>
  (apiKey: ApiKey) =>
  (streamId: string) =>
  (lastEventId?: string): TE.TaskEither<Error, ConsumeEventStreamRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(makeProgressResponseElement(numberOfWaitingBeforeComplete, nowDate, iunGenerator)),
          TE.ap(pipe(checkNotificationStatusRecordRepository.list(), TE.map(getNotificationStatusList))),
          TE.ap(pipe(consumeEventStreamRepository.list(), TE.map(getProgressResponseList))),
          TE.map(RA.map),
          TE.ap(pipe(newNotificationRecordRepository.list(), TE.map(getNotifications))),
          TE.map(
            flow(
              // override the eventId to create a simple cursor based pagination
              RA.mapWithIndex((i, elem) => ({ ...elem, eventId: i.toString() })),
              RA.filterWithIndex((i) => i > parseInt(lastEventId || '-1', 10)),
              (output) => ({ statusCode: 200 as const, returned: output })
            )
          )
        )
      ),
      E.sequence(TE.ApplicativePar),
      TE.map(
        flow(E.toUnion, (output) => ({
          type: 'ConsumeEventStreamRecord' as const,
          input: { apiKey, streamId, lastEventId },
          output,
        }))
      ),
      TE.chain(consumeEventStreamRepository.insert),
      TE.map(({ output }) => output)
    );

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
