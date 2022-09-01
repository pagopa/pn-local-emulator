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
      E.map((_) => makeNewNotificationResponse(body)(crypto.randomUUID())),
      E.map((returned) => ({ statusCode: 202 as const, returned })),
      E.map((output) => makeNewNotificationRecord({ input: { apiKey, body }, output })),
      E.toUnion,
      repository.insert,
      TE.map((record) => record.output)
    );
export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
