import * as ConsumeEventStreamRecordChecks from '../ConsumeEventStreamRecordChecks';
import * as data from '../../__tests__/data';
import { ConsumeEventStreamRecords } from '../../__tests__/consumeEventStreamRecordData';

describe('ConsumeEventStreamRecordChecks', () => {
  it('requestWithStreamIdProvidedHasBeenMadeC', () => {
    const check = ConsumeEventStreamRecordChecks.requestWithStreamIdProvidedHasBeenMadeC;
    expect(check(ConsumeEventStreamRecords.empty)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.onlyCreateRecords)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.unauthorized)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.withAcceptedEvent)).toStrictEqual(true);
  });

  it('hasNewStatusPropertySetToAcceptedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasNewStatusPropertySetToAcceptedC;
    expect(check(ConsumeEventStreamRecords.empty)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.onlyCreateRecords)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.unauthorized)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.withAcceptedEvent)).toStrictEqual(true);
  });

  it('hasIunPopulatedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasIunPopulatedC;
    expect(check(ConsumeEventStreamRecords.empty)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.onlyCreateRecords)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.unauthorized)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.withAcceptedEvent)).toStrictEqual(true);
  });

  it('hasProperlyConsumedEvents', () => {
    const check = ConsumeEventStreamRecordChecks.hasProperlyConsumedEvents(data.makeTestSystemEnv());
    expect(check(ConsumeEventStreamRecords.empty)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.onlyCreateRecords)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.unauthorized)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.withInValidationEvent)).toStrictEqual(false);
    expect(check(ConsumeEventStreamRecords.withAcceptedAndDelayedEvent)).toStrictEqual(true);
  });
});
