import * as crypto from 'crypto';
import { pipe, flow } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import {
  ConsumeEventStreamRecord,
  ConsumeEventStreamRecordRepository,
  makeProgressResponse,
} from '../domain/ConsumeEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { CheckNotificationStatusRecordRepository } from '../domain/CheckNotificationStatusRepository';
import { computeSnapshot } from '../domain/Snapshot';

export const ConsumeEventStreamUseCase =
  (
    occurencesAfterComplete: number,
    createNotificationRequestRecordRepository: NewNotificationRepository,
    findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository,
    consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository,
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
          TE.of(computeSnapshot(occurencesAfterComplete, iunGenerator)),
          TE.ap(createNotificationRequestRecordRepository.list()),
          TE.ap(findNotificationRequestRecordRepository.list()),
          TE.ap(consumeEventStreamRecordRepository.list()),
          TE.map(
            flow(
              // create ProgressResponse
              makeProgressResponse(nowDate()),
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
      TE.chain(consumeEventStreamRecordRepository.insert),
      TE.map(({ output }) => output)
    );

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
