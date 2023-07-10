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

const matchesLegalFactDownloadMetadataRecordC =
  ({ input, output }: LegalFactDownloadMetadataRecord) =>
  (notificationRecord: GetNotificationDetailRecord) =>
    output.statusCode === 200 &&
    notificationRecord.output.statusCode === 200 &&
    notificationRecord.output.returned.iun === input.iun &&
    pipe(
      notificationRecord.output.returned.timeline,
      RA.exists(({ legalFactsIds }) =>
        pipe(
          legalFactsIds || [],
          RA.exists(({ category, key }) => category === input.legalFactType && key.endsWith(input.legalFactId))
        )
      )
    );

export const getLegalFactDownloadMetadataRecord = pipe(
  R.Do,
  R.apS('legalFactDownloadMetadataRecordList', RA.filterMap(isLegalFactDownloadMetadataRecord)),
  R.apS('getNotificationDetailRecordList', RA.filterMap(isGetNotificationDetailRecord)),
  R.map(({ legalFactDownloadMetadataRecordList, getNotificationDetailRecordList }) =>
    pipe(
      pipe(
        legalFactDownloadMetadataRecordList,
        RA.filter((item) =>
          pipe(getNotificationDetailRecordList, RA.some(matchesLegalFactDownloadMetadataRecordC(item)))
        )
      ),
      RA.isNonEmpty
    )
  )
);

export const downloadedLegalFactsDocumentC: R.Reader<ReadonlyArray<Record>, boolean> = pipe(
  getLegalFactDownloadMetadataRecord,
  P.and(hasCalledDownloadEndpointForLegalFactC)
);
