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

const queryParams =
  'X-Amz-Algorithm=AWS4-HMAC-SHA256' +
  '&X-Amz-Credential=AS%2F20221021%2Feu-south-1%2Fs3%2Faws4_re' +
  '&X-Amz-SignedHeaders=content-type%3Bhost%3Bx-amz-checksum-sha256%3Bx-amz-meta-secret' +
  '&X-Amz-Security-Token=IQoJ%2F%2F%2F%2F%2EaCmV1L%2BhA4zxI%2BJM9e0olwA%2O7vc3oaFv';

// build response payload from the given request body
const makeResponsePayload = (baseUrl: string, body: PreLoadRequestBody): ReadonlyArray<PreLoadResponse> =>
  body.map((req) =>
    pipe(crypto.randomUUID(), (key) =>
      makePreLoadResponse(key, crypto.randomUUID(), `${baseUrl}/${key}?${queryParams}`, req)
    )
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
