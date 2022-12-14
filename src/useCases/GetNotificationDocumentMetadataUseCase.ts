import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import {
  GetNotificationDocumentMetadataRecord,
  makeGetNotificationDocumentMetadataRecord,
} from '../domain/GetNotificationDocumentMetadataRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const GetNotificationDocumentMetadataUseCase =
  (env: SystemEnv) =>
  (apiKey: GetNotificationDocumentMetadataRecord['input']['apiKey']) =>
  (iun: GetNotificationDocumentMetadataRecord['input']['iun']) =>
  (
    docIdx: GetNotificationDocumentMetadataRecord['input']['docIdx']
  ): TE.TaskEither<Error, GetNotificationDocumentMetadataRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeGetNotificationDocumentMetadataRecord(env)({ apiKey, iun, docIdx })),
      TE.chain(env.recordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetNotificationDocumentMetadataUseCase = ReturnType<typeof GetNotificationDocumentMetadataUseCase>;
