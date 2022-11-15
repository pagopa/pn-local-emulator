import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { LegalFactDownloadMetadataRecord } from '../domain/LegalFactDownloadMetadataRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { LegalFactCategory } from '../generated/definitions/LegalFactCategory';
import { LegalFactId } from '../generated/definitions/LegalFactId';
import { SystemEnv } from './SystemEnv';

export const GetLegalFactDownloadMetadataUseCase =
  (_env: SystemEnv) =>
  (_apiKey: ApiKey) =>
  (_iun: Iun) =>
  (_legalFactType: LegalFactCategory) =>
  (_legalFactId: LegalFactId): TE.TaskEither<Error, LegalFactDownloadMetadataRecord['output']> =>
    pipe(TE.left(new Error('NYI')));

export type GetLegalFactDownloadMetadataUseCase = ReturnType<typeof GetLegalFactDownloadMetadataUseCase>;
