import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { makePreLoadRecord, PreLoadRecord } from '../domain/PreLoadRecord';
import { SystemEnv } from './SystemEnv';

export const PreLoadUseCase =
  (env: SystemEnv) =>
  (apiKey: PreLoadRecord['input']['apiKey']) =>
  (body: PreLoadRecord['input']['body']): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      makePreLoadRecord({ ...env, input: { apiKey, body } }),
      env.recordRepository.insert,
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
