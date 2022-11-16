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
} from '../domain/NewNotificationRepository';
import { authorizeApiKey } from '../domain/authorize';
import { SystemEnv } from './SystemEnv';

export const SendNotificationUseCase =
  ({ createNotificationRequestRecordRepository, dateGenerator }: SystemEnv) =>
  (apiKey: ApiKey) =>
  (body: NewNotificationRequest): TE.TaskEither<Error, NewNotificationRecord['output']> =>
    pipe(
      // authorize the key
      authorizeApiKey(apiKey),
      E.map((_) => makeNewNotificationResponse(body)(crypto.randomUUID())),
      E.map((returned) => ({ statusCode: 202 as const, returned })),
      E.toUnion,
      (output) => makeNewNotificationRecord({ input: { apiKey, body }, output, createdAt: dateGenerator() }),
      createNotificationRequestRecordRepository.insert,
      TE.map((record) => record.output)
    );
export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
