import { emptyReportState, report, evaluateReport, setCheckResult } from '../reportengine';
import * as S from 'fp-ts/State';
import * as RA from 'fp-ts/ReadonlyArray';
import * as data from '../../__tests__/data';
import { pipe } from 'fp-ts/lib/function';

describe('report', () => {
  it('should record the given input', () => {
    const input = [data.preLoadRecordBulk];
    const stateReport = report(() => S.get());
    const actual = S.execute(emptyReportState)(stateReport(input));
    expect(actual.inputHistory).toStrictEqual(input);
  });

  it('should set the current check id to 0', () => {
    const input = [data.preLoadRecordBulk];
    const initialState = { ...emptyReportState, currentCheckId: 10 };
    const stateReport = report(() => S.get());
    const actual = S.execute(initialState)(stateReport(input));
    expect(actual.currentCheckId).toStrictEqual(0);
  });
});

describe('evaluateReport', () => {
  it('should return the final report', () => {
    const input = [data.preLoadRecord, data.uploadToS3Record];
    const actual = evaluateReport((record) => S.gets(() => record))(input);
    expect(actual).toStrictEqual(RA.last(input));
  });
});

describe('setCheckResult', () => {
  it('should ignore the current value if the previous one is true', () => {
    const { currentCheckId } = emptyReportState;
    const actual = S.evaluate(emptyReportState)(
      pipe(
        setCheckResult(true),
        // reset the active check
        S.apFirst(S.modify((state) => ({ ...state, currentCheckId }))),
        // set the result to false which will be ignored
        // because there is already a true
        S.apSecond(setCheckResult(false))
      )
    );
    expect(actual).toStrictEqual(true);
  });
});
