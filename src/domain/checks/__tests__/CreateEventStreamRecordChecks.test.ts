import * as CreateEventStreamRecordChecks from '../CreateEventStreamRecordChecks';
import * as useCaseData from './data';

describe('CreateEventStreamRecordChecks', () => {
  it('hasCreateStreamWithEventTypeTimeline', () => {
    const check = CreateEventStreamRecordChecks.hasCreateStreamWithEventTypeTimeline;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithEventTypeTimeline)).toStrictEqual(true);
  });
});
