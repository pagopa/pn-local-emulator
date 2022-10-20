import { pipe } from 'fp-ts/lib/function';
import * as Apply from 'fp-ts/Apply';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { preLoadChecklist } from '../domain/checklist/preLoadChecklist';
import { ChecklistResult, evalChecklist } from '../domain/checklist/types';
import { uploadToS3Checklist } from '../domain/checklist/uploadToS3Checklist';
import { sendPaymentNotificationChecklist } from '../domain/checklist/sendPaymentNotificationChecklist';
import { SystemEnv } from './SystemEnv';

export const GetChecklistResultUseCase =
  ({ preLoadRecordRepository, uploadToS3RecordRepository, createNotificationRequestRecordRepository }: SystemEnv) =>
  (): TE.TaskEither<Error, ChecklistResult> =>
    pipe(
      Apply.sequenceS(TE.ApplySeq)({
        preLoadList: preLoadRecordRepository.list(),
        uploadList: uploadToS3RecordRepository.list(),
        createNotificationRequestList: createNotificationRequestRecordRepository.list(),
      }),
      TE.map(({ preLoadList, uploadList, createNotificationRequestList }) => ({
        preLoadChecklistIn: preLoadList,
        uploadChecklistIn: RA.concatW(preLoadList)(uploadList),
        sendPaymentNotificationChecklistIn: pipe(
          preLoadList,
          RA.concatW(uploadList),
          RA.concatW(createNotificationRequestList)
        ),
      })),
      TE.map(({ preLoadChecklistIn, uploadChecklistIn, sendPaymentNotificationChecklistIn }) =>
        pipe(
          evalChecklist(preLoadChecklist)(preLoadChecklistIn),
          RA.concat(evalChecklist(uploadToS3Checklist)(uploadChecklistIn)),
          RA.concat(evalChecklist(sendPaymentNotificationChecklist)(sendPaymentNotificationChecklistIn))
        )
      )
    );

export type GetChecklistResultUseCase = ReturnType<typeof GetChecklistResultUseCase>;
