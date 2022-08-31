import * as crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {
  makePreLoadRecord,
  makePreLoadResponse,
  PreLoadRecord,
  PreLoadRecordRepository,
} from '../domain/PreLoadRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { PreLoadResponse } from '../generated/definitions/PreLoadResponse';
import { authorizeApiKey } from './utils';

// build response payload from the given request body
const makeResponsePayload = (url: string, body: PreLoadRequestBody): PreLoadResponse[] =>
  body.map((req) => makePreLoadResponse(crypto.randomUUID(), crypto.randomUUID(), url, req));

export const PreLoadUseCase =
  (uploadToS3URL: URL, repository: PreLoadRecordRepository) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      // authorize the key
      authorizeApiKey(apiKey),
      // create the response on valid key
      E.map((_) => ({ statusCode: 200 as const, returned: makeResponsePayload(uploadToS3URL.href, body) })),
      E.toUnion,
      (output) => repository.insert(makePreLoadRecord({ input: { apiKey, body }, output })),
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
