// DeleteNotificationRecord.ts

import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { IUN } from '../generated/pnapi/IUN';
import { RequestStatus } from '../generated/pnapi/RequestStatus';
import { AuditRecord, Record } from './Repository';
import { HttpErrorMessageBody, Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';

export type DeleteNotificationRecord = AuditRecord & {
  type: 'DeleteNotificationRecord';
  input: { apiKey: string; iun: IUN };
  output: Response<202, RequestStatus> | Response<403, UnauthorizedMessageBody> | Response<404, HttpErrorMessageBody>;
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
        returned: { 
          status: "success",
          details: [
            {
              code: "NOTIFICATION_CANCELLATION_ACCEPTED",
              level: "INFO",
              detail: "Parameter not valid",
            },
        ],}, // Replace "success" with an appropriate status value
      })),
      E.toUnion
    ),    
    loggedAt: env.dateGenerator(),
  });

export const isDeleteNotificationRecord = (record: Record): O.Option<DeleteNotificationRecord> =>
  record.type === 'DeleteNotificationRecord' ? O.some(record) : O.none;
