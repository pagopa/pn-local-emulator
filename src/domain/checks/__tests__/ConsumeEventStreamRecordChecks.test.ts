import * as ConsumeEventStreamRecordChecks from '../ConsumeEventStreamRecordChecks';
import * as data from '../../__tests__/data';
import { unauthorizedResponse } from '../../types';
import type { Record as DomainRecord } from '../../Repository';

// Helper: coerciamo gli array passati ai check al tipo union `Record` (solo a livello test)
const recs = (xs: any[]): ReadonlyArray<DomainRecord> =>
  xs as unknown as ReadonlyArray<DomainRecord>;

describe('ConsumeEventStreamRecordChecks', () => {
  // Restiamo identici a prima, ma lo tipizziamo "any" così possiamo sovrascrivere l'output
  const unauthorizedCreateEventStreamRecord: any = {
    ...data.createEventStreamRecord,
    output: unauthorizedResponse,
  };

  it('requestWithStreamIdProvidedHasBeenMadeC', () => {
    const check = ConsumeEventStreamRecordChecks.requestWithStreamIdProvidedHasBeenMadeC;
    expect(check(recs([]))).toStrictEqual(false);
    expect(check(recs([data.createEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([unauthorizedCreateEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDelivered]))).toStrictEqual(true);
  });

  it('hasNewStatusPropertySetToAcceptedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasNewStatusPropertySetToAcceptedC;
    expect(check(recs([]))).toStrictEqual(false);
    expect(check(recs([data.createEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([unauthorizedCreateEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDelivered]))).toStrictEqual(true);
  });

  it('hasIunPopulatedC', () => {
    const check = ConsumeEventStreamRecordChecks.hasIunPopulatedC;
    expect(check(recs([]))).toStrictEqual(false);
    expect(check(recs([data.createEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([unauthorizedCreateEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDelivered]))).toStrictEqual(true);
  });

  it('hasProperlyConsumedEvents', () => {
    const check = ConsumeEventStreamRecordChecks.hasProperlyConsumedEvents(data.makeTestSystemEnv());
    expect(check(recs([]))).toStrictEqual(false);
    expect(check(recs([data.createEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([unauthorizedCreateEventStreamRecord]))).toStrictEqual(false);
    expect(check(recs([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordInValidation]))).toStrictEqual(false);
    expect(check(recs([data.createTimelineEventStreamRecord, data.consumeEventStreamRecordDeliveredDelayed]))).toStrictEqual(true);
  });
});
