import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import * as useCaseData from './data';

describe('PreLoadRecordChecks', () => {
  it('atLeastOnePreLoadRecordC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.preLoadRecordSingletonList)).toStrictEqual(true);
  });
  it('atLeastOnePreLoadRecordWithPdfC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.preLoadRecordSingletonList)).toStrictEqual(true);
  });
  it('atLeastOneValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastOneValidSlotC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.preLoadRecordSingletonList)).toStrictEqual(true);
  });
  it('atLeastTwoValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastTwoValidSlotC;
    expect(check([])).toStrictEqual(false);
    expect(check(useCaseData.preLoadRecordSingletonList)).toStrictEqual(false);
    expect(check(useCaseData.preLoadRecords)).toStrictEqual(true);
  });
});
