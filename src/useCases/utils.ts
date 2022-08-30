import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Response } from '../domain/types';

type SuccessStatusCode = 200 | 202;

// TODO: Get "key-value" from repository or configuration?
const onValidApiKey =
  (apiKey: ApiKey) =>
  <S extends SuccessStatusCode, T>(valid: Response<S, T>) =>
    pipe(
      valid,
      E.fromPredicate(
        () => apiKey === 'key-value',
        () => ({ statusCode: 401 as const, returned: undefined })
      )
    );

export const makeResponse =
  (apiKey: ApiKey) =>
  (successStatusCode: SuccessStatusCode) =>
  <T>(returned: T) =>
    pipe(
      { statusCode: successStatusCode as null, returned },
      onValidApiKey(apiKey),
      TE.fromEither,
      TE.toUnion,
      TE.fromTask
    );
