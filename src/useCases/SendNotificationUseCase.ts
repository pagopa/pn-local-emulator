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
import { makeResponse } from './utils';

export const SendNotificationUseCase =
  (repository: NewNotificationRepository) =>
  (apiKey: ApiKey) =>
  (body: NewNotificationRequest): TE.TaskEither<Error, NewNotificationRecord['output']> =>
    pipe(
      TE.of(makeNewNotificationResponse(body)(crypto.randomUUID())),
      TE.chain(makeResponse(apiKey)(202)),
      TE.map((output) => makeNewNotificationRecord({ input: { apiKey, body }, output })),
      TE.chain(repository.insert),
      TE.map((record) => record.output)
    );
export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
