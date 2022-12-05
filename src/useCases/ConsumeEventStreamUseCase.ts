import { pipe, flow } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import { ConsumeEventStreamRecord, makeProgressResponse } from '../domain/ConsumeEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { SystemEnv } from './SystemEnv';

// TODO: Apply the Reader monad to the environment.
export const ConsumeEventStreamUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey) =>
  (streamId: string) =>
  (lastEventId?: string): TE.TaskEither<Error, ConsumeEventStreamRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(computeSnapshot(env)),
          TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
          TE.ap(env.findNotificationRequestRecordRepository.list()),
          TE.ap(env.consumeEventStreamRecordRepository.list()),
          TE.map(
            flow(
              // create ProgressResponse
              makeProgressResponse(env.dateGenerator()),
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
          loggedAt: env.dateGenerator(),
        }))
      ),
      TE.chain(env.consumeEventStreamRecordRepository.insert),
      TE.map(({ output }) => output)
    );

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
