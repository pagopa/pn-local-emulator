import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import {
  LegalFactDownloadMetadataRecord,
  makeLegalFactDownloadMetadataRecord,
} from '../domain/LegalFactDownloadMetadataRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const GetLegalFactDownloadMetadataUseCase =
  (env: SystemEnv) =>
  (apiKey: LegalFactDownloadMetadataRecord['input']['apiKey']) =>
  (iun: LegalFactDownloadMetadataRecord['input']['iun']) =>
  (legalFactType: LegalFactDownloadMetadataRecord['input']['legalFactType']) =>
  (
    legalFactId: LegalFactDownloadMetadataRecord['input']['legalFactId']
  ): TE.TaskEither<Error, LegalFactDownloadMetadataRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeLegalFactDownloadMetadataRecord(env)({ apiKey, iun, legalFactType, legalFactId })),
      TE.chain(env.recordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetLegalFactDownloadMetadataUseCase = ReturnType<typeof GetLegalFactDownloadMetadataUseCase>;
