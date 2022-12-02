import { pipe } from 'fp-ts/lib/function';
import * as Apply from 'fp-ts/Apply';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { evaluateReport, Report } from '../domain/reportengine/reportengine';
import { report } from '../domain/checks/report';
import { SystemEnv } from './SystemEnv';

export const GetChecklistResultUseCase =
  ({ recordRepository, createNotificationRequestRecordRepository }: SystemEnv) =>
  (): TE.TaskEither<Error, Report> =>
    pipe(
      Apply.sequenceS(TE.ApplySeq)({
        recordList: recordRepository.list(),
        createNotificationRequestList: createNotificationRequestRecordRepository.list(),
      }),
      TE.map(({ recordList, createNotificationRequestList }) =>
        pipe(recordList, RA.concatW(createNotificationRequestList))
      ),
      TE.map(evaluateReport(report))
    );

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
