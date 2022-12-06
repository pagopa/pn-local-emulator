import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import {
  GetPaymentNotificationMetadataRecord,
  makeGetPaymentNotificationMetadataRecord,
} from '../domain/GetPaymentNotificationMetadataRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const GetPaymentNotificationMetadataUseCase =
  (env: SystemEnv) =>
  (apiKey: GetPaymentNotificationMetadataRecord['input']['apiKey']) =>
  (iun: GetPaymentNotificationMetadataRecord['input']['iun']) =>
  (recipientId: GetPaymentNotificationMetadataRecord['input']['recipientId']) =>
  (
    attachmentName: GetPaymentNotificationMetadataRecord['input']['attachmentName']
  ): TE.TaskEither<Error, GetPaymentNotificationMetadataRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeGetPaymentNotificationMetadataRecord(env)({ apiKey, iun, recipientId, attachmentName })),
      TE.chain(env.recordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetPaymentNotificationMetadataUseCase = ReturnType<typeof GetPaymentNotificationMetadataUseCase>;
