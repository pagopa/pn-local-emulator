import { pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { isGetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { isConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
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
