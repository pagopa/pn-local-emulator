import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { StreamMetadataResponse } from '../generated/streams/StreamMetadataResponse';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';
import { isCreateEventStreamRecord } from './CreateEventStreamRecord';

export type GetEventStreamByIdRecord = AuditRecord & {
  type: 'GetEventStreamByIdRecord';
  input: { apiKey: string; streamId: string };
  output: Response<200, StreamMetadataResponse> | Response<403, UnauthorizedMessageBody>;
};

export const makeGetEventStreamByIdRecord =
  (env: DomainEnv) =>
  (input: GetEventStreamByIdRecord['input']) =>
  (records: ReadonlyArray<Record>): GetEventStreamByIdRecord => ({
    type: 'GetEventStreamByIdRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() =>
        pipe(
          records,
          RA.filterMap(isCreateEventStreamRecord),
          RA.filterMap(({ output }) => (output.statusCode === 200 ? O.some(output.returned) : O.none)),
          RA.findFirst(({ streamId }) => streamId === input.streamId),
          O.map((streamMetadata) => ({
            statusCode: 200 as const,
            returned: { ...streamMetadata },
          })),
          O.getOrElseW(() => unauthorizedResponse) // Here we're returning 403, because the OpenAPI doesn't allow 404
        )
      ),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
