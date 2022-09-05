import { pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { preLoadChecklist } from '../domain/checklist/preLoadChecklist';
import { ChecklistResult, evalChecklist } from '../domain/checklist/types';
import { uploadToS3Checklist } from '../domain/checklist/uploadToS3Checklist';
import { PreLoadRecordRepository } from '../domain/PreLoadRepository';
import { UploadToS3RecordRepository } from '../domain/UploadToS3RecordRepository';

const checklistConcat = (l: ChecklistResult) => (r: ChecklistResult) => RA.concat(l)(r);

export const GetChecklistResultUseCase =
  (preLoadRecordRepository: PreLoadRecordRepository, uploadToS3RecordRepository: UploadToS3RecordRepository) =>
  (): TE.TaskEither<Error, ChecklistResult> => {
    const preLoadChecklistResult = pipe(preLoadRecordRepository.list(), TE.map(evalChecklist(preLoadChecklist)));
    const uploadToS3ChecklistResult = pipe(
      TE.of(RA.concatW),
      TE.ap(preLoadRecordRepository.list()),
      TE.ap(uploadToS3RecordRepository.list()),
      TE.map(evalChecklist(uploadToS3Checklist))
    );
    // TODO: Figure out how improve this part, the pipe should be writtable as following
    // pipe(TE.of(RA.concat), TE.ap(preLoadChecklistResult), TE.ap(uploadToS3ChecklistResult));
    // without the need of the checklistConcat function
    return pipe(TE.of(checklistConcat), TE.ap(preLoadChecklistResult), TE.ap(uploadToS3ChecklistResult));
  };

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
