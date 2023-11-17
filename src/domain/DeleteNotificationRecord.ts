// DeleteNotificationRecord.ts

import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';
import { IUN } from '../generated/pnapi/IUN';

export type DeleteNotificationRecord = AuditRecord & {
  type: 'DeleteNotificationRecord';
  input: { apiKey: string; iun: IUN };
  output: Response<202> | Response<403, UnauthorizedMessageBody>;
};

export const makeDeleteNotificationRecord =
  (env: DomainEnv) =>
  (input: DeleteNotificationRecord['input']): DeleteNotificationRecord => ({
    type: 'DeleteNotificationRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() => ({
        statusCode: 202 as const,
        returned: undefined,
      })),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });

export const isDeleteNotificationRecord = (record: Record): O.Option<DeleteNotificationRecord> =>
  record.type === 'DeleteNotificationRecord' ? O.some(record) : O.none;
