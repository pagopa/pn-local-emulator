import { pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as O from 'fp-ts/Option';
import { Reader } from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isGetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { isConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { isDownloadRecord } from '../DownloadRecord';
import { Record } from '../Repository';
import { matchesAtLeastOneIunC } from './ConsumeEventStreamRecordChecks';

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

const calledDownloadEndpointC = pipe(
  R.Do,
  R.apS('getNotificationDocumentMetadataRecordList', RA.filterMap(isGetNotificationDocumentMetadataRecord)),
  R.apS('downloadRecordList', RA.filterMap(isDownloadRecord)),
  R.map(({ getNotificationDocumentMetadataRecordList, downloadRecordList }) =>
    pipe(
      getNotificationDocumentMetadataRecordList,
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

export const downloadedNotificationDocumentC: Reader<ReadonlyArray<Record>, boolean> = pipe(
  getNotificationDocumentMetadataC,
  P.and(calledDownloadEndpointC)
);
