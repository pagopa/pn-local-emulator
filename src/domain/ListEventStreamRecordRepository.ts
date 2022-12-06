import * as Apply from 'fp-ts/Apply';
import { pipe } from 'fp-ts/lib/function';
import * as R from 'fp-ts/Reader';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { ApiKey } from '../generated/definitions/ApiKey';
import { StreamListResponse } from '../generated/streams/StreamListResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

export type ListEventStreamRecord = AuditRecord & {
  type: 'ListEventStreamRecord';
  input: { apiKey: ApiKey };
  output: Response<200, StreamListResponse> | Response<403, UnauthorizedMessageBody>;
};

export type ListEventStreamRecordRepository = Repository<ListEventStreamRecord>;

export const makeListEventStreamRecord: R.Reader<
  DomainEnv & {
    request: ListEventStreamRecord['input'];
    createEventStreamRecordList: ReadonlyArray<CreateEventStreamRecord>;
  },
  ListEventStreamRecord
> = Apply.sequenceS(R.Apply)({
  type: R.of('ListEventStreamRecord' as const),
  input: (input) => input.request,
  output: (input) =>
    pipe(
      authorizeApiKey(input.request.apiKey),
      E.map(() => ({
        statusCode: 200 as const,
        returned: pipe(
          input.createEventStreamRecordList,
          RA.filterMap((record) => (record.output.statusCode === 200 ? O.some(record.output.returned) : O.none))
        ),
      })),
      E.toUnion
    ),
  loggedAt: (input) => input.dateGenerator(),
});
