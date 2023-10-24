import * as t from "io-ts";
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { isGetNotificationPrice } from '../GetNotificationPriceRecord';
import { isNewNotificationRecord } from '../NewNotificationRecord';
import { NotificationPayments } from "../../generated/pnapi/NotificationPayments";

export const atLeastOneGetNotificationPriceRecordC = RA.exists(flow(isGetNotificationPrice, O.isSome));


export const atLeastOneGetNotificationPriceRecordMatchingPreviousNotificationRequest = pipe(
  R.Do,
  R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
  R.apS('getNotificationPriceRecordList', RA.filterMap(isGetNotificationPrice)),
  R.map(({ newNotificationRecordList, getNotificationPriceRecordList }) =>
    pipe(
      newNotificationRecordList,
      RA.exists((record) =>
        pipe(
          record.input.body.recipients,
          RA.exists(({ payments}) =>
            pipe(
              getNotificationPriceRecordList,
              RA.exists(
                ({ input: { paTaxId, noticeCode }, output }) =>
                  // Check if there is at least one payment that matches the criteria
                  (payments as NotificationPayments).some((payment) => {
                    return t.boolean.is(payment.pagoPa?.creditorTaxId) &&
                      payment.pagoPa?.creditorTaxId === paTaxId &&
                      payment.pagoPa?.creditorTaxId === record.input.body.senderTaxId &&
                      payment.pagoPa.noticeCode === noticeCode &&
                      output.statusCode === 200;
                  })
              )
            )
          )
        )
      )
    )
  )
);