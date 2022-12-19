import { flow, pipe } from 'fp-ts/lib/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import { Reader } from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { isConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { isGetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { Record } from '../Repository';
import * as ConsumeEventStreamRecordChecks from './ConsumeEventStreamRecordChecks';

// TODO add tests
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

export const matchesIunAndHasPAGOPAAsAttachmentName: Reader<ReadonlyArray<Record>, boolean> = RA.exists(
  flow(RA.of, pipe(getPaymentNotificationMetadataWithIunC, P.and(hasPAGOPAAsAttachmentNameC)))
);
