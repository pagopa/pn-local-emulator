import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { isGetNotificationPrice } from '../GetNotificationPriceRecord';
import { isNewNotificationRecord } from '../NewNotificationRecord';

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
          RA.exists(({ payment }) =>
            pipe(
              getNotificationPriceRecordList,
              RA.exists(
                ({ input: { paTaxId, noticeCode }, output }) =>
                  payment?.creditorTaxId === paTaxId &&
                  payment?.creditorTaxId === record.input.body.senderTaxId &&
                  payment.noticeCode === noticeCode &&
                  // Without this check, the system accepts requests
                  // that result in an unauthorized response.
                  output.statusCode === 200
              )
            )
          )
        )
      )
    )
  )
);
