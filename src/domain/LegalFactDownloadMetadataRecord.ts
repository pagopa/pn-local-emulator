import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../generated/pnapi/IUN';
import { LegalFactCategory } from '../generated/pnapi/LegalFactCategory';
import { LegalFactDownloadMetadataResponse } from '../generated/pnapi/LegalFactDownloadMetadataResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { computeSnapshot } from './Snapshot';
import { Response, UnauthorizedMessageBody } from './types';
import { makePnDownloadDocumentURL } from './PnDownloadDocumentURL';

export type LegalFactDownloadMetadataRecord = AuditRecord & {
  type: 'LegalFactDownloadMetadataRecord';
  input: { apiKey: string; legalFactType: LegalFactCategory; legalFactId: string; iun: IUN };
  output: Response<200, LegalFactDownloadMetadataResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export const isLegalFactDownloadMetadataRecord = (record: Record): O.Option<LegalFactDownloadMetadataRecord> =>
  record.type === 'LegalFactDownloadMetadataRecord' ? O.some(record) : O.none;

export const makeLegalFactDownloadMetadataResponse = (env: DomainEnv): LegalFactDownloadMetadataResponse => ({
  filename: 'dummy-filename',
  contentLength: 10,
  url: makePnDownloadDocumentURL(env),
});

export const makeLegalFactDownloadMetadataRecord =
  (env: DomainEnv) =>
  (input: LegalFactDownloadMetadataRecord['input']) =>
  (records: ReadonlyArray<Record>): LegalFactDownloadMetadataRecord => ({
    type: 'LegalFactDownloadMetadataRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() =>
        pipe(
          computeSnapshot(env)(records),
          RA.filterMap(O.fromEither),
          RA.findLast((notification) => notification.iun === input.iun),
          O.map((_) => ({ statusCode: 200 as const, returned: makeLegalFactDownloadMetadataResponse(env) })),
          O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
        )
      ),
      E.toUnion
    ),
  });
