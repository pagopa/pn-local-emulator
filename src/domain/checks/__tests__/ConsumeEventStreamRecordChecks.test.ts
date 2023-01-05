import * as ConsumeEventStreamRecordChecks from '../ConsumeEventStreamRecordChecks';
import * as data from '../../__tests__/data';
import { unauthorizedResponse } from '../../types';

describe('ConsumeEventStreamRecordChecks', () => {
  const unauthorizedCreateEventStreamRecord = {
    ...data.createEventStreamRecord,
    output: unauthorizedResponse,
  };

  it('requestWithStreamIdProvidedHasBeenMadeC', () => {
    const check = ConsumeEventStreamRecordChecks.requestWithStreamIdProvidedHasBeenMadeC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.createEventStreamRecord])).toStrictEqual(false);
    expect(check([unauthorizedCreateEventStreamRecord])).toStrictEqual(false);
    expect(check([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDelivered])).toStrictEqual(true);
  });

  it('hasNewStatusPropertySetToAcceptedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasNewStatusPropertySetToAcceptedC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.createEventStreamRecord])).toStrictEqual(false);
    expect(check([unauthorizedCreateEventStreamRecord])).toStrictEqual(false);
    expect(check([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDelivered])).toStrictEqual(true);
  });

  it('hasIunPopulatedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasIunPopulatedC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.createEventStreamRecord])).toStrictEqual(false);
    expect(check([unauthorizedCreateEventStreamRecord])).toStrictEqual(false);
    expect(check([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDelivered])).toStrictEqual(true);
  });

  it('hasProperlyConsumedEvents', () => {
    const check = ConsumeEventStreamRecordChecks.hasProperlyConsumedEvents(data.makeTestSystemEnv());
    expect(check([])).toStrictEqual(false);
    expect(check([data.createEventStreamRecord])).toStrictEqual(false);
    expect(check([unauthorizedCreateEventStreamRecord])).toStrictEqual(false);
    expect(check([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordInValidation])).toStrictEqual(
      false
    );
    expect(check([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDeliveredDelayed])).toStrictEqual(
      true
    );
  });

  it('matchesAtLeastOneIun', () => {
    const check = ConsumeEventStreamRecordChecks.matchesAtLeastOneIunC;
    expect(check([])(data.aIun.valid)).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecord])(data.aIun.valid)).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered])(data.aIun.invalid)).toStrictEqual(false);
    expect(check([data.consumeEventStreamRecordDelivered])(data.aIun.valid)).toStrictEqual(true);
  });
});
