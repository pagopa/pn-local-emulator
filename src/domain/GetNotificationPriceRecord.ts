/* eslint-disable sonarjs/prefer-single-boolean-return */
/* eslint-disable functional/no-let */

import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { NotificationPriceResponse } from '../generated/pnapi/NotificationPriceResponse';
import { NotificationRecipientV21 } from '../generated/pnapi/NotificationRecipientV21';
import { NotificationPaymentItem } from '../generated/pnapi/NotificationPaymentItem';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';
import { computeSnapshot, Snapshot } from './Snapshot';
import { Notification } from './Notification';

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
      RA.some((recipient: NotificationRecipientV21) => {
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
              amount: getNotificationAmountBasedOnNotification(notification),
              refinementDate: env.dateGenerator(),
              notificationViewDate: env.dateGenerator(),
            },
          })
        )
      ),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });

  const getNotificationAmountBasedOnNotification = (notification: Notification): number => {
    let amountToReturn: number = 0;
    if (notification.notificationFeePolicy === 'FLAT_RATE') {
      return amountToReturn;
    }

    if (notification.notificationFeePolicy === 'DELIVERY_MODE') {
      notification.recipients.some(singleRecipient => {
        singleRecipient.payments?.some(singlePayment => {
          if (singlePayment.pagoPa?.applyCost === true || singlePayment.f24?.applyCost === true) {
            const notificationPaFee: number = notification.paFee ? notification.paFee : 0;
            const localAmountToReturn: number = 100 + notificationPaFee;
            if (singleRecipient.digitalDomicile?.type === 'PEC') {
              amountToReturn = localAmountToReturn;
              return true;
            } else {
              // 200 è un valore fisso per indicare il costo della spedizione cartacea
              amountToReturn = localAmountToReturn + 200;
              return true;
            }
          }
        });
      });
    }

    return amountToReturn;
  };
  