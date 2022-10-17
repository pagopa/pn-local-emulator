import { pipe } from 'fp-ts/lib/function';
import * as Apply from 'fp-ts/Apply';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { preLoadChecklist } from '../domain/checklist/preLoadChecklist';
import { ChecklistResult, evalChecklist } from '../domain/checklist/types';
import { uploadToS3Checklist } from '../domain/checklist/uploadToS3Checklist';
import { SystemEnv } from './SystemEnv';

export const GetChecklistResultUseCase =
  ({ preLoadRecordRepository, uploadToS3RecordRepository }: SystemEnv) =>
  (): TE.TaskEither<Error, ChecklistResult> =>
    pipe(
      Apply.sequenceS(TE.ApplySeq)({
        preLoadList: preLoadRecordRepository.list(),
        uploadList: uploadToS3RecordRepository.list(),
      }),
      TE.map(({ preLoadList, uploadList }) => ({
        preLoadChecklistIn: preLoadList,
        uploadChecklistIn: RA.concatW(preLoadList)(uploadList),
      })),
      TE.map(({ preLoadChecklistIn, uploadChecklistIn }) => {
        const preLoadChecklistResult = evalChecklist(preLoadChecklist)(preLoadChecklistIn);
        const uploadChecklistResult = evalChecklist(uploadToS3Checklist)(uploadChecklistIn);
        return RA.concat(preLoadChecklistResult)(uploadChecklistResult);
      })
    );

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
