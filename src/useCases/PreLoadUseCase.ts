import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { Logger } from '../logger';
import { makePreLoadRecord, makePreLoadResponse, PreLoadRecord, PreLoadRecordRepository } from '../domain/PreLoadRepository';
import * as crypto from 'crypto';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';

export const PreLoadUseCase =
  (logger: Logger, repository: PreLoadRecordRepository) =>
  (apiKey: ApiKey) =>
  (body: PreLoadRequestBody): TE.TaskEither<Error, PreLoadRecord['output']> => {
    const input = { apiKey, body };
    // TODO: Move as input argument
    const url = 'http://localhost:8080/delivery/attachments/preload';
    const returned = body
      .map((req) => {
        // TODO: Move into an adapter
        const [key, secret] = [crypto.randomUUID(), crypto.randomUUID()];
        return makePreLoadResponse(key, secret, url, req)
      });
    const output =
      (apiKey === "key-value")
        ? { statusCode: 200 as const, returned: returned }
        : { statusCode: 401 as const, returned: undefined };
    const record = makePreLoadRecord({ input, output });
    return pipe(
      repository.insert(record),
      TE.map((_) => {
        logger.debug(record);
        return _.output
      })
    )
  };

export type PreLoadUseCase = ReturnType<typeof PreLoadUseCase>;
