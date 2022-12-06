import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { ListEventStreamRecord, makeListEventStreamRecord } from '../domain/ListEventStreamRecordRepository';
import { isCreateEventStreamRecord } from '../domain/CreateEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const ListEventStreamUseCase =
  (env: SystemEnv) =>
  (apiKey: ListEventStreamRecord['input']['apiKey']): TE.TaskEither<Error, ListEventStreamRecord['output']> =>
    pipe(
      pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCreateEventStreamRecord))),
      TE.map(makeListEventStreamRecord(env)({ apiKey })),
      TE.chain(env.recordRepository.insert),
      TE.map(({ output }) => output)
    );

export type ListEventStreamUseCase = ReturnType<typeof ListEventStreamUseCase>;
