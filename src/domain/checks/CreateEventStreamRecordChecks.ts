import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { CreateEventStreamRecord, isCreateEventStreamRecord } from '../CreateEventStreamRecord';
import { EventTypeEnum } from '../../generated/pnapi/StreamCreationRequest';
const hasCreatedStreamWithEventTypeTimelinePredicate = (record: CreateEventStreamRecord) =>
  record.input.body.eventType === EventTypeEnum.TIMELINE && record.output.statusCode === 200;

// TODO: Maybe we can refactor this and create a generic atLeastN function
export const hasCreatedStreamWithEventTypeTimelineC = flow(
  RA.filterMap(flow(isCreateEventStreamRecord, O.filter(hasCreatedStreamWithEventTypeTimelinePredicate))),
  RA.isNonEmpty
);

export const existsCreateEventStreamRecordWhitStreamId =
  (records: ReadonlyArray<CreateEventStreamRecord>) => (streamId: string) =>
    pipe(
      records,
      RA.filterMap((record) => (record.output.statusCode === 200 ? O.some(record.output) : O.none)),
      RA.exists(({ returned }) => returned.streamId === streamId)
    );
