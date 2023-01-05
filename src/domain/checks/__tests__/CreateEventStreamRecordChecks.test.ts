import * as CreateEventStreamRecordChecks from '../CreateEventStreamRecordChecks';
import { CreateEventStreamRecords } from '../../__tests__/createEventStreamRecordData';

describe('CreateEventStreamRecordChecks', () => {
  it('hasCreatedStreamWithEventTypeTimelineC', () => {
    const check = CreateEventStreamRecordChecks.hasCreatedStreamWithEventTypeTimelineC;
    expect(check(CreateEventStreamRecords.empty)).toStrictEqual(false);
    expect(check(CreateEventStreamRecords.withoutEventType)).toStrictEqual(false);
    expect(check(CreateEventStreamRecords.unauthorized)).toStrictEqual(false);
    expect(check(CreateEventStreamRecords.withEventTypeTimeline)).toStrictEqual(true);
  });
});
