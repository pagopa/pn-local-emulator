import { pipe } from 'fp-ts/lib/function';
import * as Apply from 'fp-ts/Apply';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { preLoadChecklist } from '../domain/checklist/preLoadChecklist';
import { ChecklistResult, evalChecklist } from '../domain/checklist/types';
import { uploadToS3Checklist } from '../domain/checklist/uploadToS3Checklist';
import { checkNotificationStatusChecklist } from '../domain/checklist/checkNotificationStatusChecklist';
import { SystemEnv } from './SystemEnv';

export const GetChecklistResultUseCase =
  ({ preLoadRecordRepository, uploadToS3RecordRepository, findNotificationRequestRecordRepository }: SystemEnv) =>
  (): TE.TaskEither<Error, ChecklistResult> =>
    pipe(
      Apply.sequenceS(TE.ApplySeq)({
        preLoadList: preLoadRecordRepository.list(),
        uploadList: uploadToS3RecordRepository.list(),
        notificationStatusList: findNotificationRequestRecordRepository.list(),
      }),
      (x) => x,
      TE.map(({ preLoadList, uploadList, notificationStatusList }) => ({
        preLoadChecklistIn: preLoadList,
        uploadChecklistIn: RA.concatW(preLoadList)(uploadList),
        notificationStatusList,
      })),
      TE.map(({ preLoadChecklistIn, uploadChecklistIn, notificationStatusList }) =>
        pipe(
          evalChecklist(preLoadChecklist)(preLoadChecklistIn),
          RA.alt(() => evalChecklist(uploadToS3Checklist)(uploadChecklistIn)),
          RA.alt(() => evalChecklist(checkNotificationStatusChecklist)(notificationStatusList))
        )
      )
    );

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
