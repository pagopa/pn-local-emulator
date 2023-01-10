import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { NotificationPriceResponse } from '../generated/pnapi/NotificationPriceResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';
import { computeSnapshot, Snapshot } from './Snapshot';

export type GetNotificationPriceRecord = AuditRecord & {
  type: 'GetNotificationPriceRecord';
  input: { apiKey: string; paTaxId: string; noticeCode: string };
  output: Response<200, NotificationPriceResponse> | Response<403, UnauthorizedMessageBody>;
};

export const isGetNotificationPrice = (record: Record) =>
  record.type === 'GetNotificationPriceRecord' ? O.some(record) : O.none;

const findNotification = (request: GetNotificationPriceRecord['input'], snapshot: Snapshot) =>
  pipe(
    snapshot,
    RA.filterMap(O.FromEither.fromEither),
    RA.findLast(({ recipients }) =>
      pipe(
        recipients,
        RA.exists(
          ({ payment }) => payment?.creditorTaxId === request.paTaxId && payment?.noticeCode === request.noticeCode
        )
      )
    )
  );

export const makeGetNotificationPriceRecord =
  (env: DomainEnv) =>
  (input: GetNotificationPriceRecord['input']) =>
  (records: ReadonlyArray<Record>): GetNotificationPriceRecord => ({
    type: 'GetNotificationPriceRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() => findNotification(input, computeSnapshot(env)(records))),
      E.map(
        O.foldW(
          () => unauthorizedResponse,
          ({ iun }) => ({
            statusCode: 200 as const,
            returned: {
              iun,
              amount: `${env.notificationPrice}`,
              effectiveDate: env.dateGenerator(),
            },
          })
        )
      ),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
