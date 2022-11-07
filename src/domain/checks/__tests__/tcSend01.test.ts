import * as PreLoadRecordChecks from '../PreLoadRecordChecks';
import * as data from '../../__tests__/data';

const ex0 = [data.preLoadRecord, data.preLoadRecord];

describe('TC-SEND-01', () => {
  describe('Request at least two upload slots', () => {
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
    it('atLeastTwoValidSlotC', () => {
      const check = PreLoadRecordChecks.atLeastTwoValidSlotC;
      expect(check([])).toStrictEqual(false);
      expect(check(ex0)).toStrictEqual(true);
    });
  })
});
