import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { UnauthorizedMessageBody, Response } from './types';

export const unauthorizedMessage: UnauthorizedMessageBody = {
  message: 'User is not authorized to access this resource with an explicit deny',
};

export const authorizeApiKey = (apiKey: ApiKey): E.Either<Response<403, UnauthorizedMessageBody>, ApiKey> =>
  pipe(
    apiKey,
    E.fromPredicate(
      // TODO: Get "key-value" from configuration
      () => apiKey === 'key-value',
      () => ({ statusCode: 403 as const, returned: unauthorizedMessage })
    )
  );
