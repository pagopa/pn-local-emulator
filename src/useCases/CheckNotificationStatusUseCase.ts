import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import {
  CheckNotificationStatusRecord,
  isCheckNotificationStatusRecord,
  makeCheckNotificationStatusRecord,
} from '../domain/CheckNotificationStatusRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const CheckNotificationStatusUseCase =
  (env: SystemEnv) =>
  (apiKey: CheckNotificationStatusRecord['input']['apiKey']) =>
  (
    body: CheckNotificationStatusRecord['input']['body']
  ): TE.TaskEither<Error, CheckNotificationStatusRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeCheckNotificationStatusRecord(env)({ apiKey, body })),
      TE.chain(env.recordRepository.insert),
      TE.map((record) => record.output)
    );

export type CheckNotificationStatusUseCase = ReturnType<typeof CheckNotificationStatusUseCase>;
