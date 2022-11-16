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

  it('hasReceivedEventWithStatusAcceptedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasReceivedEventWithStatusAcceptedC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    // FIXME: fix the useCaseData
    // expect(check(useCaseData.consumeEventsOnCreatedStream)).toStrictEqual(true);
  });
});
