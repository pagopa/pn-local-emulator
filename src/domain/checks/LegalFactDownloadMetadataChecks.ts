import { flow, pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isDownloadRecord } from '../DownloadRecord';
import { Record } from '../Repository';
import { isLegalFactDownloadMetadataRecord } from '../LegalFactDownloadMetadataRecord';
import * as DownloadRecordChecks from './DownloadRecordChecks';

export const getLegalFactDownloadMetadataRecord = flow(
  RA.filterMap(isLegalFactDownloadMetadataRecord),
  RA.exists(({ output }) => output.statusCode === 200)
);

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

export const downloadedNotificationDocumentC: R.Reader<ReadonlyArray<Record>, boolean> = pipe(
  getLegalFactDownloadMetadataRecord,
  P.and(hasCalledDownloadEndpointForLegalFactC)
);
