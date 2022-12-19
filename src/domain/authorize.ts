import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { Problem } from '../generated/pnapi/Problem';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';

export const authorizeApiKey = (apiKey: string): E.Either<Response<403, Problem & UnauthorizedMessageBody>, string> =>
  pipe(
    apiKey,
    E.fromPredicate(
      // TODO: Get "key-value" from configuration
      () => apiKey === 'key-value',
      () => unauthorizedResponse
    )
  );
