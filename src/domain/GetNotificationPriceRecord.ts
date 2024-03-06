/* eslint-disable sonarjs/prefer-single-boolean-return */
/* eslint-disable functional/no-let */

import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { NotificationPriceResponseV23 } from '../generated/pnapi/NotificationPriceResponseV23';
import { NotificationRecipientV23 } from '../generated/pnapi/NotificationRecipientV23';
import { NotificationPaymentItem } from '../generated/pnapi/NotificationPaymentItem';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';
import { computeSnapshot, Snapshot } from './Snapshot';

export type GetNotificationPriceRecord = AuditRecord & {
  type: 'GetNotificationPriceRecord';
  input: { apiKey: string; paTaxId: string; noticeCode: string };
  output: Response<200, NotificationPriceResponseV23> | Response<403, UnauthorizedMessageBody>;
};

export const isGetNotificationPrice = (record: Record) =>
  record.type === 'GetNotificationPriceRecord' ? O.some(record) : O.none;

const findNotification = (request: GetNotificationPriceRecord['input'], snapshot: Snapshot) =>
  pipe(
    snapshot,
    RA.filterMap(O.FromEither.fromEither),
    RA.findLast(({ recipients }) =>
      RA.some((recipient: NotificationRecipientV23) => {
        const payments = recipient.payments || [];

        return RA.exists((payment) => {
          const pagoPa = (payment as NotificationPaymentItem)?.pagoPa;
          if (pagoPa && pagoPa.noticeCode === request.noticeCode && pagoPa.creditorTaxId === request.paTaxId) {
            return true;
          } /* 
          this will probably be needed in the future
          else {
            const f24 = (payment as NotificationPaymentItem)?.f24;
            if (f24) {
              return true;
            }
          } */
          return false;
        })(payments);
      })(recipients)
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
          (notification) => ({
            statusCode: 200 as const,
            returned: {
              iun: notification.iun,
              partialPrice: env.partialPrice,
              totalPrice: env.totalPrice,
              vat: notification.vat,
              pafee: notification.paFee,
              refinementDate: env.dateGenerator(),
              notificationViewDate: env.dateGenerator(),

              sendFee: env.sendFee,
              analogCost: env.analogCost,
            },
          })
        )
      ),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
