import { flow, pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { isGetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { Record } from '../Repository';
import { isDownloadRecord } from '../DownloadRecord';
import * as ConsumeEventStreamRecordChecks from './ConsumeEventStreamRecordChecks';
import * as DownloadRecordChecks from './DownloadRecordChecks';

export const getPaymentNotificationMetadataWithIunC = pipe(
  R.Do,
  R.apS('consumeEventStreamRecordList', RA.filterMap(isConsumeEventStreamRecord)),
  R.apS('getPaymentNotificationMetadataRecordList', RA.filterMap(isGetPaymentNotificationMetadataRecord)),
  R.map(({ consumeEventStreamRecordList, getPaymentNotificationMetadataRecordList }) =>
    pipe(
      getPaymentNotificationMetadataRecordList,
      RA.map(({ input }) => input.iun),
      RA.exists(ConsumeEventStreamRecordChecks.matchesAtLeastOneIunC(consumeEventStreamRecordList))
    )
  )
);

const hasPAGOPAAsAttachmentNameC = flow(
  RA.filterMap(isGetPaymentNotificationMetadataRecord),
  RA.exists(({ input }) => input.attachmentName === 'PAGOPA')
);

export const matchesIunAndHasPAGOPAAsAttachmentName: R.Reader<ReadonlyArray<Record>, boolean> = pipe(
  getPaymentNotificationMetadataWithIunC,
  P.and(hasPAGOPAAsAttachmentNameC)
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
