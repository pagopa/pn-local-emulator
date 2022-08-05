import * as TE from 'fp-ts/TaskEither';
import { NewNotificationRequest } from '../generated/definitions/NewNotificationRequest';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRecord, NewNotificationRepository } from '../domain/NewNotificationRepository';
import crypto from 'crypto';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { pipe } from 'fp-ts/lib/function';
import { Logger } from '../logger';

const makeNewNotificationResponse = (input: NewNotificationRequest) => (notificationRequestId: string): NewNotificationResponse => {
  return {
    idempotenceToken: input.idempotenceToken,
    paProtocolNumber: input.paProtocolNumber,
    notificationRequestId: notificationRequestId,
  };
};

export const makeNewNotificationRecord = (record: Omit<NewNotificationRecord, 'type'>): NewNotificationRecord => ({
  type: 'NewNotificationRecord',
  ...record,
});

export const SendNotificationUseCase =
  (logger: Logger, repository: NewNotificationRepository) =>
  (apiKey: ApiKey) =>
  (body: NewNotificationRequest): TE.TaskEither<Error, NewNotificationRecord['output']> => {
    const input = { apiKey, body };
    const returned = makeNewNotificationResponse(body)(crypto.randomUUID());
    const output =
          apiKey === 'key-value'
        ? { statusCode: 202 as const, returned }
        : { statusCode: 401 as const, returned: undefined };
    const record = makeNewNotificationRecord({ input, output });
    return pipe(
      repository.insert(record),
      TE.map((_) => {
        logger.debug(record);
        return _.output;
      })
    );
  };

export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
