import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { GetNotificationDetailRecord, makeGetNotificationDetailRecord } from '../domain/GetNotificationDetailRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const GetNotificationDetailUseCase =
  (env: SystemEnv) =>
  (apiKey: GetNotificationDetailRecord['input']['apiKey']) =>
  (iun: GetNotificationDetailRecord['input']['iun']): TE.TaskEither<Error, GetNotificationDetailRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeGetNotificationDetailRecord(env)({ apiKey, iun })),
      TE.chain(env.recordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetNotificationDetailUseCase = ReturnType<typeof GetNotificationDetailUseCase>;
