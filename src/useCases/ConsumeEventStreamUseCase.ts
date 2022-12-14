import { pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import {
  ConsumeEventStreamRecord,
  isConsumeEventStreamRecord,
  makeConsumeEventStreamRecord,
} from '../domain/ConsumeEventStreamRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { SystemEnv } from './SystemEnv';

export const ConsumeEventStreamUseCase =
  (env: SystemEnv) =>
  (apiKey: ConsumeEventStreamRecord['input']['apiKey']) =>
  (streamId: ConsumeEventStreamRecord['input']['streamId']) =>
  (
    lastEventId?: ConsumeEventStreamRecord['input']['lastEventId']
  ): TE.TaskEither<Error, ConsumeEventStreamRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeConsumeEventStreamRecord(env)({ apiKey, streamId, lastEventId })),
      TE.chain(env.recordRepository.insert),
      TE.map(({ output }) => output)
    );

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
