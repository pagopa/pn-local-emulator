import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { preLoadChecklist } from '../domain/checklist/preLoadChecklist';
import { ChecklistResult, evalChecklist } from '../domain/checklist/types';
import { PreLoadRecordRepository } from '../domain/PreLoadRepository';

export const GetChecklistResultUseCase =
  (preLoadRecordRepository: PreLoadRecordRepository) => (): TE.TaskEither<Error, ChecklistResult> =>
    pipe(preLoadRecordRepository.list(), TE.map(evalChecklist(preLoadChecklist)));

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
