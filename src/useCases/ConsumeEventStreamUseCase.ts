import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { ConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecordRepository';
import { makeConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { computeSnapshot } from '../domain/Snapshot';
import { SystemEnv } from './SystemEnv';

export const ConsumeEventStreamUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey) =>
  (streamId: string) =>
  (lastEventId?: string): TE.TaskEither<Error, ConsumeEventStreamRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(env.createNotificationRequestRecordRepository.list()),
      TE.ap(env.findNotificationRequestRecordRepository.list()),
      TE.ap(env.consumeEventStreamRecordRepository.list()),
      TE.map((snapshot) =>
        makeConsumeEventStreamRecord({
          ...env,
          request: { apiKey, streamId, lastEventId },
          snapshot,
        })
      ),
      TE.chain(env.consumeEventStreamRecordRepository.insert),
      TE.map(({ output }) => output)
    );

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
