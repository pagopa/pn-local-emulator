import { flow, pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isGetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { Record } from '../Repository';
import { isDownloadRecord } from '../DownloadRecord';
import * as DownloadRecordChecks from './DownloadRecordChecks';

export const matchesIunAndHasPAGOPAAsAttachmentName: R.Reader<ReadonlyArray<Record>, boolean> = flow(
  RA.filterMap(isGetPaymentNotificationMetadataRecord),
  RA.exists(({ input, output }) => input.attachmentName === 'PAGOPA' && output.statusCode === 200)
);

const hasCalledDownloadEndpointForPaymentDocumentC = pipe(
  R.Do,
  R.apS('downloadRecordList', RA.filterMap(isDownloadRecord)),
  R.apS('getPaymentNotificationMetadataRecordList', RA.filterMap(isGetPaymentNotificationMetadataRecord)),
  R.map(({ downloadRecordList, getPaymentNotificationMetadataRecordList }) =>
    pipe(
      getPaymentNotificationMetadataRecordList,
      RA.exists(DownloadRecordChecks.metadataRecordMatchesDownloadRecordC(downloadRecordList))
    )
  )
);

export const downloadedPaymentDocumentC = pipe(
  matchesIunAndHasPAGOPAAsAttachmentName,
  P.and(hasCalledDownloadEndpointForPaymentDocumentC)
);
