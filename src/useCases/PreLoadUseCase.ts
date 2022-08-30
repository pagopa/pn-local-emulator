import * as crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
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
import { makeResponse } from './utils';

// build response payload from the given request body
const makeResponsePayload = (url: string, body: PreLoadRequestBody): PreLoadResponse[] =>
  body.map((req) => makePreLoadResponse(crypto.randomUUID(), crypto.randomUUID(), url, req));

export const PreLoadUseCase =
  (uploadToS3URL: URL, repository: PreLoadRecordRepository) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      TE.of(makeResponsePayload(uploadToS3URL.href, body)),
      TE.chain(makeResponse(apiKey)(200)),
      TE.map((output) => makePreLoadRecord({ input: { apiKey, body }, output })),
      TE.chain(repository.insert),
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
