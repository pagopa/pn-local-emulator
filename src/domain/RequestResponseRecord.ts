import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { RequestResponse } from './RequestResponse';


export type RequestResponseRecord = AuditRecord & {
    type: 'RequestResponseRecord';
    input: { apiKey: string; requestCurl: string; responseJson: string };
    output: Response<200, RequestResponse> | Response<403, UnauthorizedMessageBody>;
};

export const isRequestResponseRecord = (record: Record): O.Option<RequestResponseRecord> =>
  record.type === 'RequestResponseRecord' ? O.some(record) : O.none;

  export const makeRequestResponseRecord =
  (env: DomainEnv) =>
  (input: RequestResponseRecord['input']) =>
  (records: ReadonlyArray<Record>): RequestResponseRecord => ({
    type: 'RequestResponseRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() => ({
        statusCode: 200 as const,
        returned: pipe(
          records,
          RA.filterMap(isRequestResponseRecord),
          RA.map((record) => ({
            requestCurl: record.input.requestCurl,
            responseJson: record.input.responseJson
          })),
        ),
      })),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
