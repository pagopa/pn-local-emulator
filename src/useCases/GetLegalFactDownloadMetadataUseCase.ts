import { flow, pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import {
  LegalFactDownloadMetadataRecord,
  makeLegalFactDownloadMetadataResponse,
} from '../domain/LegalFactDownloadMetadataRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { LegalFactCategory } from '../generated/definitions/LegalFactCategory';
import { LegalFactId } from '../generated/definitions/LegalFactId';
import { authorizeApiKey } from '../domain/authorize';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const GetLegalFactDownloadMetadataUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey) =>
  (iun: Iun) =>
  (legalFactType: LegalFactCategory) =>
  (legalFactId: LegalFactId): TE.TaskEither<Error, LegalFactDownloadMetadataRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(computeSnapshot(env)),
          TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
          TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
          TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
          TE.map(
            flow(
              RA.filterMap(O.fromEither),
              RA.findLast((notification) => notification.iun === iun),
              O.map((_) => ({ statusCode: 200 as const, returned: makeLegalFactDownloadMetadataResponse(env) })),
              O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
            )
          )
        )
      ),
      flow(E.sequence(TE.ApplicativePar), TE.map(E.toUnion)),
      TE.map((output) => ({
        type: 'LegalFactDownloadMetadataRecord' as const,
        input: { apiKey, iun, legalFactType, legalFactId },
        output,
      })),
      TE.chain(env.getLegalFactDownloadMetadataRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetLegalFactDownloadMetadataUseCase = ReturnType<typeof GetLegalFactDownloadMetadataUseCase>;
