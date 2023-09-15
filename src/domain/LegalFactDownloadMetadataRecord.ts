/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../generated/pnapi/IUN';
import { LegalFactCategory } from '../generated/pnapi/LegalFactCategory';
import { LegalFactDownloadMetadataResponse } from '../generated/pnapi/LegalFactDownloadMetadataResponse';
import { Problem } from '../generated/pnapi/Problem';
import { makeLogger } from '../logger';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { computeSnapshot } from './Snapshot';
import { notFoundResponse, Response, UnauthorizedMessageBody } from './types';
import { makePnDownloadDocumentURL } from './PnDownloadDocumentURL';

const log = makeLogger();

export type LegalFactDownloadMetadataRecord = AuditRecord & {
  type: 'LegalFactDownloadMetadataRecord';
  input: { apiKey: string; legalFactType: LegalFactCategory; legalFactId: string; iun: IUN };
  output:
    | Response<200, LegalFactDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404, Problem>;
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
          RA.findLast(
            (notification) =>
              notification.iun === input.iun &&
              notification.timeline.some(
                (t: any) =>
                  t.legalFactsIds &&
                  t.legalFactsIds.some((legalFact: any) => {
                    const isLegalFactIdMatch = legalFact.key === `safestorage://${input.legalFactId}`;
                    log.info(
                      `Comparing legalFactId: ${legalFact.key} with safestorage://${input.legalFactId}. Match: ${isLegalFactIdMatch}`
                    );
                    return isLegalFactIdMatch;
                  })
              )
          ),
          O.map((_) => ({ statusCode: 200 as const, returned: makeLegalFactDownloadMetadataResponse(env) })),
          O.getOrElseW(() => notFoundResponse('PN_DELIVERY_FILEINFONOTFOUND'))
        )
      ),
      E.toUnion
    ),
  });
