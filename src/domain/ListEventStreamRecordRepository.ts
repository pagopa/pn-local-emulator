import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { StreamListResponse } from '../generated/streams/StreamListResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

export type ListEventStreamRecord = AuditRecord & {
  type: 'ListEventStreamRecord';
  input: { apiKey: string };
  output: Response<200, StreamListResponse> | Response<403, UnauthorizedMessageBody>;
};

export const makeListEventStreamRecord =
  (env: DomainEnv) =>
  (input: ListEventStreamRecord['input']) =>
  (createEventStreamRecordList: ReadonlyArray<CreateEventStreamRecord>): ListEventStreamRecord => ({
    type: 'ListEventStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() => ({
        statusCode: 200 as const,
        returned: pipe(
          createEventStreamRecordList,
          RA.filterMap((record) => (record.output.statusCode === 200 ? O.some(record.output.returned) : O.none))
        ),
      })),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
