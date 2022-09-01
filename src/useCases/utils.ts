import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Response } from '../domain/types';

export const authorizeApiKey = (apiKey: ApiKey): E.Either<Response<401>, ApiKey> =>
  pipe(
    apiKey,
    E.fromPredicate(
      // TODO: Get "key-value" from configuration
      () => apiKey === 'key-value',
      () => ({ statusCode: 401 as const, returned: undefined })
    )
  );
