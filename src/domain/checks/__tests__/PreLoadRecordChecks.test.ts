import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import * as data from '../../__tests__/data';

// TODO: Refactor using fast-check
const ex0 = [data.preLoadRecord];
const ex1 = [data.preLoadRecord, data.preLoadRecord];

describe('PreLoadRecordChecks', () => {
  it('atLeastOnePreLoadRecordC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordC;
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(true);
  });
  it('atLeastOnePreLoadRecordWithPdfC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC;
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(true);
  });
  it('atLeastOneValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastOneValidSlotC;
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(true);
  });
  it('atLeastTwoValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastTwoValidSlotC;
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(false);
    expect(check(ex1)).toStrictEqual(true);
  });
});
