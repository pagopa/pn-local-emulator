import * as ConsumeEventStreamRecordChecks from '../ConsumeEventStreamRecordChecks';
import * as useCaseData from './data';

describe('ConsumeEventStreamRecordChecks', () => {
  it('requestWithStreamIdProvidedHasBeenMadeC', () => {
    const check = ConsumeEventStreamRecordChecks.requestWithStreamIdProvidedHasBeenMadeC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStream)).toStrictEqual(true);
  });

  it('hasNewStatusPropertySetToAcceptedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasNewStatusPropertySetToAcceptedC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStream)).toStrictEqual(true);
  });
});
