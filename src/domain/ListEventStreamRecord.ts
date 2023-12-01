import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { StreamListResponse } from '../generated/pnapi/StreamListResponse';
import { StreamListElement } from '../generated/pnapi/StreamListElement';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { isCreateEventStreamRecord } from './CreateEventStreamRecord';

export type ListEventStreamRecord = AuditRecord & {
  type: 'ListEventStreamRecord';
  input: { apiKey: string };
  output: Response<200, StreamListResponse> | Response<403, UnauthorizedMessageBody>;
};

export const makeListEventStreamRecord =
  (env: DomainEnv) =>
  (input: ListEventStreamRecord['input']) =>
  (records: ReadonlyArray<Record>): ListEventStreamRecord => ({
    type: 'ListEventStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() => ({
        statusCode: 200 as const,
        returned: pipe(
          records,
          RA.filterMap(isCreateEventStreamRecord),
          RA.filterMap((record) => (record.output.statusCode === 200 ? O.some(record.output.returned) : O.none)),
          RA.map((eventStream) => t.exact(StreamListElement).encode(eventStream))
        ),
      })),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
