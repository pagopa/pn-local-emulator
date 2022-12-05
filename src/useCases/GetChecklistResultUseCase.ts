import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { evaluateReport, Report } from '../domain/reportengine/reportengine';
import { report } from '../domain/checks/report';
import { SystemEnv } from './SystemEnv';

export const GetChecklistResultUseCase =
  ({ recordRepository }: SystemEnv) =>
  (): TE.TaskEither<Error, Report> =>
    pipe(recordRepository.list(), TE.map(evaluateReport(report)));

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
