import { flow, pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isGetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { Record } from '../Repository';
import { isDownloadRecord } from '../DownloadRecord';
import * as DownloadRecordChecks from './DownloadRecordChecks';

export const getNotificationDocumentMetadataC = flow(
  RA.filterMap(isGetNotificationDocumentMetadataRecord),
  RA.exists(({ output }) => output.statusCode === 200)
);

const hasCalledDownloadEndpointForNotificationDocumentC = pipe(
  R.Do,
  R.apS('downloadRecordList', RA.filterMap(isDownloadRecord)),
  R.apS('getNotificationDocumentMetadataRecord', RA.filterMap(isGetNotificationDocumentMetadataRecord)),
  R.map(({ downloadRecordList, getNotificationDocumentMetadataRecord }) =>
    pipe(
      getNotificationDocumentMetadataRecord,
      RA.exists(DownloadRecordChecks.metadataRecordMatchesDownloadRecordC(downloadRecordList))
    )
  )
);

export const downloadedNotificationDocumentC: R.Reader<ReadonlyArray<Record>, boolean> = pipe(
  getNotificationDocumentMetadataC,
  P.and(hasCalledDownloadEndpointForNotificationDocumentC)
);
