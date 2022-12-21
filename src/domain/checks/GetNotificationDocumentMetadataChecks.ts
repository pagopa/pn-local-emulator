import { pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { Reader } from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isGetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { isConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { Record } from '../Repository';
import { matchesAtLeastOneIunC } from './ConsumeEventStreamRecordChecks';
import * as DownloadRecordChecks from './DownloadRecordChecks';

export const getNotificationDocumentMetadataC = pipe(
  R.Do,
  R.apS('consumeEventStreamRecordList', RA.filterMap(isConsumeEventStreamRecord)),
  R.apS('getNotificationDocumentMetadataRecordList', RA.filterMap(isGetNotificationDocumentMetadataRecord)),
  R.map(({ consumeEventStreamRecordList, getNotificationDocumentMetadataRecordList }) =>
    pipe(
      getNotificationDocumentMetadataRecordList,
      RA.map(({ input }) => input.iun),
      RA.exists(matchesAtLeastOneIunC(consumeEventStreamRecordList))
    )
  )
);

export const downloadedNotificationDocumentC: Reader<ReadonlyArray<Record>, boolean> = pipe(
  getNotificationDocumentMetadataC,
  P.and(DownloadRecordChecks.calledDownloadEndpointC)
);
