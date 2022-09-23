import * as TE from 'fp-ts/TaskEither';
import { ApiKey } from '../generated/definitions/ApiKey';
import {
  GetNotificationDetailRecord,
  GetNotificationDetailRepository,
} from '../domain/GetNotificationDetailRepository';
import { Iun } from '../generated/definitions/Iun';

export const GetNotificationDetailUseCase =
  (_repository: GetNotificationDetailRepository) =>
  (_apiKey: ApiKey) =>
  (_iun: Iun): TE.TaskEither<Error, GetNotificationDetailRecord['output']> =>
    TE.left(new Error('Not implemented'));

export type GetNotificationDetailUseCase = ReturnType<typeof GetNotificationDetailUseCase>;
