import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../generated/pnapi/IUN';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/pnapi/NotificationAttachmentDownloadMetadataResponse';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';
import { computeSnapshotSlim } from './Snapshot';
import { authorizeApiKey } from './authorize';

export type GetNotificationDocumentMetadataRecord = AuditRecord & {
  type: 'GetNotificationDocumentMetadataRecord';
  input: { apiKey: string; iun: IUN; docIdx: number };
  output:
    | Response<200, NotificationAttachmentDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export const makeNotificationAttachmentDownloadMetadataResponse =
  (env: DomainEnv) =>
  (document: Notification['documents'][0]): NotificationAttachmentDownloadMetadataResponse => ({
    filename: document.ref.key,
    contentType: document.contentType,
    contentLength: 0,
    sha256: document.digests.sha256,
    url: `${env.downloadDocumentURL.href}/${env.sampleStaticPdfFileName}`,
  });

export const makeGetNotificationDocumentMetadataRecord =
  (env: DomainEnv) =>
  (input: GetNotificationDocumentMetadataRecord['input']) =>
  (records: ReadonlyArray<Record>): GetNotificationDocumentMetadataRecord => ({
    type: 'GetNotificationDocumentMetadataRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() =>
        pipe(
          computeSnapshotSlim(env)(records),
          RA.filterMap(O.fromEither),
          RA.chain((notification) => (notification.iun === input.iun ? notification.documents : RA.empty)),
          // the types of docIdx don't fit (one is a string the other is a number)
          // for the moment just convert the most convenient
          RA.filterWithIndex((i, document) => (document.docIdx || i.toString()) === input.docIdx.toString()),
          RA.last,
          O.map(makeNotificationAttachmentDownloadMetadataResponse(env)),
          O.map((document) => ({ statusCode: 200 as const, returned: document })),
          O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
        )
      ),
      E.toUnion
    ),
  });
