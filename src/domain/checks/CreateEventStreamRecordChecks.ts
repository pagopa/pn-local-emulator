import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { and } from 'fp-ts/Predicate';
import {
  hasTimelineEventTypeToTimeline,
  isCreateEventStreamRecord,
  isSuccessfulResponse,
} from '../CreateEventStreamRecordRepository';

export const hasCreateStreamWithEventTypeTimeline = flow(
  RA.filterMap(
    flow(isCreateEventStreamRecord, O.filter(pipe(hasTimelineEventTypeToTimeline, and(isSuccessfulResponse))))
  ),
  RA.isNonEmpty
);
