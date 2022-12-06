import { identity, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { NewNotificationRequest } from '../generated/pnapi/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/pnapi/NewNotificationResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { Record, AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type NewNotificationRecord = AuditRecord & {
  type: 'NewNotificationRecord';
  input: { apiKey: string; body: NewNotificationRequest };
  output: Response<202, NewNotificationResponse> | Response<403, UnauthorizedMessageBody>;
};

export const isNewNotificationRecord = (record: Record): O.Option<NewNotificationRecord> =>
  record.type === 'NewNotificationRecord' ? O.some(record) : O.none;

export const makeNewNotificationRecord =
  (env: DomainEnv) =>
  (input: NewNotificationRecord['input']): NewNotificationRecord => ({
    type: 'NewNotificationRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(identity, () => ({
        statusCode: 202,
        returned: {
          idempotenceToken: input.body.idempotenceToken,
          paProtocolNumber: input.body.paProtocolNumber,
          notificationRequestId: env.iunGenerator(),
        },
      }))
    ),
  });
