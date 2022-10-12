import crypto from 'crypto';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { CheckNotificationStatusRecordRepository } from '../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';
import {
  GetPaymentNotificationMetadataRecord,
  GetPaymentNotificationMetadataRepository,
} from '../domain/GetPaymentNotificationMetadataRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { authorizeApiKey } from '../domain/authorize';
import { computeSnapshot } from '../domain/Snapshot';
import { makeNotificationAttachmentDownloadMetadataResponse } from '../domain/GetNotificationDocumentMetadataRepository';

export const GetPaymentNotificationMetadataUseCase =
  (
    occurrencesAfterComplete: number,
    senderPAId: string,
    createNotificationRequestRecordRepository: NewNotificationRepository,
    findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository,
    consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository,
    getPaymentNotificationMetadataRepository: GetPaymentNotificationMetadataRepository,
    iunGenerator: () => string = crypto.randomUUID,
    dateGenerator: () => Date = () => new Date()
  ) =>
  (apiKey: ApiKey) =>
  (iun: Iun) =>
  (recipientId: number) =>
  (attachmentName: string): TE.TaskEither<Error, GetPaymentNotificationMetadataRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(computeSnapshot(occurrencesAfterComplete, senderPAId, iunGenerator, dateGenerator)),
          TE.ap(createNotificationRequestRecordRepository.list()),
          TE.ap(findNotificationRequestRecordRepository.list()),
          TE.ap(consumeEventStreamRecordRepository.list()),
          TE.map(
            flow(
              RA.filterMap(O.fromEither),
              RA.chain((notification) => (notification.iun === iun ? notification.documents : RA.empty)),
              // the types of docIdx doesn't fit (one is string the other is a number)
              // for the moment just convert the most convenient
              RA.findFirst((document) => document.ref.key === attachmentName.toString()),
              O.map(makeNotificationAttachmentDownloadMetadataResponse),
              O.map((document) => ({ statusCode: 200 as const, returned: document })),
              O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
            )
          )
        )
      ),
      flow(E.sequence(TE.ApplicativePar), TE.map(E.toUnion)),
      TE.map((output) => ({
        type: 'GetPaymentNotificationMetadataRecord' as const,
        input: { apiKey, iun, recipientId, attachmentName },
        output,
      })),
      TE.chain(getPaymentNotificationMetadataRepository.insert),
      TE.map((record) => record.output)
    );

export type GetPaymentNotificationMetadataUseCase = ReturnType<typeof GetPaymentNotificationMetadataUseCase>;
