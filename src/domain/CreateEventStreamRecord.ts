import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import { identity } from 'fp-ts/function';
import { StreamCreationRequest } from '../generated/pnapi/StreamCreationRequest';
import { StreamMetadataResponse } from '../generated/pnapi/StreamMetadataResponse';
import { Record, AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';

export type CreateEventStreamRecord = AuditRecord & {
  type: 'CreateEventStreamRecord';
  input: { apiKey: string; body: StreamCreationRequest };
  output: Response<200, StreamMetadataResponse> | Response<403, UnauthorizedMessageBody>;
};

export const isCreateEventStreamRecord = (record: Record): O.Option<CreateEventStreamRecord> =>
  record.type === 'CreateEventStreamRecord' ? O.some(record) : O.none;

export const makeCreateEventStreamRecord =
  (env: DomainEnv) =>
  (input: CreateEventStreamRecord['input']): CreateEventStreamRecord => ({
    type: 'CreateEventStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(identity, () => ({
        statusCode: 200 as const,
        returned: { ...input.body, streamId: env.uuidGenerator(), activationDate: env.dateGenerator() },
      }))
    ),
    loggedAt: env.dateGenerator(),
  });
