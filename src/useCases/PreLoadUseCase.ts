import * as crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { makePreLoadResponse, PreLoadRecord } from '../domain/PreLoadRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { PreLoadResponse } from '../generated/definitions/PreLoadResponse';
import { authorizeApiKey } from '../domain/authorize';
import { SystemEnv } from './SystemEnv';

// build response payload from the given request body
const makeResponsePayload = (baseUrl: string, body: PreLoadRequestBody): ReadonlyArray<PreLoadResponse> =>
  body.map((req) =>
    pipe(crypto.randomUUID(), (key) => makePreLoadResponse(key, crypto.randomUUID(), `${baseUrl}/${key}`, req))
  );

export const PreLoadUseCase =
  ({ uploadToS3URL, preLoadRecordRepository }: SystemEnv) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map((_) => makeResponsePayload(uploadToS3URL.href, body)),
      E.map((returned) => ({ statusCode: 200 as const, returned })),
      E.toUnion,
      (output) => ({ type: 'PreLoadRecord' as const, input: { apiKey, body }, output }),
      preLoadRecordRepository.insert,
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
