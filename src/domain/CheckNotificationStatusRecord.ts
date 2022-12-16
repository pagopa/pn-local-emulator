import { identity, pipe, flow } from 'fp-ts/function';
import * as t from 'io-ts';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRequestStatusResponse } from '../generated/pnapi/NewNotificationRequestStatusResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { computeSnapshot } from './Snapshot';

export type CheckNotificationStatusRecord = AuditRecord & {
  type: 'CheckNotificationStatusRecord';
  input: {
    apiKey: string;
    body: { paProtocolNumber: string; idempotenceToken?: string } | { notificationRequestId: string };
  };
  output: Response<200, NewNotificationRequestStatusResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export const isCheckNotificationStatusRecord = (record: Record): O.Option<CheckNotificationStatusRecord> =>
  record.type === 'CheckNotificationStatusRecord' ? O.some(record) : O.none;

export const makeCheckNotificationStatusRecord =
  (env: DomainEnv) =>
  (input: CheckNotificationStatusRecord['input']) =>
  (records: ReadonlyArray<Record>): CheckNotificationStatusRecord => ({
    type: 'CheckNotificationStatusRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(identity, () =>
        pipe(
          computeSnapshot(env)(records),
          RA.findFirst(
            flow(E.toUnion, (notificationRequest) =>
              'notificationRequestId' in input.body
                ? notificationRequest.notificationRequestId === input.body.notificationRequestId
                : notificationRequest.paProtocolNumber === input.body.paProtocolNumber &&
                  notificationRequest.idempotenceToken === input.body.idempotenceToken
            )
          ),
          O.map(
            E.fold(
              (nr) => ({ ...nr, notificationRequestStatus: 'WAITING' }),
              (n) =>
                t.exact(NewNotificationRequestStatusResponse).encode({ ...n, notificationRequestStatus: 'ACCEPTED' })
            )
          ),
          O.map((response) => ({ statusCode: 200 as const, returned: response })),
          O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
        )
      )
    ),
  });
