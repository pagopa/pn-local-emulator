import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { Reader } from 'fp-ts/Reader';
import * as ConsumeEventStreamRecord from '../ConsumeEventStreamRecordRepository';
import * as CreateEventStreamRecordRepository from '../CreateEventStreamRecordRepository';
import { NewStatusEnum } from '../../generated/streams/ProgressResponseElement';
import { AllRecord } from '../Repository';

export const requestWithStreamIdProvidedHasBeenMadeC = pipe(
  R.Do,
  R.apS('createEventStreamRecordList', RA.filterMap(CreateEventStreamRecordRepository.isCreateEventStreamRecord)),
  R.apS('consumeEventStreamRecordList', RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord)),
  R.map(({ createEventStreamRecordList, consumeEventStreamRecordList }) =>
    pipe(
      consumeEventStreamRecordList,
      // Filter only consumeEventStreamRecord with a successful response
      RA.filterMap((record) =>
        ConsumeEventStreamRecord.hasSuccessfulResponse(record) ? O.some(record.input.streamId) : O.none
      ),
      RA.exists(
        CreateEventStreamRecordRepository.existsCreateEventStreamRecordWhitStreamId(createEventStreamRecordList)
      )
    )
  )
);

export const hasNewStatusPropertySetToAcceptedC = flow(
  RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord),
  RA.exists(
    ({ output }) =>
      output.statusCode === 200 &&
      pipe(
        output.returned,
        RA.exists(({ newStatus }) => newStatus === NewStatusEnum.ACCEPTED)
      )
  )
);

export const hasIunPopulatedC = flow(
  RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord),
  RA.exists(
    ({ output }) =>
      output.statusCode === 200 &&
      pipe(
        output.returned,
        RA.exists(({ iun }) => pipe(iun, O.fromNullable, O.isSome))
      )
  )
);

export const hasProperlyConsumedEvents: Reader<ReadonlyArray<AllRecord>, boolean> = RA.exists(
  flow(RA.of, pipe(hasNewStatusPropertySetToAcceptedC, P.and(hasIunPopulatedC)))
);
