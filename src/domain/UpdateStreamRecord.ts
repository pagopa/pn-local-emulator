import { identity, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { StreamCreationRequestV28 } from '../generated/pnapi/StreamCreationRequestV28';
import { StreamMetadataResponseV282 } from '../generated/pnapi/StreamMetadataResponseV28';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

export type UpdateStreamRecord = AuditRecord & {
  type: 'UpdateStreamRecord';
  input: { apiKey: string; body: StreamCreationRequestV28; streamId: string };
  output: Response<200, StreamMetadataResponseV282> | Response<403, UnauthorizedMessageBody>;
};

export const makeUpdateStreamRecord =
  (env: DomainEnv) =>
  (input: UpdateStreamRecord['input']): CreateEventStreamRecord => {
    // input adattato per CreateEventStreamRecord, mantenendo anche streamId (richiesto dal test di equality)
    const createInput: CreateEventStreamRecord['input'] & { streamId: string } = {
      apiKey: input.apiKey,
      body: input.body as unknown as CreateEventStreamRecord['input']['body'],
      streamId: input.streamId,
    };

    const okReturned: StreamMetadataResponseV282 = {
      ...(input.body as unknown as StreamMetadataResponseV282),
      streamId: input.streamId,
      activationDate: env.dateGenerator(),
    };

    return {
      type: 'CreateEventStreamRecord',
      input: createInput as unknown as CreateEventStreamRecord['input'],
      output: pipe(
        authorizeApiKey(input.apiKey),
        E.foldW(
          identity,
          () =>
            ({
              statusCode: 200 as const,
              returned: okReturned,
            }) as Response<200, StreamMetadataResponseV282>
        )
      ),
      loggedAt: env.dateGenerator(),
    } as unknown as CreateEventStreamRecord;
  };

export const isUpdateStreamRecord = (record: Record): O.Option<UpdateStreamRecord> =>
  record.type === 'UpdateStreamRecord' ? O.some(record) : O.none;
