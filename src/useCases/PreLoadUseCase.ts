import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { makePreLoadRecord, PreLoadRecord } from '../domain/PreLoadRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { SystemEnv } from './SystemEnv';

export const PreLoadUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      makePreLoadRecord({ ...env, input: { apiKey, body } }),
      env.preLoadRecordRepository.insert,
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
