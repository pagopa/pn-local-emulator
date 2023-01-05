import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import * as data from '../../__tests__/data';

describe('PreLoadRecordChecks', () => {
  it('atLeastOnePreLoadRecordC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.preLoadRecord])).toStrictEqual(true);
    expect(check([data.preLoadRecordBulk])).toStrictEqual(true);
  });
  it('atLeastOnePreLoadRecordWithPdfC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.preLoadRecord])).toStrictEqual(true);
    expect(check([data.preLoadRecordBulk])).toStrictEqual(true);
  });
  it('atLeastOneValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastOneValidSlotC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.preLoadRecord])).toStrictEqual(true);
    expect(check([data.preLoadRecordBulk])).toStrictEqual(true);
  });
  it('atLeastTwoValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastTwoValidSlotC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.preLoadRecord])).toStrictEqual(false);
    expect(check([data.preLoadRecord, data.preLoadRecord])).toStrictEqual(true);
  });
});
