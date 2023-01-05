import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import { PreLoadRecords } from '../../__tests__/preLoadRecordData';

describe('PreLoadRecordChecks', () => {
  it('atLeastOnePreLoadRecordC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordC;
    expect(check(PreLoadRecords.empty)).toStrictEqual(false);
    expect(check(PreLoadRecords.one)).toStrictEqual(true);
    expect(check(PreLoadRecords.two)).toStrictEqual(true);
    expect(check(PreLoadRecords.oneWithMultipleFiles)).toStrictEqual(true);
  });
  it('atLeastOnePreLoadRecordWithPdfC', () => {
    const check = PreLoadRecordChecks.atLeastOnePreLoadRecordWithPdfC;
    expect(check(PreLoadRecords.empty)).toStrictEqual(false);
    expect(check(PreLoadRecords.one)).toStrictEqual(true);
    expect(check(PreLoadRecords.twoWithPdf)).toStrictEqual(true);
    expect(check(PreLoadRecords.oneWithMultipleFiles)).toStrictEqual(true);
  });
  it('atLeastOneValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastOneValidSlotC;
    expect(check(PreLoadRecords.empty)).toStrictEqual(false);
    expect(check(PreLoadRecords.one)).toStrictEqual(true);
    expect(check(PreLoadRecords.two)).toStrictEqual(true);
    expect(check(PreLoadRecords.oneWithMultipleFiles)).toStrictEqual(true);
  });
  it('atLeastTwoValidSlotC', () => {
    const check = PreLoadRecordChecks.atLeastTwoValidSlotC;
    expect(check(PreLoadRecords.one)).toStrictEqual(false);
    expect(check(PreLoadRecords.one)).toStrictEqual(false);
    expect(check(PreLoadRecords.twoWithPdf)).toStrictEqual(true);
    expect(check(PreLoadRecords.oneWithMultipleFiles)).toStrictEqual(true);
  });
});
