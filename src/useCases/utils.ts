import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Response } from '../domain/types';

// TODO: Get "key-value" from repository or configuration?
export const onValidApiKey =
  (apiKey: ApiKey) =>
  <S extends 200 | 202, T>(valid: Response<S, T>) =>
    pipe(
      valid,
      E.fromPredicate(
        () => apiKey === 'key-value',
        () => ({ statusCode: 401 as const, returned: undefined })
      )
    );
