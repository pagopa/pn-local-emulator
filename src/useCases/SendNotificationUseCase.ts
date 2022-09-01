import crypto from 'crypto';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { NewNotificationRequest } from '../generated/definitions/NewNotificationRequest';
import { ApiKey } from '../generated/definitions/ApiKey';
import {
  makeNewNotificationRecord,
  makeNewNotificationResponse,
  NewNotificationRecord,
  NewNotificationRepository,
} from '../domain/NewNotificationRepository';
import { authorizeApiKey } from './utils';

export const SendNotificationUseCase =
  (repository: NewNotificationRepository) =>
  (apiKey: ApiKey) =>
  (body: NewNotificationRequest): TE.TaskEither<Error, NewNotificationRecord['output']> =>
    pipe(
      // authorize the key
      authorizeApiKey(apiKey),
      // create the response on valid key
      E.map((_) => ({ statusCode: 202 as const, returned: makeNewNotificationResponse(body)(crypto.randomUUID()) })),
      E.toUnion,
      (output) => repository.insert(makeNewNotificationRecord({ input: { apiKey, body }, output })),
      TE.map((record) => record.output)
    );
export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
