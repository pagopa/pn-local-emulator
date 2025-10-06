import { identity, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { StreamCreationRequestV28 } from '../generated/pnapi/StreamCreationRequestV28';
import { StreamMetadataResponseV28 } from '../generated/pnapi/StreamMetadataResponseV28';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';

export type UpdateStreamRecord = AuditRecord & {
  type: 'UpdateStreamRecord';
  input: { apiKey: string; body: StreamCreationRequestV28; streamId: string };
  output: Response<200, StreamMetadataResponseV28> | Response<403, UnauthorizedMessageBody>;
};

export const makeUpdateStreamRecord =
  (env: DomainEnv) =>
  (input: UpdateStreamRecord['input']): UpdateStreamRecord => ({
    type: 'UpdateStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(identity, () => {
        const returned: StreamMetadataResponseV28 = {
          title: (input.body as any).title,
          eventType: (input.body as any).eventType,
          filterValues: (input.body as any).filterValues ?? [],
          streamId: input.streamId,
          activationDate: env.dateGenerator(), // Date here; io-ts encoder will serialize to ISO string
        } as const;
        return { statusCode: 200 as const, returned };
      })
    ),
    loggedAt: env.dateGenerator(),
  });

export const isUpdateStreamRecord = (record: Record): O.Option<UpdateStreamRecord> =>
  record.type === 'UpdateStreamRecord' ? O.some(record) : O.none;
