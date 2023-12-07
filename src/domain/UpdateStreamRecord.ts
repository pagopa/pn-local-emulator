import { identity, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { StreamCreationRequest } from '../generated/pnapi/StreamCreationRequest';
import { StreamMetadataResponse } from '../generated/pnapi/StreamMetadataResponse';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

export type UpdateStreamRecord = AuditRecord & {
  type: 'UpdateStreamRecord';
  input: { apiKey: string; body: StreamCreationRequest; streamId: string };
  output: Response<200, StreamMetadataResponse> | Response<403, UnauthorizedMessageBody>;
};

export const makeUpdateStreamRecord =
  (env: DomainEnv) =>
  (input: UpdateStreamRecord['input']): CreateEventStreamRecord => ({
    type: 'CreateEventStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(identity, () => ({
        statusCode: 200 as const,
        returned: { ...input.body, streamId: input.streamId, activationDate: env.dateGenerator() },
      }))
    ),
    loggedAt: env.dateGenerator(),
  });

export const isUpdateStreamRecord = (record: Record): O.Option<UpdateStreamRecord> =>
  record.type === 'UpdateStreamRecord' ? O.some(record) : O.none;
