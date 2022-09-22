import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';

export const authorizeApiKey = (apiKey: ApiKey): E.Either<Response<403, UnauthorizedMessageBody>, ApiKey> =>
  pipe(
    apiKey,
    E.fromPredicate(
      // TODO: Get "key-value" from configuration
      () => apiKey === 'key-value',
      () => unauthorizedResponse
    )
  );
