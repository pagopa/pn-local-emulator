import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as ConsumeEventStreamRecord from '../ConsumeEventStreamRecordRepository';
import * as CreateEventStreamRecordRepository from '../CreateEventStreamRecordRepository';

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
