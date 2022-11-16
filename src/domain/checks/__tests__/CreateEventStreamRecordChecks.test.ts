import * as CreateEventStreamRecordChecks from '../CreateEventStreamRecordChecks';
import * as useCaseData from './data';

describe('CreateEventStreamRecordChecks', () => {
  it('hasCreatedStreamWithEventTypeTimeline', () => {
    const check = CreateEventStreamRecordChecks.hasCreatedStreamWithEventTypeTimeline;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithEventTypeTimeline)).toStrictEqual(true);
  });
});
