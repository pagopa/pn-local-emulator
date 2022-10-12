import crypto from 'crypto';
import { flow, pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import {
  GetNotificationDocumentMetadataRecord,
  GetNotificationDocumentMetadataRecordRepository,
  makeNotificationAttachmentDownloadMetadataResponse,
} from '../domain/GetNotificationDocumentMetadataRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { computeSnapshot } from '../domain/Snapshot';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { CheckNotificationStatusRecordRepository } from '../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';

export const GetNotificationDocumentMetadataUseCase =
  (
    occurrencesAfterComplete: number,
    senderPAId: string,
    createNotificationRequestRecordRepository: NewNotificationRepository,
    findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository,
    consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository,
    getNotificationDocumentMetadataRecordRepository: GetNotificationDocumentMetadataRecordRepository,
    iunGenerator: () => string = crypto.randomUUID,
    dateGenerator: () => Date = () => new Date()
  ) =>
  (apiKey: ApiKey) =>
  (iun: Iun) =>
  (docIdx: number): TE.TaskEither<Error, GetNotificationDocumentMetadataRecord['output']> =>
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
              // the types of docIdx don't fit (one is a string the other is a number)
              // for the moment just convert the most convenient
              RA.filterWithIndex((i, document) => (document.docIdx || i.toString()) === docIdx.toString()),
              RA.last,
              O.map(makeNotificationAttachmentDownloadMetadataResponse),
              O.map((document) => ({ statusCode: 200 as const, returned: document })),
              O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
            )
          )
        )
      ),
      flow(E.sequence(TE.ApplicativePar), TE.map(E.toUnion)),
      TE.map((output) => ({
        type: 'GetNotificationDocumentMetadataRecord' as const,
        input: { iun, apiKey, docIdx },
        output,
      })),
      TE.chain(getNotificationDocumentMetadataRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetNotificationDocumentMetadataUseCase = ReturnType<typeof GetNotificationDocumentMetadataUseCase>;
