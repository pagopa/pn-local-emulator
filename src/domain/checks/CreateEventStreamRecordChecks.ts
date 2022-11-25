import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { and } from 'fp-ts/Predicate';
import { hasTimelineEventTypeToTimeline, isCreateEventStreamRecord } from '../CreateEventStreamRecordRepository';

const hasCreatedStreamWithEventTypeTimelinePredicate = pipe(
  hasTimelineEventTypeToTimeline,
  and((record) => record.output.statusCode === 200)
);

// TODO: Maybe we can refactor this and create a generic atLeastN function
export const hasCreatedStreamWithEventTypeTimelineC = flow(
  RA.filterMap(flow(isCreateEventStreamRecord, O.filter(hasCreatedStreamWithEventTypeTimelinePredicate))),
  RA.isNonEmpty
);
