import { pipe } from 'fp-ts/function';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import { isGetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { isGetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { isDownloadRecord } from '../DownloadRecord';

export const calledDownloadEndpointC = pipe(
  R.Do,
  R.apS('getNotificationDocumentMetadataRecordList', RA.filterMap(isGetNotificationDocumentMetadataRecord)),
  R.apS('getPaymentNotificationMetadataRecordList', RA.filterMap(isGetPaymentNotificationMetadataRecord)),
  R.apS('downloadRecordList', RA.filterMap(isDownloadRecord)),
  R.map(({ getNotificationDocumentMetadataRecordList, getPaymentNotificationMetadataRecordList, downloadRecordList }) =>
    pipe(
      RA.concatW(getNotificationDocumentMetadataRecordList)(getPaymentNotificationMetadataRecordList),
      RA.filterMap(({ output }) => (output.statusCode === 200 ? O.fromNullable(output.returned.url) : O.none)),
      RA.every((url) =>
        pipe(
          downloadRecordList,
          RA.exists(({ input }) => url.endsWith(input.url))
        )
      )
    )
  )
);
