import { identity, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { StreamCreationRequestV28 } from '../generated/pnapi/StreamCreationRequestV28';
import { StreamMetadataResponseV28 } from '../generated/pnapi/StreamMetadataResponseV28';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

export type UpdateStreamRecord = AuditRecord & {
  type: 'UpdateStreamRecord';
  input: { apiKey: string; body: StreamCreationRequestV28; streamId: string };
  output: Response<200, StreamMetadataResponseV28> | Response<403, UnauthorizedMessageBody>;
};

export const makeUpdateStreamRecord =
  (env: DomainEnv) =>
  (input: UpdateStreamRecord['input']): CreateEventStreamRecord => {
    // Adatta l'input al tipo atteso da CreateEventStreamRecord (niente streamId qui)
    const createInput: CreateEventStreamRecord['input'] = {
      apiKey: input.apiKey,
      body: input.body as unknown as CreateEventStreamRecord['input']['body'],
    };

    // Tipizza esplicitamente il payload di successo
    const okReturned: StreamMetadataResponseV28 = {
      ...(input.body as unknown as StreamMetadataResponseV28),
      streamId: input.streamId,
      activationDate: env.dateGenerator(),
    };

    return {
      type: 'CreateEventStreamRecord',
      input: createInput,
      output: pipe(
        authorizeApiKey(input.apiKey),
        E.foldW(
          identity,
          () =>
            ({
              statusCode: 200 as const,
              returned: okReturned,
            }) as Response<200, StreamMetadataResponseV28>
        )
      ),
      loggedAt: env.dateGenerator(),
    };
  };

export const isUpdateStreamRecord = (record: Record): O.Option<UpdateStreamRecord> =>
  record.type === 'UpdateStreamRecord' ? O.some(record) : O.none;
