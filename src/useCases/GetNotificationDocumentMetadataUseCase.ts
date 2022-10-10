import { hole } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { GetNotificationDocumentMetadataRecord } from '../domain/GetNotificationDocumentMetadataRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';

export const GetNotificationDocumentMetadataUseCase =
  () =>
  (_apiKey: ApiKey) =>
  (_iun: Iun) =>
  (_docIdx: number): TE.TaskEither<Error, GetNotificationDocumentMetadataRecord['output']> =>
    hole();

export type GetNotificationDocumentMetadataUseCase = ReturnType<typeof GetNotificationDocumentMetadataUseCase>;
