import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { ListEventStreamRecord, makeListEventStreamRecord } from '../domain/ListEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { SystemEnv } from './SystemEnv';

export const ListEventStreamUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey): TE.TaskEither<Error, ListEventStreamRecord['output']> =>
    pipe(
      env.createEventStreamRecordRepository.list(),
      TE.map((createEventStreamRecordList) =>
        makeListEventStreamRecord({ ...env, request: { apiKey }, createEventStreamRecordList })
      ),
      TE.chain(env.listEventStreamRecordRepository.insert),
      TE.map(({ output }) => output)
    );

export type ListEventStreamUseCase = ReturnType<typeof ListEventStreamUseCase>;
