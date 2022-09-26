import * as TE from 'fp-ts/TaskEither';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import {
  GetNotificationDetailRecord,
  GetNotificationDetailRecordRepository,
} from '../domain/GetNotificationDetailRepository';

export const GetNotificationDetailUseCase =
  (_repository: GetNotificationDetailRecordRepository) =>
  (_apiKey: ApiKey) =>
  (_iun: Iun): TE.TaskEither<Error, GetNotificationDetailRecord['output']> =>
    TE.left(new Error('Not implemented'));

export type GetNotificationDetailUseCase = ReturnType<typeof GetNotificationDetailUseCase>;
