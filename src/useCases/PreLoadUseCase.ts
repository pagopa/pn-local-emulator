import * as crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Logger } from '../logger';
import {
  makePreLoadRecord,
  makePreLoadResponse,
  PreLoadRecord,
  PreLoadRecordRepository,
} from '../domain/PreLoadRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { PreLoadResponse } from '../generated/definitions/PreLoadResponse';
import { onValidApiKey } from './utils';

// build response payload from the given request body
const makeResponsePayload = (url: string, body: PreLoadRequestBody): PreLoadResponse[] =>
  body.map((req) => makePreLoadResponse(crypto.randomUUID(), crypto.randomUUID(), url, req));

// get a successful response payload or authentication error in case the API key is not valid
const makeResponse = (apiKey: string) => (returned: PreLoadResponse[]) =>
  pipe({ statusCode: 200 as const, returned }, onValidApiKey(apiKey), TE.fromEither, TE.toUnion, TE.fromTask);

// log the content of the record inserted into the repository
const logPreloadRecord = (logger: Logger) => (record: PreLoadRecord) => pipe(record, logger.debug, TE.right);

export const PreLoadUseCase =
  (logger: Logger, uploadToS3URL: URL, repository: PreLoadRecordRepository) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      TE.of(makeResponsePayload(uploadToS3URL.href, body)),
      TE.chain(makeResponse(apiKey)),
      TE.map((output) => makePreLoadRecord({ input: { apiKey, body }, output })),
      TE.chain(repository.insert),
      TE.chainFirst(logPreloadRecord(logger)),
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
