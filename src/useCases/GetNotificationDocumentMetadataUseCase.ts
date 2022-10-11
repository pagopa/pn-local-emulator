import { flow, pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import {
  GetNotificationDocumentMetadataRecord,
  makeNotificationAttachmentDownloadMetadataResponse,
} from '../domain/GetNotificationDocumentMetadataRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { computeSnapshot } from '../domain/Snapshot';
import { SystemEnv } from '../domain/SystemEnv';

export const GetNotificationDocumentMetadataUseCase =
  ({ occurrencesAfterComplete, senderPAId, iunGenerator, dateGenerator, ...env }: SystemEnv) =>
  (apiKey: ApiKey) =>
  (iun: Iun) =>
  (docIdx: number): TE.TaskEither<Error, GetNotificationDocumentMetadataRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(computeSnapshot(occurrencesAfterComplete, senderPAId, iunGenerator, dateGenerator)),
          TE.ap(env.createNotificationRequestRecordRepository.list()),
          TE.ap(env.findNotificationRequestRecordRepository.list()),
          TE.ap(env.consumeEventStreamRecordRepository.list()),
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
      TE.chain(env.getNotificationDocumentMetadataRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type GetNotificationDocumentMetadataUseCase = ReturnType<typeof GetNotificationDocumentMetadataUseCase>;
