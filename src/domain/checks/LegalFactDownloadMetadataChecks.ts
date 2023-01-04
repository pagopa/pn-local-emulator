import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isDownloadRecord } from '../DownloadRecord';
import { Record } from '../Repository';
import { isLegalFactDownloadMetadataRecord, LegalFactDownloadMetadataRecord } from '../LegalFactDownloadMetadataRecord';
import { GetNotificationDetailRecord, isGetNotificationDetailRecord } from '../GetNotificationDetailRecord';
import * as DownloadRecordChecks from './DownloadRecordChecks';

const hasCalledDownloadEndpointForLegalFactC = pipe(
  R.Do,
  R.apS('downloadRecordList', RA.filterMap(isDownloadRecord)),
  R.apS('legalFactDownloadMetadataRecordList', RA.filterMap(isLegalFactDownloadMetadataRecord)),
  R.map(({ downloadRecordList, legalFactDownloadMetadataRecordList }) =>
    pipe(
      legalFactDownloadMetadataRecordList,
      RA.every(DownloadRecordChecks.metadataRecordMatchesDownloadRecordC(downloadRecordList))
    )
  )
);

const matchesIunC =
  ({ output }: GetNotificationDetailRecord) =>
  (legalFactDownloadMetadataRecord: LegalFactDownloadMetadataRecord) =>
    pipe(output.statusCode === 200 && output.returned.iun === legalFactDownloadMetadataRecord.input.iun);

const matchTimelineValuesC =
  ({ output }: GetNotificationDetailRecord) =>
  ({ input }: LegalFactDownloadMetadataRecord) =>
    pipe(
      output.statusCode === 200 &&
        output.returned.timeline.some(({ legalFactsIds }) =>
          legalFactsIds?.some(({ category, key }) => category === input.legalFactType && key === input.legalFactId)
        )
    );

const matchesLegalFactDownloadMetadataRecordC =
  (legalFactDownloadMetadataRecord: LegalFactDownloadMetadataRecord) =>
  (getNotificationDetailRecord: GetNotificationDetailRecord) =>
    legalFactDownloadMetadataRecord.output.statusCode === 200 &&
    matchesIunC(getNotificationDetailRecord)(legalFactDownloadMetadataRecord) &&
    matchTimelineValuesC(getNotificationDetailRecord)(legalFactDownloadMetadataRecord);

export const getLegalFactDownloadMetadataRecord = pipe(
  R.Do,
  R.apS('legalFactDownloadMetadataRecordList', RA.filterMap(isLegalFactDownloadMetadataRecord)),
  R.apS('getNotificationDetailRecordList', RA.filterMap(isGetNotificationDetailRecord)),
  R.map(({ legalFactDownloadMetadataRecordList, getNotificationDetailRecordList }) =>
    pipe(
      legalFactDownloadMetadataRecordList,
      RA.every((legalFactDownloadMetadataRecord) =>
        pipe(
          getNotificationDetailRecordList,
          RA.exists(matchesLegalFactDownloadMetadataRecordC(legalFactDownloadMetadataRecord))
        )
      )
    )
  )
);

export const downloadedLegalFactsDocumentC: R.Reader<ReadonlyArray<Record>, boolean> = pipe(
  getLegalFactDownloadMetadataRecord,
  P.and(hasCalledDownloadEndpointForLegalFactC)
);
