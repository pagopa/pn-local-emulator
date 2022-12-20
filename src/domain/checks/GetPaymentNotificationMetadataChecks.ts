import { flow, pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { Reader } from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import { isConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { isGetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { Record } from '../Repository';
import { isDownloadRecord } from '../DownloadRecord';
import * as ConsumeEventStreamRecordChecks from './ConsumeEventStreamRecordChecks';

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

export const hasPAGOPAAsAttachmentNameC = flow(
  RA.filterMap(isGetPaymentNotificationMetadataRecord),
  RA.exists(({ input }) => input.attachmentName === 'PAGOPA')
);

const calledDownloadEndpointC = pipe(
  R.Do,
  R.apS('getPaymentNotificationMetadataRecordList', RA.filterMap(isGetPaymentNotificationMetadataRecord)),
  R.apS('downloadRecordList', RA.filterMap(isDownloadRecord)),
  R.map(({ getPaymentNotificationMetadataRecordList, downloadRecordList }) =>
    pipe(
      getPaymentNotificationMetadataRecordList,
      RA.filterMap(({ output }) => (output.statusCode === 200 ? O.fromNullable(output.returned.url) : O.none)),
      RA.exists((url) =>
        pipe(
          downloadRecordList,
          RA.exists(({ input }) => url.endsWith(input.url))
        )
      )
    )
  )
);

export const matchesIunAndHasPAGOPAAsAttachmentName: Reader<ReadonlyArray<Record>, boolean> = pipe(
  getPaymentNotificationMetadataWithIunC,
  P.and(hasPAGOPAAsAttachmentNameC)
);

export const downloadedPaymentDocumentC = pipe(matchesIunAndHasPAGOPAAsAttachmentName, P.and(calledDownloadEndpointC));
