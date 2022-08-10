import * as crypto from 'crypto';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { Logger } from '../logger';
import {
  makePreLoadRecord,
  makePreLoadResponse,
  PreLoadRecord,
  PreLoadRecordRepository,
} from '../domain/PreLoadRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { onValidApiKey } from "./utils";

export const PreLoadUseCase =
  (logger: Logger, uploadToS3URL: URL, repository: PreLoadRecordRepository) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> => {
    const input = { apiKey, body };
    const url = uploadToS3URL.href;
    const returned = body
      .map((req) => {
        // TODO: Move into an adapter
        const [key, secret] = [crypto.randomUUID(), crypto.randomUUID()];
        return makePreLoadResponse(key, secret, url, req)
      });
    const output = onValidApiKey(apiKey)({ statusCode: 200 as const, returned: returned });
    const record = makePreLoadRecord({ input, output });
    return pipe(
      repository.insert(record),
      TE.chainFirst(() => TE.of(logger.debug(record))),
      TE.map((_) => record.output)
    );
  };

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
