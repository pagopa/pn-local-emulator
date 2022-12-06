import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { CreateEventStreamRecord, makeCreateEventStreamRecord } from '../domain/CreateEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const CreateEventStreamUseCase =
  (env: SystemEnv) =>
  (apiKey: CreateEventStreamRecord['input']['apiKey']) =>
  (body: CreateEventStreamRecord['input']['body']): TE.TaskEither<Error, CreateEventStreamRecord['output']> =>
    pipe(
      makeCreateEventStreamRecord(env)({ apiKey, body }),
      env.recordRepository.insert,
      TE.map(({ output }) => output)
    );

export type CreateEventStreamUseCase = ReturnType<typeof CreateEventStreamUseCase>;
