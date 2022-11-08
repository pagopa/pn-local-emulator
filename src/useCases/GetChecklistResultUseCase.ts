import { pipe } from 'fp-ts/lib/function';
import * as Apply from 'fp-ts/Apply';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { evaluateReport, Report } from '../domain/reportengine/reportengine';
import { report } from '../domain/checks/report';
import { SystemEnv } from './SystemEnv';

export const GetChecklistResultUseCase =
  ({ preLoadRecordRepository, uploadToS3RecordRepository, createNotificationRequestRecordRepository }: SystemEnv) =>
  (): TE.TaskEither<Error, Report> =>
    pipe(
      Apply.sequenceS(TE.ApplySeq)({
        preLoadList: preLoadRecordRepository.list(),
        uploadList: uploadToS3RecordRepository.list(),
        createNotificationRequestList: createNotificationRequestRecordRepository.list(),
      }),
      TE.map(({ preLoadList, uploadList, createNotificationRequestList }) =>
        pipe(preLoadList, RA.concatW(uploadList), RA.concatW(createNotificationRequestList))
      ),
      TE.map(evaluateReport(report))
    );

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
