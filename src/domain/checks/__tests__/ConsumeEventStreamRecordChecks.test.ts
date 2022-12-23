import * as ConsumeEventStreamRecordChecks from '../ConsumeEventStreamRecordChecks';
import * as useCaseData from './data';
import { hasIunPopulatedC } from '../ConsumeEventStreamRecordChecks';
import * as data from '../../__tests__/data';

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
    const check = ConsumeEventStreamRecordChecks.hasProperlyConsumedEvents(data.makeTestSystemEnv());
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.createEventStreamRecordWithoutEventType)).toStrictEqual(false);
    expect(check(useCaseData.failedRequestCreateEventStream)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStreamWithOnlyInValidationEvent)).toStrictEqual(false);
    expect(check(useCaseData.consumeEventsOnCreatedStream)).toStrictEqual(true);
  });

  it('matchesAtLeastOneIun', () => {
    const check = ConsumeEventStreamRecordChecks.matchesAtLeastOneIunC;
    expect(check([])(data.aIun.valid)).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecord])(data.aIun.valid)).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered])(data.aIun.invalid)).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered])(data.aIun.valid)).toStrictEqual(true);
  });
});
