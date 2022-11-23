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

const makeURL = (baseUrl: string, key: string) => {
  const url = new URL(`${baseUrl}/${key}`);
  url.searchParams.append('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.append('X-Amz-Credential', 'AKIDEXAMPLE/20150830/us-east-1/iam/aws4_request');
  url.searchParams.append('X-Amz-SignedHeaders', 'content-type;host;x-amz-checksum-sha256;x-amz-meta-secret');
  url.searchParams.append('X-Amz-Security-Token', 'IQoJbJf//////////wEaCmV1i3c+bxI+JMzP+PRXYj/e2G/ti/Qkj3KnOPr');
  return url.href;
};

// build response payload from the given request body
const makeResponsePayload = (baseUrl: string, body: PreLoadRequestBody): ReadonlyArray<PreLoadResponse> =>
  body.map((req) =>
    pipe(crypto.randomUUID(), (key) => makePreLoadResponse(key, crypto.randomUUID(), makeURL(baseUrl, key), req))
  );

export const PreLoadUseCase =
  ({ uploadToS3URL, preLoadRecordRepository, dateGenerator }: SystemEnv) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map((_) => makeResponsePayload(uploadToS3URL.href, body)),
      E.map((returned) => ({ statusCode: 200 as const, returned })),
      E.toUnion,
      (output) => ({ type: 'PreLoadRecord' as const, input: { apiKey, body }, output, loggedAt: dateGenerator() }),
      preLoadRecordRepository.insert,
      TE.map((record) => record.output)
    );

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
