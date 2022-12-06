import * as ConsumeEventStreamRecordChecks from '../ConsumeEventStreamRecordChecks';
import * as useCaseData from './data';
import { hasIunPopulatedC } from '../ConsumeEventStreamRecordChecks';

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

  it('hasIunPopulatedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasIunPopulatedC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStream)).toStrictEqual(true);
  });

  it('hasProperlyConsumedEvents', () => {
    const check = ConsumeEventStreamRecordChecks.hasProperlyConsumedEvents;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStreamWithOnlyInValidationEvent)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStream)).toStrictEqual(true);
  });
});
