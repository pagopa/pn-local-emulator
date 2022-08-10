import crypto from 'crypto';
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
import { Logger } from '../logger';
import { onValidApiKey } from './utils';

export const SendNotificationUseCase =
  (logger: Logger, repository: NewNotificationRepository) =>
  (apiKey: ApiKey) =>
  (body: NewNotificationRequest): TE.TaskEither<Error, NewNotificationRecord['output']> => {
    const input = { apiKey, body };
    const returned = makeNewNotificationResponse(body)(crypto.randomUUID());
    const output = onValidApiKey(apiKey)({ statusCode: 202 as const, returned });
    const record = makeNewNotificationRecord({ input, output });
    return pipe(
      repository.insert(record),
      TE.map((_) => {
        logger.debug(record);
        return record.output;
      })
    );
  };

export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
